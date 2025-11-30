package models

type AccountRoleDto struct {
	ID   uint   `json:"id"`
	Name string `json:"name"`
	BusinessId *uint `json:"businessId"`
}
