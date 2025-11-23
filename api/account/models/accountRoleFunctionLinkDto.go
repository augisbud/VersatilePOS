package models

import "VersatilePOS/generic/constants"

type AccountRoleFunctionLinkDto struct {
	ID          uint                  `json:"id"`
	AccessLevel constants.AccessLevel `json:"accessLevel"`
	Function    FunctionDto           `json:"function"`
}
