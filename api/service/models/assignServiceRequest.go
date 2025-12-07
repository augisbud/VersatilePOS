package models

type AssignServiceRequest struct {
	ServiceID uint `json:"serviceId" binding:"required"`
}

