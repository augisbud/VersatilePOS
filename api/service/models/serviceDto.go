package models

import (
	accountModels "VersatilePOS/account/models"
	"VersatilePOS/database/entities"
	"time"
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
	Employees    []accountModels.AccountDto `json:"employees,omitempty"`
	CreatedAt    string  `json:"createdAt"`
	UpdatedAt    string  `json:"updatedAt"`
}

func NewServiceDtoFromEntity(s entities.Service) ServiceDto {
	employees := make([]accountModels.AccountDto, 0)
	for _, employee := range s.Employees {
		employees = append(employees, accountModels.NewAccountDtoFromEntity(employee, nil))
	}

	return ServiceDto{
		ID:                    s.ID,
		BusinessID:            s.BusinessID,
		Name:                  s.Name,
		HourlyPrice:           s.HourlyPrice,
		ServiceCharge:        s.ServiceCharge,
		ProvisioningStartTime: s.ProvisioningStartTime.Format(time.RFC3339),
		ProvisioningEndTime:   s.ProvisioningEndTime.Format(time.RFC3339),
		ProvisioningInterval:  s.ProvisioningInterval,
		Employees:             employees,
		CreatedAt:             s.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:             s.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}
}

