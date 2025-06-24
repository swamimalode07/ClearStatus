package routes

import (
	"github.com/gin-gonic/gin"
	"status-backend/db"
)

type Service struct {
	ID     string `json:"id"`
	Name   string `json:"name"`
	Status string `json:"status"`
}

func RegisterServiceRoutes(rg *gin.RouterGroup) {
	rg.GET("/services", getServices)
	rg.POST("/services", createService)
}

func getServices(c *gin.Context) {
	rows, err := db.DB.Query("SELECT id, name, status FROM services")
	if err != nil {
		c.JSON(500, gin.H{"error": "DB error"})
		return
	}
	defer rows.Close()

	var services []Service
	for rows.Next() {
		var s Service
		if err := rows.Scan(&s.ID, &s.Name, &s.Status); err == nil {
			services = append(services, s)
		}
	}
	c.JSON(200, services)
}

func createService(c *gin.Context) {
	var s Service
	if err := c.BindJSON(&s); err != nil {
		c.JSON(400, gin.H{"error": "Invalid input"})
		return
	}

	err := db.DB.QueryRow(
		"INSERT INTO services (name, status) VALUES ($1, $2) RETURNING id",
		s.Name, s.Status,
	).Scan(&s.ID)

	if err != nil {
		c.JSON(500, gin.H{"error": "DB insert failed"})
		return
	}

	c.JSON(200, s)
}
