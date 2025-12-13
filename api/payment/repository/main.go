package repository

import (
	"VersatilePOS/database"
	"VersatilePOS/database/entities"

	"gorm.io/gorm"
)

type Repository struct{}

func (r *Repository) CreatePayment(payment *entities.Payment) (*entities.Payment, error) {
	if result := database.DB.Create(payment); result.Error != nil {
		return nil, result.Error
	}
	return payment, nil
}

func (r *Repository) GetPayments() ([]entities.Payment, error) {
	var payments []entities.Payment
	if result := database.DB.Find(&payments); result.Error != nil {
		return nil, result.Error
	}
	return payments, nil
}

func (r *Repository) GetPaymentByID(id uint) (*entities.Payment, error) {
	var payment entities.Payment
	if result := database.DB.First(&payment, id); result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, result.Error
	}
	return &payment, nil
}

func (r *Repository) GetPaymentByStripePaymentIntentID(paymentIntentID string) (*entities.Payment, error) {
	var payment entities.Payment
	if result := database.DB.Where("stripe_payment_intent_id = ?", paymentIntentID).First(&payment); result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, result.Error
	}
	return &payment, nil
}

func (r *Repository) UpdatePayment(payment *entities.Payment) (*entities.Payment, error) {
	if result := database.DB.Save(payment); result.Error != nil {
		return nil, result.Error
	}
	return payment, nil
}
