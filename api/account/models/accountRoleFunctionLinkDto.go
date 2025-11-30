package models

import (
	"VersatilePOS/database/entities"
	"VersatilePOS/generic/constants"
)

type AccountRoleFunctionLinkDto struct {
	ID           uint                    `json:"id"`
	AccessLevels []constants.AccessLevel `json:"accessLevels"`
	Function     FunctionDto             `json:"function"`
}

// NewAccountRoleFunctionLinkDtoFromEntity constructs the DTO from the DB entity.
func NewAccountRoleFunctionLinkDtoFromEntity(fl entities.AccountRoleFunctionLink) AccountRoleFunctionLinkDto {
	// convert DB string array -> []constants.AccessLevel
	conv := make([]constants.AccessLevel, len(fl.AccessLevels))
	for j, v := range fl.AccessLevels {
		conv[j] = constants.AccessLevel(v)
	}

	return AccountRoleFunctionLinkDto{
		ID:           fl.ID,
		AccessLevels: conv,
		Function:     NewFunctionDtoFromEntity(fl.Function),
	}
}
