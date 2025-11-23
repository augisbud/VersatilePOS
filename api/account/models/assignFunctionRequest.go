package models

import "VersatilePOS/generic/constants"

type AssignFunctionRequest struct {
	FunctionID  uint                  `json:"functionId" binding:"required"`
	AccessLevel constants.AccessLevel `json:"accessLevel" binding:"required"`
}
