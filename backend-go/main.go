// ✅ main.go
package main

import (
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"backend-go/db"
	"backend-go/routes"
	"backend-go/middleware"

)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("❌Error loading .env file")
	}

	db.ConnectDB()

	r := gin.Default()
	r.Use(cors.New(cors.Config{
	AllowOrigins:     []string{"http://localhost:3000"}, // or your Vercel URL after deploy
	AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
	AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
	ExposeHeaders:    []string{"Content-Length"},
	AllowCredentials: true,
}))

	api := r.Group("/api")
	api.Use(middleware.AuthMiddleware())
	{
		api.GET("/health", func(c *gin.Context) {
			c.JSON(200, gin.H{"status": "Backend is working!"})
		})

		routes.RegisterServiceRoutes(api)
		routes.RegisterIncidentRoutes(api)
	}

	// Register SSE route outside the auth group:
	routes.RegisterStreamRoutes(r.Group("/api"))

	// Register public GET endpoints for status page
	r.GET("/api/public/services", routes.PublicGetServices)
	r.GET("/api/public/incidents", routes.PublicGetIncidents)

	r.GET("/api/services/:id/uptime", routes.GetServiceUptime)

	r.Run(":8080")
}
