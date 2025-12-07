package service

import (
	"VersatilePOS/service/controller"

	"github.com/gin-gonic/gin"
)

func RegisterHandlers(r *gin.Engine) {
	serviceController := controller.NewController()
	serviceController.RegisterRoutes(r)
}

