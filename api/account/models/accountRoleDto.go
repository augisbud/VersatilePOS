package models

import "VersatilePOS/database/entities"

type AccountRoleDto struct {
	ID            uint                         `json:"id"`
	Name          string                       `json:"name"`
	BusinessId    *uint                        `json:"businessId"`
	FunctionLinks []AccountRoleFunctionLinkDto `json:"functionLinks,omitempty"`
}

// NewAccountRoleDtoFromEntity builds an AccountRoleDto given the role entity
// and its function link entities (they are loaded separately).
func NewAccountRoleDtoFromEntity(role entities.AccountRole, funcLinks []entities.AccountRoleFunctionLink) AccountRoleDto {
	fr := make([]AccountRoleFunctionLinkDto, 0, len(funcLinks))
	for _, fl := range funcLinks {
		fr = append(fr, NewAccountRoleFunctionLinkDtoFromEntity(fl))
	}

	return AccountRoleDto{
		ID:            role.ID,
		Name:          role.Name,
		BusinessId:    &role.BusinessID,
		FunctionLinks: fr,
	}
}
