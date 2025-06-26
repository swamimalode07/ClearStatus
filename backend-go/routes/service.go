package routes

import (
	"backend-go/db"
	"backend-go/models"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"encoding/json"
	"backend-go/utils"
	"os"
	"strings"
	"time"
)

func RegisterServiceRoutes(rg *gin.RouterGroup) {
	rg.GET("/services", getServices)
	rg.POST("/services", createService)
	rg.PUT("/services/:id", updateService)
	rg.DELETE("/services/:id", deleteService)
	// rg.GET("/services/:id/uptime", GetServiceUptime)
}

func getServices(c *gin.Context) {
	orgID := c.GetString("organizationId")
	log.Println("📥 Fetching services for org:", orgID)

	rows, err := db.DB.Query("SELECT id, name, status, organization_id FROM services WHERE organization_id = $1", orgID)
	if err != nil {
		log.Println("❌ DB error:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch services"})
		return
	}
	defer rows.Close()

	var services []models.Service
	for rows.Next() {
		var s models.Service
		if err := rows.Scan(&s.ID, &s.Name, &s.Status, &s.OrganizationID); err == nil {
			services = append(services, s)
		}
	}

	log.Printf("✅ %d services fetched for org %s\n", len(services), orgID)
	c.JSON(http.StatusOK, services)
}

func createService(c *gin.Context) {
	var input models.Service
	if err := c.BindJSON(&input); err != nil {
		log.Println("❌ Invalid body")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid body"})
		return
	}

	input.ID = uuid.NewString()
	input.OrganizationID = c.GetString("organizationId")

	log.Println("📦 Creating service:", input.Name, "for org:", input.OrganizationID)

	_, err := db.DB.Exec("INSERT INTO services (id, name, status, organization_id) VALUES ($1, $2, $3, $4)",
		input.ID, input.Name, input.Status, input.OrganizationID)

	if err != nil {
		log.Println("❌ Insert failed:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to insert service"})
		return
	}

	// Log status history
	_, _ = db.DB.Exec("INSERT INTO service_status_history (id, service_id, status) VALUES ($1, $2, $3)", uuid.NewString(), input.ID, input.Status)

	// Email notification
	notifyTo := os.Getenv("SMTP_NOTIFY_TO")
	if notifyTo != "" {
		to := strings.Split(notifyTo, ",")
		subject := "[StatusPage] New Service Created: " + input.Name
		body := "Service '" + input.Name + "' was created with status: " + input.Status
		_ = utils.SendEmail(to, subject, body)
	}

	log.Println("✅ Service created for org:", input.OrganizationID)
	c.JSON(http.StatusOK, input)

	// Broadcast SSE
	msg, _ := json.Marshal(map[string]interface{}{"event": "service_created", "id": input.ID})
	BroadcastSSE(string(msg))
}

func updateService(c *gin.Context) {
	orgID := c.GetString("organizationId")
	id := c.Param("id")

	var input struct {
		Name   string `json:"name"`
		Status string `json:"status"`
	}
	if err := c.BindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid body"})
		return
	}
	if input.Name == "" || input.Status == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Name and status required"})
		return
	}
	if !isValidStatus(input.Status) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid status"})
		return
	}

	// Get previous status
	var prevStatus string
	err := db.DB.QueryRow("SELECT status FROM services WHERE id=$1 AND organization_id=$2", id, orgID).Scan(&prevStatus)
	if err != nil {
		log.Println("❌ Could not fetch previous status:", err)
	}

	res, err := db.DB.Exec(
		`UPDATE services SET name=$1, status=$2 WHERE id=$3 AND organization_id=$4`,
		input.Name, input.Status, id, orgID,
	)
	if err != nil {
		log.Println("❌ Update failed:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update service"})
		return
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Service not found or not owned by org"})
		return
	}

	// Log status history only if status changed
	if prevStatus != input.Status {
		_, _ = db.DB.Exec("INSERT INTO service_status_history (id, service_id, status) VALUES ($1, $2, $3)", uuid.NewString(), id, input.Status)
	}

	c.JSON(http.StatusOK, gin.H{"id": id, "name": input.Name, "status": input.Status, "organizationId": orgID})

	// Email notification
	notifyTo := os.Getenv("SMTP_NOTIFY_TO")
	if notifyTo != "" {
		to := strings.Split(notifyTo, ",")
		subject := "[StatusPage] Service Updated: " + input.Name
		body := "Service '" + input.Name + "' was updated. New status: " + input.Status
		_ = utils.SendEmail(to, subject, body)
	}

	// Broadcast SSE
	msg, _ := json.Marshal(map[string]interface{}{"event": "service_updated", "id": id})
	BroadcastSSE(string(msg))
}

func deleteService(c *gin.Context) {
	orgID := c.GetString("organizationId")
	id := c.Param("id")
	res, err := db.DB.Exec(
		`DELETE FROM services WHERE id=$1 AND organization_id=$2`,
		id, orgID,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete service"})
		return
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Service not found or not owned by org"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"deleted": true, "id": id})

	// Broadcast SSE
	msg, _ := json.Marshal(map[string]interface{}{"event": "service_deleted", "id": id})
	BroadcastSSE(string(msg))
}

func isValidStatus(status string) bool {
	switch status {
	case "Operational", "Degraded Performance", "Partial Outage", "Major Outage":
		return true
	}
	return false
}

// Public GET handler for all services (no auth)
func PublicGetServices(c *gin.Context) {
	rows, err := db.DB.Query("SELECT id, name, status, organization_id FROM services")
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to fetch services"})
		return
	}
	defer rows.Close()

	var services []models.Service
	for rows.Next() {
		var s models.Service
		if err := rows.Scan(&s.ID, &s.Name, &s.Status, &s.OrganizationID); err == nil {
			services = append(services, s)
		}
	}
	c.JSON(200, services)
}

// getServiceUptime returns uptime percentage for a service over a period (default 7d)
func GetServiceUptime(c *gin.Context) {
	serviceID := c.Param("id")
	period := c.DefaultQuery("period", "7d")

	var duration string
	switch period {
	case "1d":
		duration = "1 day"
	case "30d":
		duration = "30 days"
	default:
		duration = "7 days"
	}

	// Get all status changes for the service in the period, ordered by changed_at
	rows, err := db.DB.Query(`SELECT status, changed_at FROM service_status_history WHERE service_id = $1 AND changed_at >= now() - INTERVAL '`+duration+`' ORDER BY changed_at ASC`, serviceID)
	if err != nil {
		log.Println("❌ DB error in GetServiceUptime:", err)
		c.JSON(500, gin.H{"error": "Failed to fetch status history", "details": err.Error()})
		return
	}
	defer rows.Close()

	type statusPoint struct {
		Status    string
		ChangedAt string
	}
	var history []statusPoint
	for rows.Next() {
		var s statusPoint
		var t time.Time
		if err := rows.Scan(&s.Status, &t); err == nil {
			s.ChangedAt = t.Format(time.RFC3339)
			history = append(history, s)
		}
	}

	// If no history, return 100% uptime (assume always up)
	if len(history) == 0 {
		c.JSON(200, gin.H{"uptime": 100.0, "history": history})
		return
	}

	// Calculate uptime percentage
	// Assume 'Operational' is up, anything else is down
	var (
		total float64
		uptime float64
	)
	end := time.Now()
	for i, h := range history {
		var next time.Time
		if i+1 < len(history) {
			next, _ = time.Parse(time.RFC3339, history[i+1].ChangedAt)
		} else {
			next = end
		}
		start, _ := time.Parse(time.RFC3339, h.ChangedAt)
		delta := next.Sub(start).Seconds()
		total += delta
		if h.Status == "Operational" {
			uptime += delta
		}
	}
	percent := 100.0
	if total > 0 {
		percent = (uptime / total) * 100.0
	}

	c.JSON(200, gin.H{
		"uptime": percent,
		"history": history,
	})
}
