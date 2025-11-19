package main

import (
	"VersatilePOS/database"
	"VersatilePOS/router"
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

// @title VersatilePOS API
// @version 1.0
// @description VersatilePOS API
// @host localhost:8080
// @BasePath 
// @schemes http
// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description "Type 'Bearer' followed by a space and a JWT token."
func main() {
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: Error loading .env file:", err)
	}

	database.Connect()

	r := gin.Default()

	router.RegisterRoutes(r)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	host := os.Getenv("HOST")
	if host == "" {
		host = "localhost"
	}

	r.Run(host + ":" + port)
}
