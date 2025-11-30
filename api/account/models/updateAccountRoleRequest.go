package models

type UpdateAccountRoleRequest struct {
	Name string `json:"name" binding:"required"`
}
