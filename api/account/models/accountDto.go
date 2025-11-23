package models

type AccountDto struct {
	ID               uint                 `json:"id"`
	Name             string               `json:"name"`
	Username         string               `json:"username" gorm:"unique"`
	BusinessId       *uint                `json:"businessId,omitempty"`
	AccountRoleLinks []AccountRoleLinkDto `json:"roles"`
}
