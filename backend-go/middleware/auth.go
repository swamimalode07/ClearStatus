package middleware

import (
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
	"github.com/MicahParks/keyfunc"
)

var jwks *keyfunc.JWKS

func init() {
	clerkJWKSURL := "https://rapid-mammal-51.clerk.accounts.dev/.well-known/jwks.json"

	var err error
	jwks, err = keyfunc.Get(clerkJWKSURL, keyfunc.Options{
		RefreshInterval: time.Hour,
	})
	if err != nil {
		panic("❌ Failed to load JWKS from Clerk: " + err.Error())
	}
}

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Missing or invalid Authorization header"})
			c.Abort()
			return
		}

		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
		token, err := jwt.Parse(tokenStr, jwks.Keyfunc)
		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			c.Abort()
			return
		}

		c.Next()
	}
}
