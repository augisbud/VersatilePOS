package models

type BusinessDto struct {
	ID      uint   `json:"id"`
	Name    string `json:"name"`
	Address string `json:"address"`
	Phone   string `json:"phone"`
	Email   string `json:"email"`
}
