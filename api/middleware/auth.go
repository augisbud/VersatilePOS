package middleware

import (
	"VersatilePOS/generic/models"
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	jwt "github.com/golang-jwt/jwt/v5"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		claims, err := AuthorizeAndGetClaims(c)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, models.HTTPError{Error: err.Error()})
			return
		}

		c.Set("user", claims)
		c.Next()
	}
}

func AuthorizeAndGetClaims(c *gin.Context) (jwt.MapClaims, error) {
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		return nil, fmt.Errorf("authorization header required")
	}

	parts := strings.Split(authHeader, " ")
	if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
		return nil, fmt.Errorf("invalid authorization header format")
	}

	tokenString := parts[1]

	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(os.Getenv("JWT_SECRET")), nil
	})

	if err != nil {
		return nil, fmt.Errorf("invalid token: %v", err)
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, fmt.Errorf("invalid token")
}

func GetUserIDFromContext(c *gin.Context) (uint64, error) {
	userClaims, exists := c.Get("user")
	if !exists {
		return 0, fmt.Errorf("user not found in context")
	}

	claims, ok := userClaims.(jwt.MapClaims)
	if !ok {
		return 0, fmt.Errorf("invalid user claims in context")
	}

	id, ok := claims["id"].(float64)
	if !ok {
		return 0, fmt.Errorf("user ID not found in claims or is of invalid type")
	}

	return uint64(id), nil
}
