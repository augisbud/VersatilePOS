package service

import (
	paymentModels "VersatilePOS/payment/models"
	"VersatilePOS/payment/repository"
	"VersatilePOS/database/entities"
	"VersatilePOS/generic/constants"
	"errors"
)

type Service struct {
	repo repository.Repository
}

func NewService() *Service {
	return &Service{
		repo: repository.Repository{},
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
