package models

type CreateAccountRequest struct {
	Name          string `json:"name"`
	IdentBusiness uint64 `json:"identBusiness"`
	Username      string `json:"username"`
	Password      string `json:"password"`
}
