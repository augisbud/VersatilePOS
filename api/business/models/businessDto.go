package models

import "VersatilePOS/database/entities"

type BusinessDto struct {
	ID      uint   `json:"id"`
	Name    string `json:"name"`
	Address string `json:"address"`
	Phone   string `json:"phone"`
	Email   string `json:"email"`
}

// NewBusinessDtoFromEntity constructs a BusinessDto from the DB entity.
func NewBusinessDtoFromEntity(b entities.Business) BusinessDto {
	return BusinessDto{
		ID:      b.ID,
		Name:    b.Name,
		Address: b.Address,
		Phone:   b.Phone,
		Email:   b.Email,
	}
}
