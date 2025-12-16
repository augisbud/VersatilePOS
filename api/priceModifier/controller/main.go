package controller

import (
	priceModifierModels "VersatilePOS/priceModifier/models"
	"VersatilePOS/priceModifier/service"
	"VersatilePOS/generic/models"
	"VersatilePOS/middleware"
	"log"
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

// @Summary Create a price modifier
// @Description Create a price modifier with the provided details
// @Tags price-modifier
// @Accept  json
// @Produce  json
// @Param   priceModifier  body  models.CreatePriceModifierRequest  true  "Price modifier to create"
// @Success 201
// @Failure 400 {object} models.HTTPError
// @Failure 401 {object} models.HTTPError
// @Failure 403 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Security BearerAuth
// @Router /price-modifier [post]
// @Id createPriceModifier
func (ctrl *Controller) CreatePriceModifier(c *gin.Context) {
	userID, err := middleware.GetUserIDFromContext(c)
	if err != nil {
		c.IndentedJSON(http.StatusUnauthorized, models.HTTPError{Error: err.Error()})
		return
	}

	var req priceModifierModels.CreatePriceModifierRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: err.Error()})
		return
	}

	priceModifier, err := ctrl.service.CreatePriceModifier(req, userID)
	if err != nil {
		log.Println("Failed to create price modifier:", err)
		switch err.Error() {
		case "invalid modifier type":
			c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: err.Error()})
		case "unauthorized to create price modifiers for this business":
			c.IndentedJSON(http.StatusForbidden, models.HTTPError{Error: err.Error()})
		case "failed to verify permissions":
			c.IndentedJSON(http.StatusInternalServerError, models.HTTPError{Error: err.Error()})
		default:
			log.Println("Failed to create price modifier:", err)
			c.IndentedJSON(http.StatusInternalServerError, models.HTTPError{Error: "internal server error"})
		}
		return
	}

	c.IndentedJSON(http.StatusCreated, priceModifier)
}

// @Summary Get all price modifiers
// @Description Get all price modifiers
// @Tags price-modifier
// @Produce  json
// @Success 200
// @Param   businessId   query     int  true  "Business ID"
// @Failure 400 {object} models.HTTPError
// @Failure 401 {object} models.HTTPError
// @Failure 403 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Security BearerAuth
// @Router /price-modifier [get]
// @Id getPriceModifiers
func (ctrl *Controller) GetPriceModifiers(c *gin.Context) {
	userID, err := middleware.GetUserIDFromContext(c)
	if err != nil {
		c.IndentedJSON(http.StatusUnauthorized, models.HTTPError{Error: err.Error()})
		return
	}

	businessIDStr := c.Query("businessId")
	if businessIDStr == "" {
		c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: "businessId query parameter is required"})
		return
	}

	businessID, err := strconv.ParseUint(businessIDStr, 10, 32)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: "Invalid business ID"})
		return
	}

	priceModifiers, err := ctrl.service.GetPriceModifiers(uint(businessID), userID)
	if err != nil {
		switch err.Error() {
		case "unauthorized to view price modifiers for this business":
			c.IndentedJSON(http.StatusForbidden, models.HTTPError{Error: err.Error()})
		case "failed to verify permissions":
			c.IndentedJSON(http.StatusInternalServerError, models.HTTPError{Error: err.Error()})
		default:
			log.Println("Failed to get price modifiers:", err)
			c.IndentedJSON(http.StatusInternalServerError, models.HTTPError{Error: "internal server error"})
		}
		return
	}

	c.IndentedJSON(http.StatusOK, priceModifiers)
}

// @Summary Get price modifier by id
// @Description Get price modifier information by id
// @Tags price-modifier
// @Produce  json
// @Param   id   path      int  true  "Price Modifier ID"
// @Param   businessId   query     int  true  "Business ID"
// @Success 200
// @Failure 400 {object} models.HTTPError
// @Failure 401 {object} models.HTTPError
// @Failure 403 {object} models.HTTPError
// @Failure 404 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Security BearerAuth
// @Router /price-modifier/{id} [get]
// @Id getPriceModifierById
func (ctrl *Controller) GetPriceModifierById(c *gin.Context) {
	userID, err := middleware.GetUserIDFromContext(c)
	if err != nil {
		c.IndentedJSON(http.StatusUnauthorized, models.HTTPError{Error: err.Error()})
		return
	}

	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: "Invalid price modifier ID"})
		return
	}

	businessIDStr := c.Query("businessId")
	if businessIDStr == "" {
		c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: "businessId query parameter is required"})
		return
	}

	businessID, err := strconv.ParseUint(businessIDStr, 10, 32)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: "Invalid business ID"})
		return
	}

	priceModifier, err := ctrl.service.GetPriceModifierByID(uint(id), uint(businessID), userID)
	if err != nil {
		switch err.Error() {
		case "price modifier not found":
			c.IndentedJSON(http.StatusNotFound, models.HTTPError{Error: err.Error()})
		case "unauthorized to view price modifiers for this business":
			c.IndentedJSON(http.StatusForbidden, models.HTTPError{Error: err.Error()})
		case "failed to verify permissions":
			c.IndentedJSON(http.StatusInternalServerError, models.HTTPError{Error: err.Error()})
		default:
			log.Println("Failed to get price modifier:", err)
			c.IndentedJSON(http.StatusInternalServerError, models.HTTPError{Error: "internal server error"})
		}
		return
	}

	c.IndentedJSON(http.StatusOK, priceModifier)
}

// @Summary Update price modifier details
// @Description Update price modifier details
// @Tags price-modifier
// @Accept  json
// @Produce  json
// @Param   id   path      int  true  "Price Modifier ID"
// @Param   businessId   query     int  true  "Business ID"
// @Param   priceModifier  body  models.UpdatePriceModifierRequest  true  "Price modifier details to update"
// @Success 200
// @Failure 400 {object} models.HTTPError
// @Failure 401 {object} models.HTTPError
// @Failure 403 {object} models.HTTPError
// @Failure 404 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Security BearerAuth
// @Router /price-modifier/{id} [put]
// @Id updatePriceModifier
func (ctrl *Controller) UpdatePriceModifier(c *gin.Context) {
	userID, err := middleware.GetUserIDFromContext(c)
	if err != nil {
		c.IndentedJSON(http.StatusUnauthorized, models.HTTPError{Error: err.Error()})
		return
	}

	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: "Invalid price modifier ID"})
		return
	}

	businessIDStr := c.Query("businessId")
	if businessIDStr == "" {
		c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: "businessId query parameter is required"})
		return
	}

	businessID, err := strconv.ParseUint(businessIDStr, 10, 32)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: "Invalid business ID"})
		return
	}

	var req priceModifierModels.UpdatePriceModifierRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: err.Error()})
		return
	}

	priceModifier, err := ctrl.service.UpdatePriceModifier(uint(id), uint(businessID), req, userID)
	if err != nil {
		switch err.Error() {
		case "price modifier not found":
			c.IndentedJSON(http.StatusNotFound, models.HTTPError{Error: err.Error()})
		case "invalid modifier type":
			c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: err.Error()})
		case "unauthorized to update price modifiers for this business":
			c.IndentedJSON(http.StatusForbidden, models.HTTPError{Error: err.Error()})
		case "failed to verify permissions":
			c.IndentedJSON(http.StatusInternalServerError, models.HTTPError{Error: err.Error()})
		default:
			log.Println("Failed to update price modifier:", err)
			c.IndentedJSON(http.StatusInternalServerError, models.HTTPError{Error: "internal server error"})
		}
		return
	}

	c.IndentedJSON(http.StatusOK, priceModifier)
}

// @Summary Delete price modifier
// @Description Delete price modifier by id
// @Tags price-modifier
// @Produce  json
// @Param   id   path      int  true  "Price Modifier ID"
// @Param   businessId   query     int  true  "Business ID"
// @Success 200 {object} map[string]string
// @Failure 400 {object} models.HTTPError
// @Failure 401 {object} models.HTTPError
// @Failure 403 {object} models.HTTPError
// @Failure 404 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Security BearerAuth
// @Router /price-modifier/{id} [delete]
// @Id deletePriceModifier
func (ctrl *Controller) DeletePriceModifier(c *gin.Context) {
	userID, err := middleware.GetUserIDFromContext(c)
	if err != nil {
		c.IndentedJSON(http.StatusUnauthorized, models.HTTPError{Error: err.Error()})
		return
	}

	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: "Invalid price modifier ID"})
		return
	}

	businessIDStr := c.Query("businessId")
	if businessIDStr == "" {
		c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: "businessId query parameter is required"})
		return
	}

	businessID, err := strconv.ParseUint(businessIDStr, 10, 32)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: "Invalid business ID"})
		return
	}

	err = ctrl.service.DeletePriceModifier(uint(id), uint(businessID), userID)
	if err != nil {
		switch err.Error() {
		case "price modifier not found":
			c.IndentedJSON(http.StatusNotFound, models.HTTPError{Error: err.Error()})
		case "unauthorized to delete price modifiers for this business":
			c.IndentedJSON(http.StatusForbidden, models.HTTPError{Error: err.Error()})
		case "failed to verify permissions":
			c.IndentedJSON(http.StatusInternalServerError, models.HTTPError{Error: err.Error()})
		default:
			log.Println("Failed to delete price modifier:", err)
			c.IndentedJSON(http.StatusInternalServerError, models.HTTPError{Error: "internal server error"})
		}
		return
	}

	c.IndentedJSON(http.StatusOK, gin.H{"message": "Price modifier deleted successfully"})
}

func (ctrl *Controller) RegisterRoutes(r *gin.Engine) {
	priceModifierGroup := r.Group("/price-modifier")
	priceModifierGroup.Use(middleware.AuthMiddleware())
	priceModifierGroup.POST("", ctrl.CreatePriceModifier)
	priceModifierGroup.GET("", ctrl.GetPriceModifiers)
	priceModifierGroup.GET("/:id", ctrl.GetPriceModifierById)
	priceModifierGroup.PUT("/:id", ctrl.UpdatePriceModifier)
	priceModifierGroup.DELETE("/:id", ctrl.DeletePriceModifier)
}
