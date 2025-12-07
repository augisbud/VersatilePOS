package repository

import (
	"VersatilePOS/database"
	"VersatilePOS/database/entities"

	"gorm.io/gorm"
)

type Repository struct{}

func (r *Repository) CreatePriceModifier(priceModifier *entities.PriceModifier) (*entities.PriceModifier, error) {
	if result := database.DB.Create(priceModifier); result.Error != nil {
		return nil, result.Error
	}
	return priceModifier, nil
}

func (r *Repository) GetPriceModifiers() ([]entities.PriceModifier, error) {
	var priceModifiers []entities.PriceModifier
	if result := database.DB.Find(&priceModifiers); result.Error != nil {
		return nil, result.Error
	}
	return priceModifiers, nil
}

func (r *Repository) GetPriceModifierByID(id uint) (*entities.PriceModifier, error) {
	var priceModifier entities.PriceModifier
	if result := database.DB.First(&priceModifier, id); result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, result.Error
	}
	return &priceModifier, nil
}

func (r *Repository) UpdatePriceModifier(priceModifier *entities.PriceModifier) error {
	if result := database.DB.Save(priceModifier); result.Error != nil {
		return result.Error
	}
	return nil
}

func (r *Repository) DeletePriceModifier(id uint) error {
	if result := database.DB.Delete(&entities.PriceModifier{}, id); result.Error != nil {
		return result.Error
	}
	return nil
}
