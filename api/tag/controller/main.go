package controller

import (
	genericModels "VersatilePOS/generic/models"
	tagModels "VersatilePOS/tag/models"
	"VersatilePOS/tag/service"
	"VersatilePOS/middleware"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type Controller struct {
	service *service.Service
}

func NewController() *Controller {
	return &Controller{
		service: service.NewService(),
	}
}

// @Summary Create a tag
// @Description Create a tag for a business
// @Tags tag
// @Accept  json
// @Produce  json
// @Param   tag  body  models.CreateTagRequest  true  "Tag to create"
// @Success 201 {object} models.TagDto
// @Failure 400 {object} models.HTTPError
// @Failure 401 {object} models.HTTPError
// @Failure 403 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Security BearerAuth
// @Router /tag [post]
func (ctrl *Controller) CreateTag(c *gin.Context) {
	userID, err := middleware.GetUserIDFromContext(c)
	if err != nil {
		c.IndentedJSON(http.StatusUnauthorized, genericModels.HTTPError{Error: err.Error()})
		return
	}

	var req tagModels.CreateTagRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.IndentedJSON(http.StatusBadRequest, genericModels.HTTPError{Error: err.Error()})
		return
	}

	tag, err := ctrl.service.CreateTag(req, userID)
	if err != nil {
		c.IndentedJSON(http.StatusInternalServerError, genericModels.HTTPError{Error: err.Error()})
		return
	}

	c.IndentedJSON(http.StatusCreated, tag)
}

// @Summary Get all tags
// @Description Get all tags of a business
// @Tags tag
// @Accept  json
// @Produce  json
// @Param   businessId query int true "Business ID"
// @Success 200 {array} models.TagDto
// @Failure 400 {object} models.HTTPError
// @Failure 401 {object} models.HTTPError
// @Failure 403 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Security BearerAuth
// @Router /tag [get]
func (ctrl *Controller) GetTags(c *gin.Context) {
	userID, err := middleware.GetUserIDFromContext(c)
	if err != nil {
		c.IndentedJSON(http.StatusUnauthorized, genericModels.HTTPError{Error: err.Error()})
		return
	}

	businessIDStr := c.Query("businessId")
	if businessIDStr == "" {
		c.IndentedJSON(http.StatusBadRequest, genericModels.HTTPError{Error: "businessId query parameter is required"})
		return
	}

	businessID, err := strconv.ParseUint(businessIDStr, 10, 32)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, genericModels.HTTPError{Error: "invalid businessId"})
		return
	}

	tags, err := ctrl.service.GetTags(uint(businessID), userID)
	if err != nil {
		c.IndentedJSON(http.StatusInternalServerError, genericModels.HTTPError{Error: err.Error()})
		return
	}

	c.IndentedJSON(http.StatusOK, tags)
}

// @Summary Get tag by ID
// @Description Get tag by id
// @Tags tag
// @Accept  json
// @Produce  json
// @Param   id   path      int  true  "Tag ID"
// @Success 200 {object} models.TagDto
// @Failure 400 {object} models.HTTPError
// @Failure 401 {object} models.HTTPError
// @Failure 403 {object} models.HTTPError
// @Failure 404 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Security BearerAuth
// @Router /tag/{id} [get]
func (ctrl *Controller) GetTagByID(c *gin.Context) {
	userID, err := middleware.GetUserIDFromContext(c)
	if err != nil {
		c.IndentedJSON(http.StatusUnauthorized, genericModels.HTTPError{Error: err.Error()})
		return
	}

	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, genericModels.HTTPError{Error: "invalid id"})
		return
	}

	tag, err := ctrl.service.GetTagByID(uint(id), userID)
	if err != nil {
		c.IndentedJSON(http.StatusInternalServerError, genericModels.HTTPError{Error: err.Error()})
		return
	}

	c.IndentedJSON(http.StatusOK, tag)
}

// @Summary Update tag
// @Description Update a tag
// @Tags tag
// @Accept  json
// @Produce  json
// @Param   id    path      int  true  "Tag ID"
// @Param   tag  body      models.UpdateTagRequest  true  "Tag to update"
// @Success 200 {object} models.TagDto
// @Failure 400 {object} models.HTTPError
// @Failure 401 {object} models.HTTPError
// @Failure 403 {object} models.HTTPError
// @Failure 404 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Security BearerAuth
// @Router /tag/{id} [put]
func (ctrl *Controller) UpdateTag(c *gin.Context) {
	userID, err := middleware.GetUserIDFromContext(c)
	if err != nil {
		c.IndentedJSON(http.StatusUnauthorized, genericModels.HTTPError{Error: err.Error()})
		return
	}

	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, genericModels.HTTPError{Error: "invalid id"})
		return
	}

	var req tagModels.UpdateTagRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.IndentedJSON(http.StatusBadRequest, genericModels.HTTPError{Error: err.Error()})
		return
	}

	tag, err := ctrl.service.UpdateTag(uint(id), req, userID)
	if err != nil {
		c.IndentedJSON(http.StatusInternalServerError, genericModels.HTTPError{Error: err.Error()})
		return
	}

	c.IndentedJSON(http.StatusOK, tag)
}

// @Summary Delete tag
// @Description Delete a tag
// @Tags tag
// @Accept  json
// @Produce  json
// @Param   id   path      int  true  "Tag ID"
// @Success 200 {object} models.HTTPError
// @Failure 400 {object} models.HTTPError
// @Failure 401 {object} models.HTTPError
// @Failure 403 {object} models.HTTPError
// @Failure 404 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Security BearerAuth
// @Router /tag/{id} [delete]
func (ctrl *Controller) DeleteTag(c *gin.Context) {
	userID, err := middleware.GetUserIDFromContext(c)
	if err != nil {
		c.IndentedJSON(http.StatusUnauthorized, genericModels.HTTPError{Error: err.Error()})
		return
	}

	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, genericModels.HTTPError{Error: "invalid id"})
		return
	}

	if err := ctrl.service.DeleteTag(uint(id), userID); err != nil {
		c.IndentedJSON(http.StatusInternalServerError, genericModels.HTTPError{Error: err.Error()})
		return
	}

	c.Status(http.StatusOK)
}

// @Summary Link item to tag
// @Description Link an item to a tag
// @Tags tag
// @Accept  json
// @Produce  json
// @Param   id   path      int  true  "Tag ID"
// @Param   request  body  models.LinkItemRequest  true  "Item link request"
// @Success 200 {object} models.HTTPError
// @Failure 400 {object} models.HTTPError
// @Failure 401 {object} models.HTTPError
// @Failure 403 {object} models.HTTPError
// @Failure 404 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Security BearerAuth
// @Router /tag/{id}/item [post]
func (ctrl *Controller) LinkItemToTag(c *gin.Context) {
	userID, err := middleware.GetUserIDFromContext(c)
	if err != nil {
		c.IndentedJSON(http.StatusUnauthorized, genericModels.HTTPError{Error: err.Error()})
		return
	}

	idStr := c.Param("id")
	tagID, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, genericModels.HTTPError{Error: "invalid tag id"})
		return
	}

	var req tagModels.LinkItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.IndentedJSON(http.StatusBadRequest, genericModels.HTTPError{Error: err.Error()})
		return
	}

	if err := ctrl.service.LinkItemToTag(uint(tagID), req, userID); err != nil {
		c.IndentedJSON(http.StatusInternalServerError, genericModels.HTTPError{Error: err.Error()})
		return
	}

	c.Status(http.StatusOK)
}

// @Summary Unlink item from tag
// @Description Unlink an item from a tag
// @Tags tag
// @Accept  json
// @Produce  json
// @Param   id   path      int  true  "Tag ID"
// @Param   itemId   path      int  true  "Item ID"
// @Success 200 {object} models.HTTPError
// @Failure 400 {object} models.HTTPError
// @Failure 401 {object} models.HTTPError
// @Failure 403 {object} models.HTTPError
// @Failure 404 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Security BearerAuth
// @Router /tag/{id}/item/{itemId} [delete]
func (ctrl *Controller) UnlinkItemFromTag(c *gin.Context) {
	userID, err := middleware.GetUserIDFromContext(c)
	if err != nil {
		c.IndentedJSON(http.StatusUnauthorized, genericModels.HTTPError{Error: err.Error()})
		return
	}

	idStr := c.Param("id")
	tagID, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, genericModels.HTTPError{Error: "invalid tag id"})
		return
	}

	itemIDStr := c.Param("itemId")
	itemID, err := strconv.ParseUint(itemIDStr, 10, 32)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, genericModels.HTTPError{Error: "invalid item id"})
		return
	}

	if err := ctrl.service.UnlinkItemFromTag(uint(tagID), uint(itemID), userID); err != nil {
		c.IndentedJSON(http.StatusInternalServerError, genericModels.HTTPError{Error: err.Error()})
		return
	}

	c.Status(http.StatusOK)
}

// @Summary Link item option to tag
// @Description Link an item option to a tag
// @Tags tag
// @Accept  json
// @Produce  json
// @Param   id   path      int  true  "Tag ID"
// @Param   request  body  models.LinkItemOptionRequest  true  "Item option link request"
// @Success 200 {object} models.HTTPError
// @Failure 400 {object} models.HTTPError
// @Failure 401 {object} models.HTTPError
// @Failure 403 {object} models.HTTPError
// @Failure 404 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Security BearerAuth
// @Router /tag/{id}/item-option [post]
func (ctrl *Controller) LinkItemOptionToTag(c *gin.Context) {
	userID, err := middleware.GetUserIDFromContext(c)
	if err != nil {
		c.IndentedJSON(http.StatusUnauthorized, genericModels.HTTPError{Error: err.Error()})
		return
	}

	idStr := c.Param("id")
	tagID, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, genericModels.HTTPError{Error: "invalid tag id"})
		return
	}

	var req tagModels.LinkItemOptionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.IndentedJSON(http.StatusBadRequest, genericModels.HTTPError{Error: err.Error()})
		return
	}

	if err := ctrl.service.LinkItemOptionToTag(uint(tagID), req, userID); err != nil {
		c.IndentedJSON(http.StatusInternalServerError, genericModels.HTTPError{Error: err.Error()})
		return
	}

	c.Status(http.StatusOK)
}

// @Summary Unlink item option from tag
// @Description Unlink an item option from a tag
// @Tags tag
// @Accept  json
// @Produce  json
// @Param   id   path      int  true  "Tag ID"
// @Param   itemOptionId   path      int  true  "Item Option ID"
// @Success 200 {object} models.HTTPError
// @Failure 400 {object} models.HTTPError
// @Failure 401 {object} models.HTTPError
// @Failure 403 {object} models.HTTPError
// @Failure 404 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Security BearerAuth
// @Router /tag/{id}/item-option/{itemOptionId} [delete]
func (ctrl *Controller) UnlinkItemOptionFromTag(c *gin.Context) {
	userID, err := middleware.GetUserIDFromContext(c)
	if err != nil {
		c.IndentedJSON(http.StatusUnauthorized, genericModels.HTTPError{Error: err.Error()})
		return
	}

	idStr := c.Param("id")
	tagID, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, genericModels.HTTPError{Error: "invalid tag id"})
		return
	}

	itemOptionIDStr := c.Param("itemOptionId")
	itemOptionID, err := strconv.ParseUint(itemOptionIDStr, 10, 32)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, genericModels.HTTPError{Error: "invalid item option id"})
		return
	}

	if err := ctrl.service.UnlinkItemOptionFromTag(uint(tagID), uint(itemOptionID), userID); err != nil {
		c.IndentedJSON(http.StatusInternalServerError, genericModels.HTTPError{Error: err.Error()})
		return
	}

	c.Status(http.StatusOK)
}

// @Summary Link service to tag
// @Description Link a service to a tag
// @Tags tag
// @Accept  json
// @Produce  json
// @Param   id   path      int  true  "Tag ID"
// @Param   request  body  models.LinkServiceRequest  true  "Service link request"
// @Success 200 {object} models.HTTPError
// @Failure 400 {object} models.HTTPError
// @Failure 401 {object} models.HTTPError
// @Failure 403 {object} models.HTTPError
// @Failure 404 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Security BearerAuth
// @Router /tag/{id}/service [post]
func (ctrl *Controller) LinkServiceToTag(c *gin.Context) {
	userID, err := middleware.GetUserIDFromContext(c)
	if err != nil {
		c.IndentedJSON(http.StatusUnauthorized, genericModels.HTTPError{Error: err.Error()})
		return
	}

	idStr := c.Param("id")
	tagID, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, genericModels.HTTPError{Error: "invalid tag id"})
		return
	}

	var req tagModels.LinkServiceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.IndentedJSON(http.StatusBadRequest, genericModels.HTTPError{Error: err.Error()})
		return
	}

	if err := ctrl.service.LinkServiceToTag(uint(tagID), req, userID); err != nil {
		c.IndentedJSON(http.StatusInternalServerError, genericModels.HTTPError{Error: err.Error()})
		return
	}

	c.Status(http.StatusOK)
}

// @Summary Unlink service from tag
// @Description Unlink a service from a tag
// @Tags tag
// @Accept  json
// @Produce  json
// @Param   id   path      int  true  "Tag ID"
// @Param   serviceId   path      int  true  "Service ID"
// @Success 200 {object} models.HTTPError
// @Failure 400 {object} models.HTTPError
// @Failure 401 {object} models.HTTPError
// @Failure 403 {object} models.HTTPError
// @Failure 404 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Security BearerAuth
// @Router /tag/{id}/service/{serviceId} [delete]
func (ctrl *Controller) UnlinkServiceFromTag(c *gin.Context) {
	userID, err := middleware.GetUserIDFromContext(c)
	if err != nil {
		c.IndentedJSON(http.StatusUnauthorized, genericModels.HTTPError{Error: err.Error()})
		return
	}

	idStr := c.Param("id")
	tagID, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, genericModels.HTTPError{Error: "invalid tag id"})
		return
	}

	serviceIDStr := c.Param("serviceId")
	serviceID, err := strconv.ParseUint(serviceIDStr, 10, 32)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, genericModels.HTTPError{Error: "invalid service id"})
		return
	}

	if err := ctrl.service.UnlinkServiceFromTag(uint(tagID), uint(serviceID), userID); err != nil {
		c.IndentedJSON(http.StatusInternalServerError, genericModels.HTTPError{Error: err.Error()})
		return
	}

	c.Status(http.StatusOK)
}

// @Summary Get items by tag
// @Description Get all items linked to a tag
// @Tags tag
// @Accept  json
// @Produce  json
// @Param   id   path      int  true  "Tag ID"
// @Success 200 {array} object
// @Failure 400 {object} models.HTTPError
// @Failure 401 {object} models.HTTPError
// @Failure 403 {object} models.HTTPError
// @Failure 404 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Security BearerAuth
// @Router /tag/{id}/items [get]
func (ctrl *Controller) GetItemsByTag(c *gin.Context) {
	userID, err := middleware.GetUserIDFromContext(c)
	if err != nil {
		c.IndentedJSON(http.StatusUnauthorized, genericModels.HTTPError{Error: err.Error()})
		return
	}

	idStr := c.Param("id")
	tagID, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, genericModels.HTTPError{Error: "invalid tag id"})
		return
	}

	items, err := ctrl.service.GetItemsByTag(uint(tagID), userID)
	if err != nil {
		c.IndentedJSON(http.StatusInternalServerError, genericModels.HTTPError{Error: err.Error()})
		return
	}

	c.IndentedJSON(http.StatusOK, items)
}

// @Summary Get item options by tag
// @Description Get all item options linked to a tag
// @Tags tag
// @Accept  json
// @Produce  json
// @Param   id   path      int  true  "Tag ID"
// @Success 200 {array} object
// @Failure 400 {object} models.HTTPError
// @Failure 401 {object} models.HTTPError
// @Failure 403 {object} models.HTTPError
// @Failure 404 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Security BearerAuth
// @Router /tag/{id}/item-options [get]
func (ctrl *Controller) GetItemOptionsByTag(c *gin.Context) {
	userID, err := middleware.GetUserIDFromContext(c)
	if err != nil {
		c.IndentedJSON(http.StatusUnauthorized, genericModels.HTTPError{Error: err.Error()})
		return
	}

	idStr := c.Param("id")
	tagID, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, genericModels.HTTPError{Error: "invalid tag id"})
		return
	}

	itemOptions, err := ctrl.service.GetItemOptionsByTag(uint(tagID), userID)
	if err != nil {
		c.IndentedJSON(http.StatusInternalServerError, genericModels.HTTPError{Error: err.Error()})
		return
	}

	c.IndentedJSON(http.StatusOK, itemOptions)
}

// @Summary Get services by tag
// @Description Get all services linked to a tag
// @Tags tag
// @Accept  json
// @Produce  json
// @Param   id   path      int  true  "Tag ID"
// @Success 200 {array} object
// @Failure 400 {object} models.HTTPError
// @Failure 401 {object} models.HTTPError
// @Failure 403 {object} models.HTTPError
// @Failure 404 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Security BearerAuth
// @Router /tag/{id}/services [get]
func (ctrl *Controller) GetServicesByTag(c *gin.Context) {
	userID, err := middleware.GetUserIDFromContext(c)
	if err != nil {
		c.IndentedJSON(http.StatusUnauthorized, genericModels.HTTPError{Error: err.Error()})
		return
	}

	idStr := c.Param("id")
	tagID, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, genericModels.HTTPError{Error: "invalid tag id"})
		return
	}

	services, err := ctrl.service.GetServicesByTag(uint(tagID), userID)
	if err != nil {
		c.IndentedJSON(http.StatusInternalServerError, genericModels.HTTPError{Error: err.Error()})
		return
	}

	c.IndentedJSON(http.StatusOK, services)
}

// @Summary Get tags by item
// @Description Get all tags linked to an item
// @Tags tag
// @Accept  json
// @Produce  json
// @Param   itemId   path      int  true  "Item ID"
// @Success 200 {array} models.TagDto
// @Failure 400 {object} models.HTTPError
// @Failure 401 {object} models.HTTPError
// @Failure 403 {object} models.HTTPError
// @Failure 404 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Security BearerAuth
// @Router /tag/item/{itemId} [get]
func (ctrl *Controller) GetTagsByItem(c *gin.Context) {
	userID, err := middleware.GetUserIDFromContext(c)
	if err != nil {
		c.IndentedJSON(http.StatusUnauthorized, genericModels.HTTPError{Error: err.Error()})
		return
	}

	itemIDStr := c.Param("itemId")
	itemID, err := strconv.ParseUint(itemIDStr, 10, 32)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, genericModels.HTTPError{Error: "invalid item id"})
		return
	}

	tags, err := ctrl.service.GetTagsByItem(uint(itemID), userID)
	if err != nil {
		c.IndentedJSON(http.StatusInternalServerError, genericModels.HTTPError{Error: err.Error()})
		return
	}

	c.IndentedJSON(http.StatusOK, tags)
}

// @Summary Get tags by item option
// @Description Get all tags linked to an item option
// @Tags tag
// @Accept  json
// @Produce  json
// @Param   itemOptionId   path      int  true  "Item Option ID"
// @Success 200 {array} models.TagDto
// @Failure 400 {object} models.HTTPError
// @Failure 401 {object} models.HTTPError
// @Failure 403 {object} models.HTTPError
// @Failure 404 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Security BearerAuth
// @Router /tag/item-option/{itemOptionId} [get]
func (ctrl *Controller) GetTagsByItemOption(c *gin.Context) {
	userID, err := middleware.GetUserIDFromContext(c)
	if err != nil {
		c.IndentedJSON(http.StatusUnauthorized, genericModels.HTTPError{Error: err.Error()})
		return
	}

	itemOptionIDStr := c.Param("itemOptionId")
	itemOptionID, err := strconv.ParseUint(itemOptionIDStr, 10, 32)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, genericModels.HTTPError{Error: "invalid item option id"})
		return
	}

	tags, err := ctrl.service.GetTagsByItemOption(uint(itemOptionID), userID)
	if err != nil {
		c.IndentedJSON(http.StatusInternalServerError, genericModels.HTTPError{Error: err.Error()})
		return
	}

	c.IndentedJSON(http.StatusOK, tags)
}

// @Summary Get tags by service
// @Description Get all tags linked to a service
// @Tags tag
// @Accept  json
// @Produce  json
// @Param   serviceId   path      int  true  "Service ID"
// @Success 200 {array} models.TagDto
// @Failure 400 {object} models.HTTPError
// @Failure 401 {object} models.HTTPError
// @Failure 403 {object} models.HTTPError
// @Failure 404 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Security BearerAuth
// @Router /tag/service/{serviceId} [get]
func (ctrl *Controller) GetTagsByService(c *gin.Context) {
	userID, err := middleware.GetUserIDFromContext(c)
	if err != nil {
		c.IndentedJSON(http.StatusUnauthorized, genericModels.HTTPError{Error: err.Error()})
		return
	}

	serviceIDStr := c.Param("serviceId")
	serviceID, err := strconv.ParseUint(serviceIDStr, 10, 32)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, genericModels.HTTPError{Error: "invalid service id"})
		return
	}

	tags, err := ctrl.service.GetTagsByService(uint(serviceID), userID)
	if err != nil {
		c.IndentedJSON(http.StatusInternalServerError, genericModels.HTTPError{Error: err.Error()})
		return
	}

	c.IndentedJSON(http.StatusOK, tags)
}

// @Summary Get all entities by tag
// @Description Get all items, item options, and services linked to a tag
// @Tags tag
// @Accept  json
// @Produce  json
// @Param   id   path      int  true  "Tag ID"
// @Success 200 {object} models.TagEntitiesResponse
// @Failure 400 {object} models.HTTPError
// @Failure 401 {object} models.HTTPError
// @Failure 403 {object} models.HTTPError
// @Failure 404 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Security BearerAuth
// @Router /tag/{id}/entities [get]
func (ctrl *Controller) GetAllEntitiesByTag(c *gin.Context) {
	userID, err := middleware.GetUserIDFromContext(c)
	if err != nil {
		c.IndentedJSON(http.StatusUnauthorized, genericModels.HTTPError{Error: err.Error()})
		return
	}

	idStr := c.Param("id")
	tagID, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, genericModels.HTTPError{Error: "invalid tag id"})
		return
	}

	entities, err := ctrl.service.GetAllEntitiesByTag(uint(tagID), userID)
	if err != nil {
		c.IndentedJSON(http.StatusInternalServerError, genericModels.HTTPError{Error: err.Error()})
		return
	}

	c.IndentedJSON(http.StatusOK, entities)
}
