package models

type CreateServiceRequest struct {
	BusinessID    uint    `json:"businessId" validate:"required"`
	Name          string  `json:"name" validate:"required"`
	HourlyPrice   float64 `json:"hourlyPrice" validate:"required,gt=0"`
	ServiceCharge float64 `json:"serviceCharge" validate:"gte=0"`
}

