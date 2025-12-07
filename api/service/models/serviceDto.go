package models

import (
	"VersatilePOS/account/models"
	"VersatilePOS/database/entities"
)

type ServiceDto struct {
	ID           uint    `json:"id"`
	BusinessID   uint    `json:"businessId"`
	Name         string  `json:"name"`
	HourlyPrice  float64 `json:"hourlyPrice"`
	ServiceCharge float64 `json:"serviceCharge"`
	ProvisioningStartTime string `json:"provisioningStartTime"`
	ProvisioningEndTime   string `json:"provisioningEndTime"`
	ProvisioningInterval  uint   `json:"provisioningInterval"`
	Employees    []models.AccountDto `json:"employees,omitempty"`
	CreatedAt    string  `json:"createdAt"`
	UpdatedAt    string  `json:"updatedAt"`
}

func NewServiceDtoFromEntity(s entities.Service) ServiceDto {
	employees := make([]models.AccountDto, 0)
	for _, employee := range s.Employees {
		employees = append(employees, models.NewAccountDtoFromEntity(employee, nil))
	}

	return ServiceDto{
		ID:                    s.ID,
		BusinessID:            s.BusinessID,
		Name:                  s.Name,
		HourlyPrice:           s.HourlyPrice,
		ServiceCharge:        s.ServiceCharge,
		ProvisioningStartTime: s.ProvisioningStartTime.Format("15:04"),
		ProvisioningEndTime:   s.ProvisioningEndTime.Format("15:04"),
		ProvisioningInterval:  s.ProvisioningInterval,
		Employees:             employees,
		CreatedAt:             s.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:             s.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}
}

