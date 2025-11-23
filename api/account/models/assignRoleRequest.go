package models

type AssignRoleRequest struct {
	RoleID uint `json:"roleId" binding:"required"`
}
