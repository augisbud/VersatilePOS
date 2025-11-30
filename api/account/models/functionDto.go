package models

import "VersatilePOS/generic/constants"

type FunctionDto struct {
	ID          uint             `json:"id"`
	Name        string           `json:"name"`
	Action      constants.Action `json:"action"`
	Description string           `json:"description"`
}
