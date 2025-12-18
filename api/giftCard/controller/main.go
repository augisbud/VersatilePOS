package controller

import (
	"fmt"
	"log"
	"net/http"

	"VersatilePOS/generic/models"
	giftCardModels "VersatilePOS/giftCard/models"
	"VersatilePOS/giftCard/service"

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

// @Summary Create a gift card
// @Description Create a new gift card with a unique code and initial value
// @Tags giftcard
// @Accept  json
// @Produce  json
// @Param   giftcard  body  models.CreateGiftCardRequest  true  "Gift card to create"
// @Success 201 {object} models.GiftCardDto
// @Failure 400 {object} models.HTTPError
// @Failure 409 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Router /giftcard [post]
// @Id createGiftCard
func (ctrl *Controller) CreateGiftCard(c *gin.Context) {
	var req giftCardModels.CreateGiftCardRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: err.Error()})
		return
	}

	giftCard, err := ctrl.service.CreateGiftCard(req)
	if err != nil {
		log.Println("Failed to create gift card:", err)
		if err.Error() == "gift card with this code already exists" {
			c.IndentedJSON(http.StatusConflict, models.HTTPError{Error: err.Error()})
			return
		}
		c.IndentedJSON(http.StatusInternalServerError, models.HTTPError{Error: "internal server error"})
		return
	}

	c.IndentedJSON(http.StatusCreated, giftCard)
}

// @Summary Get all gift cards
// @Description Get all gift cards in the system
// @Tags giftcard
// @Produce  json
// @Success 200 {array} models.GiftCardDto
// @Failure 500 {object} models.HTTPError
// @Router /giftcard [get]
// @Id getGiftCards
func (ctrl *Controller) GetGiftCards(c *gin.Context) {
	giftCards, err := ctrl.service.GetGiftCards()
	if err != nil {
		log.Println("Failed to get gift cards:", err)
		c.IndentedJSON(http.StatusInternalServerError, models.HTTPError{Error: "internal server error"})
		return
	}

	c.IndentedJSON(http.StatusOK, giftCards)
}

// @Summary Get gift card by ID
// @Description Get a specific gift card by its ID
// @Tags giftcard
// @Produce  json
// @Param   id  path  int  true  "Gift Card ID"
// @Success 200 {object} models.GiftCardDto
// @Failure 400 {object} models.HTTPError
// @Failure 404 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Router /giftcard/{id} [get]
// @Id getGiftCardById
func (ctrl *Controller) GetGiftCardByID(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: "gift card ID is required"})
		return
	}

	var giftCardID uint
	if _, err := fmt.Sscanf(id, "%d", &giftCardID); err != nil {
		c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: "invalid gift card ID"})
		return
	}

	giftCard, err := ctrl.service.GetGiftCardByID(giftCardID)
	if err != nil {
		if err.Error() == "gift card not found" {
			c.IndentedJSON(http.StatusNotFound, models.HTTPError{Error: err.Error()})
			return
		}
		log.Println("Failed to get gift card:", err)
		c.IndentedJSON(http.StatusInternalServerError, models.HTTPError{Error: "internal server error"})
		return
	}

	c.IndentedJSON(http.StatusOK, giftCard)
}

// @Summary Check gift card balance
// @Description Check the balance of a gift card by its code
// @Tags giftcard
// @Accept  json
// @Produce  json
// @Param   request  body  models.CheckBalanceRequest  true  "Gift card code"
// @Success 200 {object} models.GiftCardDto
// @Failure 400 {object} models.HTTPError
// @Failure 404 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Router /giftcard/check-balance [post]
// @Id checkGiftCardBalance
func (ctrl *Controller) CheckBalance(c *gin.Context) {
	var req giftCardModels.CheckBalanceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: err.Error()})
		return
	}

	giftCard, err := ctrl.service.GetGiftCardByCode(req.Code)
	if err != nil {
		if err.Error() == "gift card not found" {
			c.IndentedJSON(http.StatusNotFound, models.HTTPError{Error: err.Error()})
			return
		}
		log.Println("Failed to check gift card balance:", err)
		c.IndentedJSON(http.StatusInternalServerError, models.HTTPError{Error: "internal server error"})
		return
	}

	c.IndentedJSON(http.StatusOK, giftCard)
}

// @Summary Deactivate gift card
// @Description Deactivate a gift card to prevent further use
// @Tags giftcard
// @Param   id  path  int  true  "Gift Card ID"
// @Success 200
// @Failure 400 {object} models.HTTPError
// @Failure 404 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Router /giftcard/{id}/deactivate [post]
// @Id deactivateGiftCard
func (ctrl *Controller) DeactivateGiftCard(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: "gift card ID is required"})
		return
	}

	var giftCardID uint
	if _, err := fmt.Sscanf(id, "%d", &giftCardID); err != nil {
		c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: "invalid gift card ID"})
		return
	}

	err := ctrl.service.DeactivateGiftCard(giftCardID)
	if err != nil {
		if err.Error() == "gift card not found" {
			c.IndentedJSON(http.StatusNotFound, models.HTTPError{Error: err.Error()})
			return
		}
		log.Println("Failed to deactivate gift card:", err)
		c.IndentedJSON(http.StatusInternalServerError, models.HTTPError{Error: "internal server error"})
		return
	}

	c.Status(http.StatusOK)
}

func (ctrl *Controller) RegisterRoutes(r *gin.Engine) {
	giftCardGroup := r.Group("/giftcard")
	giftCardGroup.POST("", ctrl.CreateGiftCard)
	giftCardGroup.GET("", ctrl.GetGiftCards)
	giftCardGroup.GET("/:id", ctrl.GetGiftCardByID)
	giftCardGroup.POST("/check-balance", ctrl.CheckBalance)
	giftCardGroup.POST("/:id/deactivate", ctrl.DeactivateGiftCard)
}
