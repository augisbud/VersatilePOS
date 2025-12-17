package repository

import (
	"VersatilePOS/database"
	"VersatilePOS/database/entities"

	"gorm.io/gorm"
)

type Repository struct{}

func (r *Repository) CreateGiftCard(giftCard *entities.GiftCard) (*entities.GiftCard, error) {
	if result := database.DB.Create(giftCard); result.Error != nil {
		return nil, result.Error
	}
	return giftCard, nil
}

func (r *Repository) GetGiftCards() ([]entities.GiftCard, error) {
	var giftCards []entities.GiftCard
	if result := database.DB.Find(&giftCards); result.Error != nil {
		return nil, result.Error
	}
	return giftCards, nil
}

func (r *Repository) GetGiftCardByID(id uint) (*entities.GiftCard, error) {
	var giftCard entities.GiftCard
	if result := database.DB.First(&giftCard, id); result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, result.Error
	}
	return &giftCard, nil
}

func (r *Repository) GetGiftCardByCode(code string) (*entities.GiftCard, error) {
	var giftCard entities.GiftCard
	if result := database.DB.Where("code = ?", code).First(&giftCard); result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, result.Error
	}
	return &giftCard, nil
}

func (r *Repository) UpdateGiftCard(giftCard *entities.GiftCard) (*entities.GiftCard, error) {
	if result := database.DB.Save(giftCard); result.Error != nil {
		return nil, result.Error
	}
	return giftCard, nil
}

func (r *Repository) DeleteGiftCard(id uint) error {
	if result := database.DB.Delete(&entities.GiftCard{}, id); result.Error != nil {
		return result.Error
	}
	return nil
}
