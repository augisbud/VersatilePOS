package router

import (
	"VersatilePOS/account"
	"VersatilePOS/business"
	_ "VersatilePOS/docs"
	"VersatilePOS/payment"
	"VersatilePOS/priceModifier"
	"VersatilePOS/reservation"
	"VersatilePOS/service"

	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

func RegisterRoutes(r *gin.Engine) {
	account.RegisterHandlers(r)
	business.RegisterHandlers(r)
	reservation.RegisterHandlers(r)
	payment.RegisterHandlers(r)
	priceModifier.RegisterHandlers(r)
	service.RegisterHandlers(r)

	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
}
