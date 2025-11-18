package main

import (
	"VersatilePOS/internal/database"
	"VersatilePOS/internal/router"

	"github.com/gin-gonic/gin"
)

// @title POS API
// @version 1.0
// @description POS API (generated with swaggo/swag)
// @host localhost:8080
// @BasePath /
func main() {
	database.Connect()

	r := gin.Default()

	router.RegisterRoutes(r)

	r.Run("localhost:8080")
}
