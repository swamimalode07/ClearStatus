package routes

import (
	"backend-go/db"
	"backend-go/models"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func RegisterIncidentRoutes(rg *gin.RouterGroup) {
	rg.GET("/incidents", getIncidents)
	rg.POST("/incidents", createIncident)
}

func getIncidents(c *gin.Context) {
	orgID := c.GetString("organizationId")
	rows, err := db.DB.Query("SELECT id, title, status, time, organization_id FROM incidents WHERE organization_id = $1 ORDER BY time DESC", orgID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch incidents"})
		return
	}
	defer rows.Close()

	var incidents []models.Incident
	for rows.Next() {
		var i models.Incident
		if err := rows.Scan(&i.ID, &i.Title, &i.Status, &i.Time, &i.OrganizationID); err == nil {
			incidents = append(incidents, i)
		}
	}
	c.JSON(http.StatusOK, incidents)
}

func createIncident(c *gin.Context) {
	var input struct {
		Title  string `json:"title"`
		Status string `json:"status"`
	}

	if err := c.BindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid body"})
		return
	}

	incident := models.Incident{
		ID:             uuid.NewString(),
		Title:          input.Title,
		Status:         input.Status,
		Time:           time.Now(),
		OrganizationID: c.GetString("organizationId"),
	}

	_, err := db.DB.Exec("INSERT INTO incidents (id, title, status, time, organization_id) VALUES ($1, $2, $3, $4, $5)",
		incident.ID, incident.Title, incident.Status, incident.Time, incident.OrganizationID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to insert incident"})
		return
	}

	c.JSON(http.StatusOK, incident)
}
