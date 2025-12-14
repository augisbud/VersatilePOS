package controller

import (
	paymentModels "VersatilePOS/payment/models"
	"VersatilePOS/payment/service"
	"VersatilePOS/generic/models"
	"log"
	"net/http"

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

// @Summary Create a payment
// @Description Create a payment with the provided details
// @Tags payment
// @Accept  json
// @Produce  json
// @Param   payment  body  models.CreatePaymentRequest  true  "Payment to create"
// @Success 201 {object} models.PaymentDto
// @Failure 400 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Router /payment [post]
// @Id createPayment
func (ctrl *Controller) CreatePayment(c *gin.Context) {
	var req paymentModels.CreatePaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: err.Error()})
		return
	}

	payment, err := ctrl.service.CreatePayment(req)
	if err != nil {
		log.Println("Failed to create payment:", err)
		if err.Error() == "invalid payment type" || err.Error() == "invalid payment status" {
			c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: err.Error()})
			return
		}
		c.IndentedJSON(http.StatusInternalServerError, models.HTTPError{Error: "internal server error"})
		return
	}

	c.IndentedJSON(http.StatusCreated, payment)
}

// @Summary Get all payments
// @Description Get all payments
// @Tags payment
// @Produce  json
// @Success 200 {array} models.PaymentDto
// @Failure 500 {object} models.HTTPError
// @Router /payment [get]
// @Id getPayments
func (ctrl *Controller) GetPayments(c *gin.Context) {
	payments, err := ctrl.service.GetPayments()
	if err != nil {
		log.Println("Failed to get payments:", err)
		c.IndentedJSON(http.StatusInternalServerError, models.HTTPError{Error: "internal server error"})
		return
	}

	c.IndentedJSON(http.StatusOK, payments)
}

func (ctrl *Controller) RegisterRoutes(r *gin.Engine) {
	paymentGroup := r.Group("/payment")
	paymentGroup.POST("", ctrl.CreatePayment)
	paymentGroup.GET("", ctrl.GetPayments)
}
