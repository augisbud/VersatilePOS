package models

type UpdateServiceRequest struct {
	BusinessID    *uint    `json:"businessId"`
	Name          *string  `json:"name"`
	HourlyPrice   *float64 `json:"hourlyPrice"`
	ServiceCharge *float64 `json:"serviceCharge"`
	ProvisioningStartTime *string `json:"provisioningStartTime"`
	ProvisioningEndTime   *string `json:"provisioningEndTime"`
	ProvisioningInterval  *uint   `json:"provisioningInterval"`
}

