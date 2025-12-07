package order

import (
	"VersatilePOS/order/controller"

	"github.com/gin-gonic/gin"
)

func RegisterHandlers(r *gin.Engine) {
	orderController := controller.NewController()
	orderController.RegisterRoutes(r)
}
