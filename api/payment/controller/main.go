package controller

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"

	paymentModels "VersatilePOS/payment/models"
	"VersatilePOS/payment/service"
	"VersatilePOS/generic/models"

	"github.com/gin-gonic/gin"
	"github.com/stripe/stripe-go/v78"
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

// @Summary Create a Stripe payment intent
// @Description Create a Stripe payment intent for card payments
// @Tags payment
// @Accept  json
// @Produce  json
// @Param   request  body  models.CreateStripePaymentRequest  true  "Stripe payment request"
// @Success 201 {object} models.CreateStripePaymentResponse
// @Failure 400 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Router /payment/stripe/create-intent [post]
// @Id createStripePaymentIntent
func (ctrl *Controller) CreateStripePaymentIntent(c *gin.Context) {
	var req paymentModels.CreateStripePaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: err.Error()})
		return
	}

	response, err := ctrl.service.CreateStripePaymentIntent(req)
	if err != nil {
		log.Println("Failed to create Stripe payment intent:", err)
		if err.Error() == "Stripe service is not configured" {
			c.IndentedJSON(http.StatusServiceUnavailable, models.HTTPError{Error: err.Error()})
			return
		}
		c.IndentedJSON(http.StatusInternalServerError, models.HTTPError{Error: "internal server error"})
		return
	}

	c.IndentedJSON(http.StatusCreated, response)
}

// @Summary Handle Stripe webhook
// @Description Handle webhook events from Stripe
// @Tags payment
// @Accept  json
// @Produce  json
// @Success 200
// @Failure 400 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Router /payment/stripe/webhook [post]
// @Id handleStripeWebhook
func (ctrl *Controller) HandleStripeWebhook(c *gin.Context) {
	body, err := io.ReadAll(c.Request.Body)
	if err != nil {
		log.Println("Failed to read webhook body:", err)
		c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: "failed to read request body"})
		return
	}

	signature := c.GetHeader("Stripe-Signature")
	
	// Verify webhook signature and get event
	// For local development, signature may be empty when using Stripe CLI without --forward-connect-to
	event, err := ctrl.service.VerifyWebhookSignature(body, signature)
	if err != nil {
		log.Printf("Failed to verify webhook signature (this is OK for local dev): %v\n", err)
		// For local development, try to parse event directly
		if signature == "" {
			var eventData stripe.Event
			if jsonErr := json.Unmarshal(body, &eventData); jsonErr != nil {
				c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: "failed to parse webhook event"})
				return
			}
			event = &eventData
		} else {
			c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: "invalid signature"})
			return
		}
	}

	// Handle the event
	switch event.Type {
	case "payment_intent.succeeded":
		var paymentIntent stripe.PaymentIntent
		err := json.Unmarshal(event.Data.Raw, &paymentIntent)
		if err != nil {
			log.Println("Failed to unmarshal payment intent:", err)
			c.IndentedJSON(http.StatusInternalServerError, models.HTTPError{Error: "internal server error"})
			return
		}
		if err := ctrl.service.ConfirmStripePayment(paymentIntent.ID); err != nil {
			log.Println("Failed to confirm payment:", err)
			c.IndentedJSON(http.StatusInternalServerError, models.HTTPError{Error: "internal server error"})
			return
		}

	case "payment_intent.payment_failed":
		var paymentIntent stripe.PaymentIntent
		err := json.Unmarshal(event.Data.Raw, &paymentIntent)
		if err != nil {
			log.Println("Failed to unmarshal payment intent:", err)
			c.IndentedJSON(http.StatusInternalServerError, models.HTTPError{Error: "internal server error"})
			return
		}
		if err := ctrl.service.UpdatePaymentStatusByString(paymentIntent.ID, "Failed"); err != nil {
			log.Println("Failed to update payment status:", err)
			c.IndentedJSON(http.StatusInternalServerError, models.HTTPError{Error: "internal server error"})
			return
		}

	case "payment_intent.canceled":
		var paymentIntent stripe.PaymentIntent
		err := json.Unmarshal(event.Data.Raw, &paymentIntent)
		if err != nil {
			log.Println("Failed to unmarshal payment intent:", err)
			c.IndentedJSON(http.StatusInternalServerError, models.HTTPError{Error: "internal server error"})
			return
		}
		if err := ctrl.service.UpdatePaymentStatusByString(paymentIntent.ID, "Failed"); err != nil {
			log.Println("Failed to update payment status:", err)
			c.IndentedJSON(http.StatusInternalServerError, models.HTTPError{Error: "internal server error"})
			return
		}

	default:
		log.Printf("Unhandled event type: %s\n", event.Type)
	}

	c.IndentedJSON(http.StatusOK, gin.H{"received": true})
}

// @Summary Get payment by ID
// @Description Get a payment by its ID
// @Tags payment
// @Produce  json
// @Param   id  path  int  true  "Payment ID"
// @Success 200 {object} models.PaymentDto
// @Failure 400 {object} models.HTTPError
// @Failure 404 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Router /payment/{id} [get]
// @Id getPaymentById
func (ctrl *Controller) GetPaymentByID(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: "payment ID is required"})
		return
	}

	var paymentID uint
	if _, err := fmt.Sscanf(id, "%d", &paymentID); err != nil {
		c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: "invalid payment ID"})
		return
	}

	payment, err := ctrl.service.GetPaymentByID(paymentID)
	if err != nil {
		if err.Error() == "payment not found" {
			c.IndentedJSON(http.StatusNotFound, models.HTTPError{Error: err.Error()})
			return
		}
		log.Println("Failed to get payment:", err)
		c.IndentedJSON(http.StatusInternalServerError, models.HTTPError{Error: "internal server error"})
		return
	}

	c.IndentedJSON(http.StatusOK, payment)
}

func (ctrl *Controller) RegisterRoutes(r *gin.Engine) {
	paymentGroup := r.Group("/payment")
	paymentGroup.POST("", ctrl.CreatePayment)
	paymentGroup.GET("", ctrl.GetPayments)
	paymentGroup.GET("/:id", ctrl.GetPaymentByID)
	paymentGroup.POST("/stripe/create-intent", ctrl.CreateStripePaymentIntent)
	paymentGroup.POST("/stripe/webhook", ctrl.HandleStripeWebhook)
}
