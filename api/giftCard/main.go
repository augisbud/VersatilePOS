package giftCard

import (
	"VersatilePOS/giftCard/controller"

	"github.com/gin-gonic/gin"
)

func RegisterHandlers(r *gin.Engine) {
	ctrl := controller.NewController()
	ctrl.RegisterRoutes(r)
}
