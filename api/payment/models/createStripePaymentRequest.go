package models

type CreateStripePaymentRequest struct {
	Amount   float64 `json:"amount" validate:"required,gt=0"`
	Currency string  `json:"currency" validate:"required"`
	OrderID  *uint   `json:"orderId,omitempty"`
}

type CreateStripePaymentResponse struct {
	ClientSecret string `json:"clientSecret"`
	PaymentIntentID string `json:"paymentIntentId"`
}
