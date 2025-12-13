package models

type LinkServiceRequest struct {
	ServiceID uint `json:"serviceId" binding:"required"`
}
