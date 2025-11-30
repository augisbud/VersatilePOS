package models

import "VersatilePOS/generic/constants"

type AssignFunctionRequest struct {
	FunctionID   uint                    `json:"functionId" binding:"required"`
	AccessLevels []constants.AccessLevel `json:"accessLevels" binding:"required"`
}
