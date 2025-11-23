package business

import (
	"VersatilePOS/business/controller"

	"github.com/gin-gonic/gin"
)

func RegisterHandlers(r *gin.Engine) {
	businessController := controller.NewController()
	businessController.RegisterRoutes(r)
}
