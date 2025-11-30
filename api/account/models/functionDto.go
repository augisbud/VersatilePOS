package models

import (
	"VersatilePOS/database/entities"
	"VersatilePOS/generic/constants"
)

type FunctionDto struct {
	ID          uint             `json:"id"`
	Name        string           `json:"name"`
	Action      constants.Action `json:"action"`
	Description string           `json:"description"`
}

// NewFunctionDtoFromEntity constructs a FunctionDto from the DB entity.
func NewFunctionDtoFromEntity(f entities.Function) FunctionDto {
	return FunctionDto{
		ID:          f.ID,
		Name:        f.Name,
		Action:      f.Action,
		Description: f.Description,
	}
}
