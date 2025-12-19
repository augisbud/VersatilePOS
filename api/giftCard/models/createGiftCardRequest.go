package models

type CreateGiftCardRequest struct {
	Code         string  `json:"code" validate:"required"`
	InitialValue float64 `json:"initialValue" validate:"required,gt=0"`
	BusinessID   uint    `json:"businessId" validate:"required"`
}
