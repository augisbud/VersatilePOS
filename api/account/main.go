package account

import (
	"VersatilePOS/account/controller"

	"github.com/gin-gonic/gin"
)

func RegisterHandlers(r *gin.Engine) {
	accountController := controller.NewController()
	accountController.RegisterRoutes(r)
}
