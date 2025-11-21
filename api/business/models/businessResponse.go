package models

type OwnerAccountResponse struct {
	IdentAccount uint64 `json:"identAccount"`
	Name         string `json:"name"`
	Username     string `json:"username"`
}

type BusinessResponse struct {
	IdentBusiness uint   `json:"identBusiness" validate:"required"`
	Name          string `json:"name" validate:"required"`
	Address       string `json:"address" validate:"required"`
	Phone         string `json:"phone" validate:"required"`
	Email         string `json:"email" validate:"required,email"`
}
