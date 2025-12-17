package models

type CheckBalanceRequest struct {
	Code string `json:"code" validate:"required"`
}
