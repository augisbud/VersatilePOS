package service

import (
	"encoding/json"
	"errors"
	"os"

	"github.com/stripe/stripe-go/v78"
	"github.com/stripe/stripe-go/v78/paymentintent"
	"github.com/stripe/stripe-go/v78/webhook"
)

type StripeService struct {
	secretKey     string
	webhookSecret string
}

func NewStripeService() (*StripeService, error) {
	secretKey := os.Getenv("STRIPE_SECRET_KEY")
	if secretKey == "" {
		return nil, errors.New("STRIPE_SECRET_KEY environment variable is not set")
	}

	webhookSecret := os.Getenv("STRIPE_WEBHOOK_SECRET")
	// Webhook secret is optional for now - nehostinsim sito

	stripe.Key = secretKey

	return &StripeService{
		secretKey:     secretKey,
		webhookSecret: webhookSecret,
	}, nil
}

// CreatePaymentIntent creates a Stripe payment intent for the given amount
func (s *StripeService) CreatePaymentIntent(amount float64, currency string, metadata map[string]string) (*stripe.PaymentIntent, error) {
	// Convert amount to cents (Stripe uses smallest currency unit)
	amountInCents := int64(amount * 100)

	params := &stripe.PaymentIntentParams{
		Amount:   stripe.Int64(amountInCents),
		Currency: stripe.String(currency),
		Metadata: metadata,
		AutomaticPaymentMethods: &stripe.PaymentIntentAutomaticPaymentMethodsParams{
			Enabled: stripe.Bool(true),
		},
	}

	pi, err := paymentintent.New(params)
	if err != nil {
		return nil, err
	}

	return pi, nil
}

// ConfirmPaymentIntent confirms a payment intent
func (s *StripeService) ConfirmPaymentIntent(paymentIntentID string) (*stripe.PaymentIntent, error) {
	pi, err := paymentintent.Confirm(paymentIntentID, nil)
	if err != nil {
		return nil, err
	}
	return pi, nil
}

// GetPaymentIntent retrieves a payment intent by ID
func (s *StripeService) GetPaymentIntent(paymentIntentID string) (*stripe.PaymentIntent, error) {
	pi, err := paymentintent.Get(paymentIntentID, nil)
	if err != nil {
		return nil, err
	}
	return pi, nil
}

// CancelPaymentIntent cancels a payment intent
func (s *StripeService) CancelPaymentIntent(paymentIntentID string) (*stripe.PaymentIntent, error) {
	pi, err := paymentintent.Cancel(paymentIntentID, nil)
	if err != nil {
		return nil, err
	}
	return pi, nil
}

// VerifyWebhookSignature verifies the webhook signature from Stripe
// For local development, if webhook secret is not set, it will skip verification
func (s *StripeService) VerifyWebhookSignature(payload []byte, signature string) (*stripe.Event, error) {
	if s.webhookSecret == "" {
		// For local development, try to parse the event without verification
		// This allows testing with Stripe CLI without webhook secret
		var event stripe.Event
		if err := json.Unmarshal(payload, &event); err != nil {
			return nil, errors.New("webhook secret not configured and failed to parse event")
		}
		return &event, nil
	}

	event, err := webhook.ConstructEvent(payload, signature, s.webhookSecret)
	if err != nil {
		return nil, err
	}

	return &event, nil
}
