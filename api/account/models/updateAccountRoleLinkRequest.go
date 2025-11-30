package models

import (
	"VersatilePOS/generic/constants"
)

type UpdateAccountRoleLinkRequest struct {
	Status constants.AccountRoleLinkStatus `json:"status" binding:"required,oneof=Active Suspended Deactivated"`
}
