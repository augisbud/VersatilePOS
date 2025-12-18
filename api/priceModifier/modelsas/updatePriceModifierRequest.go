package modelsas

import "time"

type UpdatePriceModifierRequest struct {
	ModifierType string     `json:"modifierType"`
	Name         string     `json:"name"`
	Value        *float64   `json:"value"`
	IsPercentage *bool      `json:"isPercentage"`
	EndDate      *time.Time `json:"endDate"`
}
