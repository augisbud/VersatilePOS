package models

type TagDto struct {
	ID         uint   `json:"id"`
	BusinessID uint   `json:"businessId"`
	Value      string `json:"value"`
}
