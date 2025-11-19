package entities

type Account struct {
	IdentAccount  uint64    `json:"identAccount" gorm:"primaryKey;autoIncrement"`
	Name          string    `json:"name"`
	IdentBusiness *uint64   `json:"identBusiness"`
	Username      string    `json:"username" gorm:"unique"`
	PasswordHash  string    `json:"-"`
	Business      *Business `gorm:"foreignKey:IdentBusiness;references:IdentBusiness;constraint:OnDelete:SET NULL"`
}
