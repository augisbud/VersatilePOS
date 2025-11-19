package main

import (
	"VersatilePOS/database"
	"VersatilePOS/router"

	"github.com/gin-gonic/gin"
)

// @title VersatilePOS API
// @version 1.0
// @description VersatilePOS API
// @host localhost:8080
// @BasePath /
// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description "Type 'Bearer' followed by a space and a JWT token."
func main() {
	database.Connect()

	r := gin.Default()

	router.RegisterRoutes(r)

	r.Run("localhost:8080")
}
