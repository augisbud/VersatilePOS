package main

import (
	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.Default()

	registerHandlers(router)
	registerSwagger(router)

	router.Run("localhost:8080")
}
