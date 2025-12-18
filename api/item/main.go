package item

import (
	"VersatilePOS/item/controller"
	"VersatilePOS/middleware"

	"github.com/gin-gonic/gin"
)

func RegisterHandlers(r *gin.Engine) {
	ctrl := controller.NewController()

	itemGroup := r.Group("/item")
	itemGroup.Use(middleware.AuthMiddleware())
	{
		itemGroup.POST("", ctrl.CreateItem)
		itemGroup.GET("", ctrl.GetItems)
		itemGroup.GET("/:id", ctrl.GetItemByID)
		itemGroup.PUT("/:id", ctrl.UpdateItem)
		itemGroup.DELETE("/:id", ctrl.DeleteItem)
		itemGroup.POST("/:id/price-modifier", ctrl.ApplyPriceModifierToItem)
		itemGroup.DELETE("/:id/price-modifier/:priceModifierId", ctrl.RemovePriceModifierFromItem)
		itemGroup.GET("/:id/with-modifiers", ctrl.GetItemWithPriceModifiers)
		itemGroup.GET("/with-modifiers", ctrl.GetItemsWithPriceModifiers)
	}

	itemOptionGroup := r.Group("/item-option")
	itemOptionGroup.Use(middleware.AuthMiddleware())
	{
		itemOptionGroup.POST("", ctrl.CreateItemOption)
		itemOptionGroup.GET("", ctrl.GetItemOptions)
		itemOptionGroup.GET("/:id", ctrl.GetItemOptionByID)
		itemOptionGroup.PUT("/:id", ctrl.UpdateItemOption)
		itemOptionGroup.DELETE("/:id", ctrl.DeleteItemOption)
	}
}
