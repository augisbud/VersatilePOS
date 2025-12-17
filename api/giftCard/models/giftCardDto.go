package models

import "VersatilePOS/database/entities"

type GiftCardDto struct {
	ID           uint    `json:"id"`
	Code         string  `json:"code"`
	InitialValue float64 `json:"initialValue"`
	Balance      float64 `json:"balance"`
	IsActive     bool    `json:"isActive"`
}

func NewGiftCardDtoFromEntity(gc entities.GiftCard) GiftCardDto {
	return GiftCardDto{
		ID:           gc.ID,
		Code:         gc.Code,
		InitialValue: gc.InitialValue,
		Balance:      gc.Balance,
		IsActive:     gc.IsActive,
	}
}
