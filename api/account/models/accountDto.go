package models

import (
	"VersatilePOS/database/entities"
)

type AccountDto struct {
	ID               uint                 `json:"id"`
	Name             string               `json:"name"`
	Username         string               `json:"username" gorm:"unique"`
	BusinessId       *uint                `json:"businessId,omitempty"`
	AccountRoleLinks []AccountRoleLinkDto `json:"roles"`
}

// NewAccountDtoFromEntity builds an AccountDto from the account entity and
// a pre-built list of role link DTOs. If the account has memberships loaded
// the first member-of business ID will be used for BusinessId when available.
func NewAccountDtoFromEntity(acc entities.Account, roleLinks []AccountRoleLinkDto) AccountDto {
	dto := AccountDto{
		ID:               acc.ID,
		Name:             acc.Name,
		Username:         acc.Username,
		AccountRoleLinks: roleLinks,
	}

	if len(acc.MemberOf) > 0 {
		dto.BusinessId = &acc.MemberOf[0].ID
	}

	return dto
}
