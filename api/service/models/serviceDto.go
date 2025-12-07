package models

import "VersatilePOS/database/entities"

type ServiceDto struct {
	ID           uint    `json:"id"`
	BusinessID   uint    `json:"businessId"`
	Name         string  `json:"name"`
	HourlyPrice  float64 `json:"hourlyPrice"`
	ServiceCharge float64 `json:"serviceCharge"`
	CreatedAt    string  `json:"createdAt"`
	UpdatedAt    string  `json:"updatedAt"`
}

func NewServiceDtoFromEntity(s entities.Service) ServiceDto {
	return ServiceDto{
		ID:           s.ID,
		BusinessID:   s.BusinessID,
		Name:         s.Name,
		HourlyPrice:  s.HourlyPrice,
		ServiceCharge: s.ServiceCharge,
		CreatedAt:    s.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:    s.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}
}

