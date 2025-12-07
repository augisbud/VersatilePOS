package reservation

import (
	"VersatilePOS/reservation/controller"

	"github.com/gin-gonic/gin"
)

func RegisterHandlers(r *gin.Engine) {
	reservationController := controller.NewController()
	reservationController.RegisterRoutes(r)
}

