package controller

import (
	genericModels "VersatilePOS/generic/models"
	itemModels "VersatilePOS/item/models"
	"VersatilePOS/item/service"
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

// @Summary Create an item
// @Description Create an item for current business
// @Tags item
// @Accept  json
// @Produce  json
// @Param   item  body  models.CreateItemRequest  true  "Item to create"
// @Success 201 {object} models.ItemDto
// @Failure 400 {object} models.HTTPError
// @Failure 401 {object} models.HTTPError
// @Failure 403 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Security BearerAuth
// @Router /item [post]
func (ctrl *Controller) CreateItem(c *gin.Context) {
	userID, err := middleware.GetUserIDFromContext(c)
	if err != nil {
		c.IndentedJSON(http.StatusUnauthorized, genericModels.HTTPError{Error: err.Error()})
		return
	}

	var req itemModels.CreateItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.IndentedJSON(http.StatusBadRequest, genericModels.HTTPError{Error: err.Error()})
		return
	}

	item, err := ctrl.service.CreateItem(req, userID)
	if err != nil {
		c.IndentedJSON(http.StatusInternalServerError, genericModels.HTTPError{Error: err.Error()})
		return
	}

	c.IndentedJSON(http.StatusCreated, item)
}

// @Summary Get all items
// @Description Get all items of current business
// @Tags item
// @Accept  json
// @Produce  json
// @Param   businessId query int true "Business ID"
// @Success 200 {array} models.ItemDto
// @Failure 400 {object} models.HTTPError
// @Failure 401 {object} models.HTTPError
// @Failure 403 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Security BearerAuth
// @Router /item [get]
func (ctrl *Controller) GetItems(c *gin.Context) {
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

	items, err := ctrl.service.GetItems(uint(businessID), userID)
	if err != nil {
		c.IndentedJSON(http.StatusInternalServerError, genericModels.HTTPError{Error: err.Error()})
		return
	}

	c.IndentedJSON(http.StatusOK, items)
}

// @Summary Get item by ID
// @Description Get item by id
// @Tags item
// @Accept  json
// @Produce  json
// @Param   id   path      int  true  "Item ID"
// @Success 200 {object} models.ItemDto
// @Failure 400 {object} models.HTTPError
// @Failure 401 {object} models.HTTPError
// @Failure 403 {object} models.HTTPError
// @Failure 404 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Security BearerAuth
// @Router /item/{id} [get]
func (ctrl *Controller) GetItemByID(c *gin.Context) {
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

	item, err := ctrl.service.GetItemByID(uint(id), userID)
	if err != nil {
		c.IndentedJSON(http.StatusInternalServerError, genericModels.HTTPError{Error: err.Error()})
		return
	}

	c.IndentedJSON(http.StatusOK, item)
}

// @Summary Update item
// @Description Edit item
// @Tags item
// @Accept  json
// @Produce  json
// @Param   id    path      int  true  "Item ID"
// @Param   item  body      models.UpdateItemRequest  true  "Item to update"
// @Success 200 {object} models.ItemDto
// @Failure 400 {object} models.HTTPError
// @Failure 401 {object} models.HTTPError
// @Failure 403 {object} models.HTTPError
// @Failure 404 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Security BearerAuth
// @Router /item/{id} [put]
func (ctrl *Controller) UpdateItem(c *gin.Context) {
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

	var req itemModels.UpdateItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.IndentedJSON(http.StatusBadRequest, genericModels.HTTPError{Error: err.Error()})
		return
	}

	item, err := ctrl.service.UpdateItem(uint(id), req, userID)
	if err != nil {
		c.IndentedJSON(http.StatusInternalServerError, genericModels.HTTPError{Error: err.Error()})
		return
	}

	c.IndentedJSON(http.StatusOK, item)
}

// @Summary Delete item
// @Description Delete an item
// @Tags item
// @Accept  json
// @Produce  json
// @Param   id   path      int  true  "Item ID"
// @Success 200 {object} models.HTTPError
// @Failure 400 {object} models.HTTPError
// @Failure 401 {object} models.HTTPError
// @Failure 403 {object} models.HTTPError
// @Failure 404 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Security BearerAuth
// @Router /item/{id} [delete]
func (ctrl *Controller) DeleteItem(c *gin.Context) {
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

	if err := ctrl.service.DeleteItem(uint(id), userID); err != nil {
		c.IndentedJSON(http.StatusInternalServerError, genericModels.HTTPError{Error: err.Error()})
		return
	}

	c.Status(http.StatusOK)
}

// @Summary Create item option
// @Description Create a new item option
// @Tags item-option
// @Accept  json
// @Produce  json
// @Param   itemOption  body  models.CreateItemOptionRequest  true  "Item option to create"
// @Success 201 {object} models.ItemOptionDto
// @Failure 400 {object} models.HTTPError
// @Failure 401 {object} models.HTTPError
// @Failure 403 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Security BearerAuth
// @Router /item-option [post]
func (ctrl *Controller) CreateItemOption(c *gin.Context) {
	userID, err := middleware.GetUserIDFromContext(c)
	if err != nil {
		c.IndentedJSON(http.StatusUnauthorized, genericModels.HTTPError{Error: err.Error()})
		return
	}

	var req itemModels.CreateItemOptionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.IndentedJSON(http.StatusBadRequest, genericModels.HTTPError{Error: err.Error()})
		return
	}

	option, err := ctrl.service.CreateItemOption(req, userID)
	if err != nil {
		c.IndentedJSON(http.StatusInternalServerError, genericModels.HTTPError{Error: err.Error()})
		return
	}

	c.IndentedJSON(http.StatusCreated, option)
}

// @Summary Get all item options
// @Description Get all item options
// @Tags item-option
// @Accept  json
// @Produce  json
// @Param   businessId query int true "Business ID"
// @Success 200 {array} models.ItemOptionDto
// @Failure 400 {object} models.HTTPError
// @Failure 401 {object} models.HTTPError
// @Failure 403 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Security BearerAuth
// @Router /item-option [get]
func (ctrl *Controller) GetItemOptions(c *gin.Context) {
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

	options, err := ctrl.service.GetItemOptions(uint(businessID), userID)
	if err != nil {
		c.IndentedJSON(http.StatusInternalServerError, genericModels.HTTPError{Error: err.Error()})
		return
	}

	c.IndentedJSON(http.StatusOK, options)
}

// @Summary Get item option by ID
// @Description Get item option by id
// @Tags item-option
// @Accept  json
// @Produce  json
// @Param   id   path      int  true  "Item Option ID"
// @Success 200 {object} models.ItemOptionDto
// @Failure 400 {object} models.HTTPError
// @Failure 401 {object} models.HTTPError
// @Failure 403 {object} models.HTTPError
// @Failure 404 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Security BearerAuth
// @Router /item-option/{id} [get]
func (ctrl *Controller) GetItemOptionByID(c *gin.Context) {
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

	option, err := ctrl.service.GetItemOptionByID(uint(id), userID)
	if err != nil {
		c.IndentedJSON(http.StatusInternalServerError, genericModels.HTTPError{Error: err.Error()})
		return
	}

	c.IndentedJSON(http.StatusOK, option)
}

// @Summary Update item option
// @Description Update an item option
// @Tags item-option
// @Accept  json
// @Produce  json
// @Param   id          path      int  true  "Item Option ID"
// @Param   itemOption  body      models.UpdateItemOptionRequest  true  "Item option to update"
// @Success 200 {object} models.ItemOptionDto
// @Failure 400 {object} models.HTTPError
// @Failure 401 {object} models.HTTPError
// @Failure 403 {object} models.HTTPError
// @Failure 404 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Security BearerAuth
// @Router /item-option/{id} [put]
func (ctrl *Controller) UpdateItemOption(c *gin.Context) {
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

	var req itemModels.UpdateItemOptionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.IndentedJSON(http.StatusBadRequest, genericModels.HTTPError{Error: err.Error()})
		return
	}

	option, err := ctrl.service.UpdateItemOption(uint(id), req, userID)
	if err != nil {
		c.IndentedJSON(http.StatusInternalServerError, genericModels.HTTPError{Error: err.Error()})
		return
	}

	c.IndentedJSON(http.StatusOK, option)
}

// @Summary Delete item option
// @Description Delete an item option
// @Tags item-option
// @Accept  json
// @Produce  json
// @Param   id   path      int  true  "Item Option ID"
// @Success 200 {object} models.HTTPError
// @Failure 400 {object} models.HTTPError
// @Failure 401 {object} models.HTTPError
// @Failure 403 {object} models.HTTPError
// @Failure 404 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Security BearerAuth
// @Router /item-option/{id} [delete]
func (ctrl *Controller) DeleteItemOption(c *gin.Context) {
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

	if err := ctrl.service.DeleteItemOption(uint(id), userID); err != nil {
		c.IndentedJSON(http.StatusInternalServerError, genericModels.HTTPError{Error: err.Error()})
		return
	}

	c.Status(http.StatusOK)
}

// @Summary Apply price modifier to item
// @Description Apply a price modifier to an item
// @Tags item
// @Accept  json
// @Produce  json
// @Param   id  path  int  true  "Item ID"
// @Param   modifier  body  models.ApplyPriceModifierToItemRequest  true  "Price modifier to apply"
// @Success 201
// @Failure 400 {object} models.HTTPError
// @Failure 401 {object} models.HTTPError
// @Failure 403 {object} models.HTTPError
// @Failure 404 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Security BearerAuth
// @Router /item/{id}/price-modifier [post]
func (ctrl *Controller) ApplyPriceModifierToItem(c *gin.Context) {
	userID, err := middleware.GetUserIDFromContext(c)
	if err != nil {
		c.IndentedJSON(http.StatusUnauthorized, genericModels.HTTPError{Error: err.Error()})
		return
	}

	itemID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, genericModels.HTTPError{Error: "invalid item id"})
		return
	}

	var req itemModels.ApplyPriceModifierToItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.IndentedJSON(http.StatusBadRequest, genericModels.HTTPError{Error: err.Error()})
		return
	}

	err = ctrl.service.ApplyPriceModifierToItem(uint(itemID), req, userID)
	if err != nil {
		if err.Error() == "item not found" {
			c.IndentedJSON(http.StatusNotFound, genericModels.HTTPError{Error: err.Error()})
			return
		}
		if err.Error() == "unauthorized to modify this item" {
			c.IndentedJSON(http.StatusForbidden, genericModels.HTTPError{Error: err.Error()})
			return
		}
		c.IndentedJSON(http.StatusInternalServerError, genericModels.HTTPError{Error: "internal server error"})
		return
	}

	c.Status(http.StatusCreated)
}

// @Summary Remove price modifier from item
// @Description Remove a price modifier from an item
// @Tags item
// @Accept  json
// @Produce  json
// @Param   id  path  int  true  "Item ID"
// @Param   priceModifierId  path  int  true  "Price Modifier ID"
// @Success 204
// @Failure 400 {object} models.HTTPError
// @Failure 401 {object} models.HTTPError
// @Failure 403 {object} models.HTTPError
// @Failure 404 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Security BearerAuth
// @Router /item/{id}/price-modifier/{priceModifierId} [delete]
func (ctrl *Controller) RemovePriceModifierFromItem(c *gin.Context) {
	userID, err := middleware.GetUserIDFromContext(c)
	if err != nil {
		c.IndentedJSON(http.StatusUnauthorized, genericModels.HTTPError{Error: err.Error()})
		return
	}

	itemID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, genericModels.HTTPError{Error: "invalid item id"})
		return
	}

	priceModifierID, err := strconv.ParseUint(c.Param("priceModifierId"), 10, 32)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, genericModels.HTTPError{Error: "invalid price modifier id"})
		return
	}

	err = ctrl.service.RemovePriceModifierFromItem(uint(itemID), uint(priceModifierID), userID)
	if err != nil {
		if err.Error() == "item not found" {
			c.IndentedJSON(http.StatusNotFound, genericModels.HTTPError{Error: err.Error()})
			return
		}
		if err.Error() == "unauthorized to modify this item" {
			c.IndentedJSON(http.StatusForbidden, genericModels.HTTPError{Error: err.Error()})
			return
		}
		c.IndentedJSON(http.StatusInternalServerError, genericModels.HTTPError{Error: "internal server error"})
		return
	}

	c.Status(http.StatusNoContent)
}

// @Summary Get item with price modifiers
// @Description Get item by id with applied price modifiers and final price
// @Tags item-price-modifier
// @Accept  json
// @Produce  json
// @Param   id   path      int  true  "Item ID"
// @Success 200 {object} models.ItemWithModifiersDto
// @Failure 400 {object} models.HTTPError
// @Failure 401 {object} models.HTTPError
// @Failure 403 {object} models.HTTPError
// @Failure 404 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Security BearerAuth
// @Router /item/{id}/with-modifiers [get]
func (ctrl *Controller) GetItemWithPriceModifiers(c *gin.Context) {
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

	item, err := ctrl.service.GetItemWithPriceModifiers(uint(id), userID)
	if err != nil {
		c.IndentedJSON(http.StatusInternalServerError, genericModels.HTTPError{Error: err.Error()})
		return
	}

	c.IndentedJSON(http.StatusOK, item)
}

// @Summary Get all items with price modifiers
// @Description Get all items with applied price modifiers and final prices
// @Tags item-price-modifier
// @Accept  json
// @Produce  json
// @Param   businessId query int true "Business ID"
// @Success 200 {array} models.ItemWithModifiersDto
// @Failure 400 {object} models.HTTPError
// @Failure 401 {object} models.HTTPError
// @Failure 403 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Security BearerAuth
// @Router /item/with-modifiers [get]
func (ctrl *Controller) GetItemsWithPriceModifiers(c *gin.Context) {
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

	items, err := ctrl.service.GetItemsWithPriceModifiers(uint(businessID), userID)
	if err != nil {
		c.IndentedJSON(http.StatusInternalServerError, genericModels.HTTPError{Error: err.Error()})
		return
	}

	c.IndentedJSON(http.StatusOK, items)
}
