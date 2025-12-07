package payment

import (
	"VersatilePOS/payment/controller"

	"github.com/gin-gonic/gin"
)

func RegisterHandlers(r *gin.Engine) {
	paymentController := controller.NewController()
	paymentController.RegisterRoutes(r)
}
