package models

type CreateAccountRoleRequest struct {
	Name       string `json:"name" binding:"required"`
	BusinessID uint   `json:"businessId" binding:"required"`
}
