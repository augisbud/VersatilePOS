package controller

import (
	priceModifierModels "VersatilePOS/priceModifier/models"
	"VersatilePOS/priceModifier/service"
	"VersatilePOS/generic/models"
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
// @Success 201 {object} models.PriceModifierDto
// @Failure 400 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Router /price-modifier [post]
// @Id createPriceModifier
func (ctrl *Controller) CreatePriceModifier(c *gin.Context) {
	var req priceModifierModels.CreatePriceModifierRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: err.Error()})
		return
	}

	priceModifier, err := ctrl.service.CreatePriceModifier(req)
	if err != nil {
		log.Println("Failed to create price modifier:", err)
		if err.Error() == "invalid modifier type" {
			c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: err.Error()})
			return
		}
		c.IndentedJSON(http.StatusInternalServerError, models.HTTPError{Error: "internal server error"})
		return
	}

	c.IndentedJSON(http.StatusCreated, priceModifier)
}

// @Summary Get all price modifiers
// @Description Get all price modifiers
// @Tags price-modifier
// @Produce  json
// @Success 200 {array} models.PriceModifierDto
// @Failure 500 {object} models.HTTPError
// @Router /price-modifier [get]
// @Id getPriceModifiers
func (ctrl *Controller) GetPriceModifiers(c *gin.Context) {
	priceModifiers, err := ctrl.service.GetPriceModifiers()
	if err != nil {
		log.Println("Failed to get price modifiers:", err)
		c.IndentedJSON(http.StatusInternalServerError, models.HTTPError{Error: "internal server error"})
		return
	}

	c.IndentedJSON(http.StatusOK, priceModifiers)
}

// @Summary Get price modifier by id
// @Description Get price modifier information by id
// @Tags price-modifier
// @Produce  json
// @Param   id   path      int  true  "Price Modifier ID"
// @Success 200 {object} models.PriceModifierDto
// @Failure 404 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Router /price-modifier/{id} [get]
// @Id getPriceModifierById
func (ctrl *Controller) GetPriceModifierById(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: "Invalid price modifier ID"})
		return
	}

	priceModifier, err := ctrl.service.GetPriceModifierByID(uint(id))
	if err != nil {
		switch err.Error() {
		case "price modifier not found":
			c.IndentedJSON(http.StatusNotFound, models.HTTPError{Error: err.Error()})
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
// @Param   priceModifier  body  models.UpdatePriceModifierRequest  true  "Price modifier details to update"
// @Success 200 {object} models.PriceModifierDto
// @Failure 400 {object} models.HTTPError
// @Failure 404 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Router /price-modifier/{id} [put]
// @Id updatePriceModifier
func (ctrl *Controller) UpdatePriceModifier(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: "Invalid price modifier ID"})
		return
	}

	var req priceModifierModels.UpdatePriceModifierRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: err.Error()})
		return
	}

	priceModifier, err := ctrl.service.UpdatePriceModifier(uint(id), req)
	if err != nil {
		switch err.Error() {
		case "price modifier not found":
			c.IndentedJSON(http.StatusNotFound, models.HTTPError{Error: err.Error()})
		case "invalid modifier type":
			c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: err.Error()})
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
// @Success 200 {object} map[string]string
// @Failure 400 {object} models.HTTPError
// @Failure 404 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Router /price-modifier/{id} [delete]
// @Id deletePriceModifier
func (ctrl *Controller) DeletePriceModifier(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: "Invalid price modifier ID"})
		return
	}

	err = ctrl.service.DeletePriceModifier(uint(id))
	if err != nil {
		switch err.Error() {
		case "price modifier not found":
			c.IndentedJSON(http.StatusNotFound, models.HTTPError{Error: err.Error()})
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
	priceModifierGroup.POST("", ctrl.CreatePriceModifier)
	priceModifierGroup.GET("", ctrl.GetPriceModifiers)
	priceModifierGroup.GET("/:id", ctrl.GetPriceModifierById)
	priceModifierGroup.PUT("/:id", ctrl.UpdatePriceModifier)
	priceModifierGroup.DELETE("/:id", ctrl.DeletePriceModifier)
}
