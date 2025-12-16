package service

import (
	"fmt"
	paymentModels "VersatilePOS/payment/models"
	"VersatilePOS/payment/repository"
	orderRepository "VersatilePOS/order/repository"
	"VersatilePOS/database/entities"
	"VersatilePOS/generic/constants"
	"errors"
	"log"

	"github.com/stripe/stripe-go/v78"
)

type Service struct {
	repo          repository.Repository
	orderRepo     orderRepository.Repository
	stripeService *StripeService
}

func NewService() *Service {
	stripeService, err := NewStripeService()
	if err != nil {
		log.Printf("Warning: Stripe service initialization failed: %v. Stripe payments will not be available.", err)
		stripeService = nil
	}

	return &Service{
		repo:          repository.Repository{},
		orderRepo:     orderRepository.Repository{},
		stripeService: stripeService,
	}
}

func (s *Service) CreatePayment(req paymentModels.CreatePaymentRequest) (*paymentModels.PaymentDto, error) {
	paymentType := constants.PaymentType(req.Type)
	// Validate payment type
	if paymentType != constants.Cash && paymentType != constants.CreditCard &&
		paymentType != constants.DebitCard && paymentType != constants.DigitalWallet &&
		paymentType != constants.GiftCard && paymentType != constants.Check &&
		paymentType != constants.Other {
		return nil, errors.New("invalid payment type")
	}

	paymentStatus := constants.Pending
	if req.Status != "" {
		status := constants.PaymentStatus(req.Status)
		// Validate payment status
		if status != constants.Pending && status != constants.Completed &&
			status != constants.Failed && status != constants.Refunded {
			return nil, errors.New("invalid payment status")
		}
		paymentStatus = status
	}

	payment := &entities.Payment{
		Amount: req.Amount,
		Type:   paymentType,
		Status: paymentStatus,
	}

	createdPayment, err := s.repo.CreatePayment(payment)
	if err != nil {
		return nil, err
	}

	// If payment is created with Completed status, update linked orders
	if createdPayment.Status == constants.Completed {
		if err := s.updateOrderStatusAfterPayment(createdPayment.ID); err != nil {
			log.Printf("Warning: Failed to update order status after creating completed payment: %v", err)
		}
	}

	dto := paymentModels.NewPaymentDtoFromEntity(*createdPayment)
	return &dto, nil
}

func (s *Service) GetPayments() ([]paymentModels.PaymentDto, error) {
	payments, err := s.repo.GetPayments()
	if err != nil {
		return nil, err
	}

	var paymentDtos []paymentModels.PaymentDto
	for _, payment := range payments {
		paymentDtos = append(paymentDtos, paymentModels.NewPaymentDtoFromEntity(payment))
	}

	return paymentDtos, nil
}

func (s *Service) GetPaymentByID(id uint) (*paymentModels.PaymentDto, error) {
	payment, err := s.repo.GetPaymentByID(id)
	if err != nil {
		return nil, err
	}
	if payment == nil {
		return nil, errors.New("payment not found")
	}

	dto := paymentModels.NewPaymentDtoFromEntity(*payment)
	return &dto, nil
}

// CreateStripePaymentIntent creates a Stripe payment intent and a pending payment record
func (s *Service) CreateStripePaymentIntent(req paymentModels.CreateStripePaymentRequest) (*paymentModels.CreateStripePaymentResponse, error) {
	if s.stripeService == nil {
		return nil, errors.New("Stripe service is not configured")
	}

	currency := req.Currency
	if currency == "" {
		currency = "usd" // Default currency
	}

	metadata := make(map[string]string)
	if req.OrderID != nil {
		metadata["order_id"] = fmt.Sprintf("%d", *req.OrderID)
	}

	// Create Stripe payment intent
	pi, err := s.stripeService.CreatePaymentIntent(req.Amount, currency, metadata)
	if err != nil {
		return nil, err
	}

	// Create pending payment record in database
	paymentIntentID := pi.ID
	payment := &entities.Payment{
		Amount:                req.Amount,
		Type:                  constants.CreditCard,
		Status:                constants.Pending,
		StripePaymentIntentID: &paymentIntentID,
	}

	_, err = s.repo.CreatePayment(payment)
	if err != nil {
		// If database save fails, try to cancel the payment intent
		_, _ = s.stripeService.CancelPaymentIntent(pi.ID)
		return nil, err
	}

	return &paymentModels.CreateStripePaymentResponse{
		ClientSecret:     pi.ClientSecret,
		PaymentIntentID: pi.ID,
	}, nil
}

// updateOrderStatusAfterPayment updates order status to Confirmed when payment is completed
func (s *Service) updateOrderStatusAfterPayment(paymentID uint) error {
	orders, err := s.orderRepo.GetOrdersByPaymentID(paymentID)
	if err != nil {
		return err
	}

	for _, order := range orders {
		// Only update status if order is currently Pending
		if order.Status == constants.OrderPending {
			order.Status = constants.OrderConfirmed
			if err := s.orderRepo.UpdateOrder(&order); err != nil {
				log.Printf("Failed to update order %d status after payment: %v", order.ID, err)
				return err
			}
		}
	}

	return nil
}

// UpdatePaymentStatus updates the payment status (typically called from webhook)
func (s *Service) UpdatePaymentStatus(paymentIntentID string, status constants.PaymentStatus) error {
	payment, err := s.repo.GetPaymentByStripePaymentIntentID(paymentIntentID)
	if err != nil {
		return err
	}
	if payment == nil {
		return errors.New("payment not found")
	}

	oldStatus := payment.Status
	payment.Status = status
	_, err = s.repo.UpdatePayment(payment)
	if err != nil {
	return err
	}

	// Update order status if payment was completed
	if status == constants.Completed && oldStatus != constants.Completed {
		if err := s.updateOrderStatusAfterPayment(payment.ID); err != nil {
			// Log error but don't fail the payment update
			log.Printf("Warning: Failed to update order status after payment completion: %v", err)
		}
	}

	return nil
}

// UpdatePaymentStatusByString updates the payment status using a string (for webhook convenience)
func (s *Service) UpdatePaymentStatusByString(paymentIntentID string, status string) error {
	paymentStatus := constants.PaymentStatus(status)
	return s.UpdatePaymentStatus(paymentIntentID, paymentStatus)
}

// UpdatePaymentStatusByID updates the payment status by payment ID (for non-Stripe payments)
func (s *Service) UpdatePaymentStatusByID(paymentID uint, status constants.PaymentStatus) error {
	payment, err := s.repo.GetPaymentByID(paymentID)
	if err != nil {
		return err
	}
	if payment == nil {
		return errors.New("payment not found")
	}

	oldStatus := payment.Status
	payment.Status = status
	_, err = s.repo.UpdatePayment(payment)
	if err != nil {
		return err
	}

	// Update order status if payment was completed
	if status == constants.Completed && oldStatus != constants.Completed {
		if err := s.updateOrderStatusAfterPayment(payment.ID); err != nil {
			log.Printf("Warning: Failed to update order status after payment completion: %v", err)
		}
	}

	return nil
}

// CompletePayment completes a payment and updates linked order status
func (s *Service) CompletePayment(paymentID uint) error {
	return s.UpdatePaymentStatusByID(paymentID, constants.Completed)
}

// ConfirmStripePayment confirms a Stripe payment and updates the payment status
func (s *Service) ConfirmStripePayment(paymentIntentID string) error {
	if s.stripeService == nil {
		return errors.New("Stripe service is not configured")
	}

	// Get payment intent from Stripe
	pi, err := s.stripeService.GetPaymentIntent(paymentIntentID)
	if err != nil {
		return err
	}

	// Update payment status based on Stripe payment intent status
	var status constants.PaymentStatus
	switch pi.Status {
	case "succeeded":
		status = constants.Completed
	case "canceled":
		status = constants.Failed
	case "requires_payment_method", "requires_confirmation", "requires_action", "processing":
		status = constants.Pending
	default:
		status = constants.Failed
	}

	return s.UpdatePaymentStatus(paymentIntentID, status)
}

// VerifyWebhookSignature verifies a Stripe webhook signature
func (s *Service) VerifyWebhookSignature(payload []byte, signature string) (*stripe.Event, error) {
	if s.stripeService == nil {
		return nil, errors.New("Stripe service is not configured")
	}
	return s.stripeService.VerifyWebhookSignature(payload, signature)
}
