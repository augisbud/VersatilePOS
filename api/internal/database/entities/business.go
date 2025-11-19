package entities

type Business struct {
	IdentBusiness uint64 `json:"identBusiness" gorm:"primaryKey;autoIncrement"`
	Name          string `json:"name"`
}
