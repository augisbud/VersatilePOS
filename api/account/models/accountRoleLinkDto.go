package models

import (
	"VersatilePOS/database/entities"
	"VersatilePOS/generic/constants"
)

type AccountRoleLinkDto struct {
	ID     uint                            `json:"id"`
	Status constants.AccountRoleLinkStatus `json:"status"`
	Role   AccountRoleDto                  `json:"role"`
}

// NewAccountRoleLinkDtoFromEntity builds an AccountRoleLinkDto from the DB entity
// and the already-constructed AccountRoleDto for the linked role.
func NewAccountRoleLinkDtoFromEntity(link entities.AccountRoleLink, role AccountRoleDto) AccountRoleLinkDto {
	return AccountRoleLinkDto{
		ID:     link.ID,
		Status: link.Status,
		Role:   role,
	}
}
