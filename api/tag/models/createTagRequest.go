package models

type CreateTagRequest struct {
	BusinessID uint   `json:"businessId" binding:"required"`
	Value      string `json:"value" binding:"required"`
}
