package routes

import (
	"backend-go/db"
	"backend-go/models"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"encoding/json"
)

func RegisterServiceRoutes(rg *gin.RouterGroup) {
	rg.GET("/services", getServices)
	rg.POST("/services", createService)
	rg.PUT("/services/:id", updateService)
	rg.DELETE("/services/:id", deleteService)
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
	c.JSON(http.StatusOK, gin.H{"id": id, "name": input.Name, "status": input.Status, "organizationId": orgID})

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
