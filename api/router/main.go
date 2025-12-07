package router

import (
	"VersatilePOS/account"
	"VersatilePOS/business"
	"VersatilePOS/order"
	_ "VersatilePOS/docs"
	"VersatilePOS/item"
	"VersatilePOS/payment"
	"VersatilePOS/priceModifier"
	"VersatilePOS/reservation"

	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

func RegisterRoutes(r *gin.Engine) {
	account.RegisterHandlers(r)
	business.RegisterHandlers(r)
	order.RegisterHandlers(r)
	reservation.RegisterHandlers(r)
	item.RegisterHandlers(r)
	payment.RegisterHandlers(r)
	priceModifier.RegisterHandlers(r)

	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
}
