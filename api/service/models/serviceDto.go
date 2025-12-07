package models

import (
	"VersatilePOS/database/entities"
	"time"
)

type ServiceDto struct {
	ID           uint    `json:"id"`
	BusinessID   uint    `json:"businessId"`
	Name         string  `json:"name"`
	HourlyPrice  float64 `json:"hourlyPrice"`
	ServiceCharge float64 `json:"serviceCharge"`
	ProvisioningStartTime *string `json:"provisioningStartTime"`
	ProvisioningEndTime   *string `json:"provisioningEndTime"`
	ProvisioningInterval  *uint   `json:"provisioningInterval"`
	CreatedAt    string  `json:"createdAt"`
	UpdatedAt    string  `json:"updatedAt"`
}

func NewServiceDtoFromEntity(s entities.Service) ServiceDto {
	dto := ServiceDto{
		ID:           s.ID,
		BusinessID:   s.BusinessID,
		Name:         s.Name,
		HourlyPrice:  s.HourlyPrice,
		ServiceCharge: s.ServiceCharge,
		ProvisioningInterval: s.ProvisioningInterval,
		CreatedAt:    s.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:    s.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}

	if s.ProvisioningStartTime != nil {
		startTimeStr := s.ProvisioningStartTime.Format(time.RFC3339)
		dto.ProvisioningStartTime = &startTimeStr
	}

	if s.ProvisioningEndTime != nil {
		endTimeStr := s.ProvisioningEndTime.Format(time.RFC3339)
		dto.ProvisioningEndTime = &endTimeStr
	}

	return dto
}

