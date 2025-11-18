package entities

type Business struct {
	IdentBusiness uint64 `json:"identBusiness" gorm:"primaryKey"`
	Name          string `json:"name"`
}
