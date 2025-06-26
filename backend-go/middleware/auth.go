package middleware

import (
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
	"github.com/MicahParks/keyfunc"
)

var jwks *keyfunc.JWKS

func init() {
	jwksURL := "https://rapid-mammal-51.clerk.accounts.dev/.well-known/jwks.json"
	var err error
	jwks, err = keyfunc.Get(jwksURL, keyfunc.Options{RefreshInterval: time.Hour})
	if err != nil {
		panic("❌ Failed to load JWKS from Clerk: " + err.Error())
	}
}

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Missing Authorization header"})
			return
		}

		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
		token, err := jwt.Parse(tokenStr, jwks.Keyfunc)
		if err != nil || !token.Valid {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid claims"})
			return
		}

		orgID, ok := claims["org_id"].(string)
		if !ok || orgID == "" {
			log.Println("🔴 JWT missing org_id")
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Missing org_id in token"})
			return
		}
		// In auth.go, update the logging
log.Printf("🔵 Incoming request path: %s", c.Request.URL.Path)
log.Printf("🟢 Authenticating request for orgID: %s", orgID)
log.Printf("🟣 Full claims: %+v", claims)
log.Printf("🟠 Token: %s", tokenStr) // Be careful with this in production

		// In auth.go, after getting orgID
log.Printf("Authenticating request for orgID: %s", orgID)
log.Printf("Full claims: %+v", claims)
		c.Set("organizationId", orgID)
		for k, v := range c.Request.Header {
			log.Println("HEADER:", k, v)
		}
		c.Next()
	}
}
