package models

import "time"

type UpdateServiceRequest struct {
	BusinessID    *uint    `json:"businessId"`
	Name          *string  `json:"name"`
	HourlyPrice   *float64 `json:"hourlyPrice"`
	ServiceCharge *float64 `json:"serviceCharge"`
	ProvisioningStartTime *time.Time `json:"provisioningStartTime"`
	ProvisioningEndTime   *time.Time `json:"provisioningEndTime"`
	ProvisioningInterval  *uint      `json:"provisioningInterval"`
}

