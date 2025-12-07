package router

import (
	"VersatilePOS/account"
	"VersatilePOS/business"
	"VersatilePOS/payment"
	"VersatilePOS/priceModifier"
	_ "VersatilePOS/docs"

	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

func RegisterRoutes(r *gin.Engine) {
	account.RegisterHandlers(r)
	business.RegisterHandlers(r)
	payment.RegisterHandlers(r)
	priceModifier.RegisterHandlers(r)

	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
}
