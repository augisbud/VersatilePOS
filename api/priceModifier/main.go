package priceModifier

import (
	"VersatilePOS/priceModifier/controller"

	"github.com/gin-gonic/gin"
)

func RegisterHandlers(r *gin.Engine) {
	priceModifierController := controller.NewController()
	priceModifierController.RegisterRoutes(r)
}
