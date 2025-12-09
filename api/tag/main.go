package tag

import (
	"VersatilePOS/tag/controller"
	"VersatilePOS/middleware"

	"github.com/gin-gonic/gin"
)

func RegisterHandlers(r *gin.Engine) {
	ctrl := controller.NewController()

	tagGroup := r.Group("/tag")
	tagGroup.Use(middleware.AuthMiddleware())
	{
		tagGroup.POST("", ctrl.CreateTag)
		tagGroup.GET("", ctrl.GetTags)
		tagGroup.GET("/:id", ctrl.GetTagByID)
		tagGroup.PUT("/:id", ctrl.UpdateTag)
		tagGroup.DELETE("/:id", ctrl.DeleteTag)

		// Link endpoints
		tagGroup.POST("/:id/item", ctrl.LinkItemToTag)
		tagGroup.DELETE("/:id/item/:itemId", ctrl.UnlinkItemFromTag)
		tagGroup.POST("/:id/item-option", ctrl.LinkItemOptionToTag)
		tagGroup.DELETE("/:id/item-option/:itemOptionId", ctrl.UnlinkItemOptionFromTag)
		tagGroup.POST("/:id/service", ctrl.LinkServiceToTag)
		tagGroup.DELETE("/:id/service/:serviceId", ctrl.UnlinkServiceFromTag)

		// Query endpoints - Get entities by tag
		tagGroup.GET("/:id/items", ctrl.GetItemsByTag)
		tagGroup.GET("/:id/item-options", ctrl.GetItemOptionsByTag)
		tagGroup.GET("/:id/services", ctrl.GetServicesByTag)
		tagGroup.GET("/:id/entities", ctrl.GetAllEntitiesByTag)

		// Query endpoints - Get tags by entity
		tagGroup.GET("/item/:itemId", ctrl.GetTagsByItem)
		tagGroup.GET("/item-option/:itemOptionId", ctrl.GetTagsByItemOption)
		tagGroup.GET("/service/:serviceId", ctrl.GetTagsByService)
	}
}
