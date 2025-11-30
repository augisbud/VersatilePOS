package models

import "VersatilePOS/generic/constants"

type AccountRoleFunctionLinkDto struct {
	ID           uint                    `json:"id"`
	AccessLevels []constants.AccessLevel `json:"accessLevels"`
	Function     FunctionDto             `json:"function"`
}
