package models

type UpdateTagRequest struct {
	Value string `json:"value" binding:"required"`
}
