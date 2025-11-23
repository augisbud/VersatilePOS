package main

import (
	"VersatilePOS/database"
	"VersatilePOS/router"
	"log"
	"os"

	"github.com/gin-contrib/cors"
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

	secret := os.Getenv("JWT_SECRET")
	if len(secret) < 16 {
		log.Fatal("JWT_SECRET environment variable is not set or is too short (must be at least 16 characters)")
	}

	database.Connect()

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowAllOrigins:  true,
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: false,
	}))

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
