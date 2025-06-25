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

func RegisterIncidentRoutes(rg *gin.RouterGroup) {
	rg.GET("/incidents", getIncidents)
	rg.POST("/incidents", createIncident)
	rg.PUT("/incidents/:id", updateIncident)
	rg.POST("/incidents/:id/update", addIncidentUpdate)
}

// GET /incidents (org-scoped, with services and updates)
func getIncidents(c *gin.Context) {
	orgID := c.GetString("organizationId")
	rows, err := db.DB.Query(`SELECT id, title, description, type, status, is_resolved, organization_id, created_at, updated_at FROM incidents WHERE organization_id = $1 ORDER BY created_at DESC`, orgID)
	if err != nil {
		log.Println("❌ DB error:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch incidents"})
		return
	}
	defer rows.Close()

	var incidents []models.Incident
	for rows.Next() {
		var i models.Incident
		if err := rows.Scan(&i.ID, &i.Title, &i.Description, &i.Type, &i.Status, &i.IsResolved, &i.OrganizationID, &i.CreatedAt, &i.UpdatedAt); err == nil {
			// Fetch affected services
			svcRows, _ := db.DB.Query(`SELECT s.id, s.name, s.status, s.organization_id FROM services s JOIN incident_services isv ON s.id = isv.service_id WHERE isv.incident_id = $1`, i.ID)
			for svcRows.Next() {
				var s models.Service
				if err := svcRows.Scan(&s.ID, &s.Name, &s.Status, &s.OrganizationID); err == nil {
					i.Services = append(i.Services, s)
				}
			}
			svcRows.Close()
			// Fetch updates
			updRows, _ := db.DB.Query(`SELECT id, incident_id, message, created_at FROM incident_updates WHERE incident_id = $1 ORDER BY created_at ASC`, i.ID)
			for updRows.Next() {
				var u models.IncidentUpdate
				if err := updRows.Scan(&u.ID, &u.IncidentID, &u.Message, &u.CreatedAt); err == nil {
					i.Updates = append(i.Updates, u)
				}
			}
			updRows.Close()
			incidents = append(incidents, i)
		}
	}
	c.JSON(http.StatusOK, incidents)
}

// POST /incidents (create incident/maintenance)
func createIncident(c *gin.Context) {
	var input struct {
		Title       string   `json:"title"`
		Description string   `json:"description"`
		Type        string   `json:"type"`
		Status      string   `json:"status"`
		ServiceIDs  []string `json:"serviceIds"`
	}
	if err := c.BindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid body"})
		return
	}
	id := uuid.NewString()
	orgID := c.GetString("organizationId")
	_, err := db.DB.Exec(`INSERT INTO incidents (id, title, description, type, status, is_resolved, organization_id) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
		id, input.Title, input.Description, input.Type, input.Status, false, orgID)
	if err != nil {
		log.Println("❌ Insert failed:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to insert incident"})
		return
	}
	for _, sid := range input.ServiceIDs {
		_, _ = db.DB.Exec(`INSERT INTO incident_services (incident_id, service_id) VALUES ($1, $2)`, id, sid)
	}
	c.JSON(http.StatusOK, gin.H{"id": id})

	// Broadcast SSE
	msg, _ := json.Marshal(map[string]interface{}{"event": "incident_created", "id": id})
	BroadcastSSE(string(msg))
}

// PUT /incidents/:id (update/resolve, update services)
func updateIncident(c *gin.Context) {
	id := c.Param("id")
	orgID := c.GetString("organizationId")
	var input struct {
		Title       string   `json:"title"`
		Description string   `json:"description"`
		Type        string   `json:"type"`
		Status      string   `json:"status"`
		IsResolved  bool     `json:"isResolved"`
		ServiceIDs  []string `json:"serviceIds"`
	}
	if err := c.BindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid body"})
		return
	}
	_, err := db.DB.Exec(`UPDATE incidents SET title=$1, description=$2, type=$3, status=$4, is_resolved=$5, updated_at=now() WHERE id=$6 AND organization_id=$7`,
		input.Title, input.Description, input.Type, input.Status, input.IsResolved, id, orgID)
	if err != nil {
		log.Println("❌ Update failed:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update incident"})
		return
	}
	// Update affected services
	_, _ = db.DB.Exec(`DELETE FROM incident_services WHERE incident_id = $1`, id)
	for _, sid := range input.ServiceIDs {
		_, _ = db.DB.Exec(`INSERT INTO incident_services (incident_id, service_id) VALUES ($1, $2)`, id, sid)
	}
	c.JSON(http.StatusOK, gin.H{"id": id})

	// Broadcast SSE
	msg, _ := json.Marshal(map[string]interface{}{"event": "incident_updated", "id": id})
	BroadcastSSE(string(msg))
}

// POST /incidents/:id/update (add update message)
func addIncidentUpdate(c *gin.Context) {
	id := c.Param("id")
	var input struct {
		Message string `json:"message"`
	}
	if err := c.BindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid body"})
		return
	}
	uid := uuid.NewString()
	_, err := db.DB.Exec(`INSERT INTO incident_updates (id, incident_id, message) VALUES ($1, $2, $3)`, uid, id, input.Message)
	if err != nil {
		log.Println("❌ Insert update failed:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add update"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"id": uid})

	// Broadcast SSE
	msg, _ := json.Marshal(map[string]interface{}{"event": "incident_update_added", "id": id})
	BroadcastSSE(string(msg))
}

// Public GET handler for all incidents (no auth)
func PublicGetIncidents(c *gin.Context) {
	rows, err := db.DB.Query("SELECT id, title, description, type, status, is_resolved, organization_id, created_at, updated_at FROM incidents ORDER BY created_at DESC")
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to fetch incidents"})
		return
	}
	defer rows.Close()

	var incidents []models.Incident
	for rows.Next() {
		var i models.Incident
		if err := rows.Scan(&i.ID, &i.Title, &i.Description, &i.Type, &i.Status, &i.IsResolved, &i.OrganizationID, &i.CreatedAt, &i.UpdatedAt); err == nil {
			// Fetch affected services
			svcRows, _ := db.DB.Query(`SELECT s.id, s.name, s.status, s.organization_id FROM services s JOIN incident_services isv ON s.id = isv.service_id WHERE isv.incident_id = $1`, i.ID)
			for svcRows.Next() {
				var s models.Service
				if err := svcRows.Scan(&s.ID, &s.Name, &s.Status, &s.OrganizationID); err == nil {
					i.Services = append(i.Services, s)
				}
			}
			svcRows.Close()
			// Fetch updates
			updRows, _ := db.DB.Query(`SELECT id, incident_id, message, created_at FROM incident_updates WHERE incident_id = $1 ORDER BY created_at ASC`, i.ID)
			for updRows.Next() {
				var u models.IncidentUpdate
				if err := updRows.Scan(&u.ID, &u.IncidentID, &u.Message, &u.CreatedAt); err == nil {
					i.Updates = append(i.Updates, u)
				}
			}
			updRows.Close()
			incidents = append(incidents, i)
		}
	}
	c.JSON(200, incidents)
}
