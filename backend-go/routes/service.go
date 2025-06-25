package routes

import (
	"backend-go/db"
	"backend-go/models"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func RegisterServiceRoutes(rg *gin.RouterGroup) {
	rg.GET("/services", getServices)
	rg.POST("/services", createService)
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
}
