package models

import "VersatilePOS/generic/constants"

type AccountRoleLinkDto struct {
	ID     uint                            `json:"id"`
	Status constants.AccountRoleLinkStatus `json:"status"`
	Role   AccountRoleDto                  `json:"role"`
}
