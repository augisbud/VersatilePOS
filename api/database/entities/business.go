package entities

type Business struct {
	IdentBusiness     uint64  `json:"identBusiness" gorm:"primaryKey;autoIncrement"`
	Name              string  `json:"name"`
	IdentOwnerAccount uint64  `json:"identOwnerAccount"`
	Address           string  `json:"address"`
	Phone             string  `json:"phone"`
	Email             string  `json:"email"`
	OwnerAccount      Account `gorm:"foreignKey:IdentOwnerAccount;references:IdentAccount;constraint:OnDelete:RESTRICT"`
}
