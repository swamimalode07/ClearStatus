package routes

import (

	"github.com/gin-gonic/gin"
	"status-backend/db"
)

type Incident struct {
	ID     string `json:"id"`
	Title  string `json:"title"`
	Status string `json:"status"`
	Time   string `json:"time"`
}

func RegisterIncidentRoutes(rg *gin.RouterGroup) {
	rg.GET("/incidents", getIncidents)
	rg.POST("/incidents", createIncident)
}

func getIncidents(c *gin.Context) {
	rows, err := db.DB.Query("SELECT id, title, status, time FROM incidents ORDER BY time DESC")
	if err != nil {
		c.JSON(500, gin.H{"error": "DB error"})
		return
	}
	defer rows.Close()

	var incidents []Incident
	for rows.Next() {
		var i Incident
		if err := rows.Scan(&i.ID, &i.Title, &i.Status, &i.Time); err == nil {
			incidents = append(incidents, i)
		}
	}
	c.JSON(200, incidents)
}

func createIncident(c *gin.Context) {
	var i Incident
	if err := c.BindJSON(&i); err != nil {
		c.JSON(400, gin.H{"error": "Invalid input"})
		return
	}

	err := db.DB.QueryRow(
		"INSERT INTO incidents (title, status) VALUES ($1, $2) RETURNING id, time",
		i.Title, i.Status,
	).Scan(&i.ID, &i.Time)

	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to insert"})
		return
	}

	c.JSON(200, i)
}
