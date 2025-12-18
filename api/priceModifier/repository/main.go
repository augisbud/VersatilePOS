package repository

import (
	"VersatilePOS/database"
	"VersatilePOS/database/entities"
	"time"

	"gorm.io/gorm"
)

type Repository struct{}

func (r *Repository) CreatePriceModifier(priceModifier *entities.PriceModifier) (*entities.PriceModifier, error) {
	if result := database.DB.Create(priceModifier); result.Error != nil {
		return nil, result.Error
	}
	return priceModifier, nil
}

func (r *Repository) GetPriceModifiers(businessID uint) ([]entities.PriceModifier, error) {
	var priceModifiers []entities.PriceModifier
	if result := database.DB.Where("business_id = ? AND (end_date IS NULL OR end_date > ?)", businessID, time.Now()).Find(&priceModifiers); result.Error != nil {
		return nil, result.Error
	}
	return priceModifiers, nil
}

func (r *Repository) GetPriceModifierByID(id uint, businessID uint) (*entities.PriceModifier, error) {
	var priceModifier entities.PriceModifier
	// Use Unscoped to allow retrieving soft-deleted (historical) price modifiers
	if result := database.DB.Unscoped().Where("id = ? AND business_id = ?", id, businessID).First(&priceModifier); result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, result.Error
	}
	return &priceModifier, nil
}

func (r *Repository) UpdatePriceModifier(priceModifier *entities.PriceModifier) (*entities.PriceModifier, error) {
	oldID := priceModifier.ID

	// Soft delete the old record to preserve history
	if result := database.DB.Delete(&entities.PriceModifier{}, oldID); result.Error != nil {
		return nil, result.Error
	}

	// Create a new record with the updated values
	// Reset ID and GORM model fields to ensure a new record is created
	newPriceModifier := *priceModifier
	newPriceModifier.ID = 0
	newPriceModifier.Model = gorm.Model{} // Reset ID, CreatedAt, UpdatedAt, DeletedAt

	if result := database.DB.Create(&newPriceModifier); result.Error != nil {
		return nil, result.Error
	}

	// Propagate the change to linked ItemOptions
	// We must also "version" the ItemOptions to preserve history for ItemOptionLinks (Orders)
	var itemOptions []entities.ItemOption
	if result := database.DB.Where("price_modifier_id = ?", oldID).Find(&itemOptions); result.Error == nil {
		for _, opt := range itemOptions {
			oldOptID := opt.ID

			// Soft delete old ItemOption
			database.DB.Delete(&entities.ItemOption{}, oldOptID)

			// Create new ItemOption pointing to new PriceModifier
			newOpt := opt
			newOpt.ID = 0
			newOpt.Model = gorm.Model{}
			newOpt.PriceModifierID = newPriceModifier.ID
			database.DB.Create(&newOpt)

			// Copy Inventory if it exists
			var inventory entities.ItemOptionInventory
			if err := database.DB.Where("item_option_id = ?", oldOptID).First(&inventory).Error; err == nil {
				newInv := inventory
				newInv.ID = 0
				newInv.Model = gorm.Model{}
				newInv.ItemOptionID = newOpt.ID
				database.DB.Create(&newInv)
			}

			// Copy Tags
			var tagLinks []entities.ItemOptionTagLink
			if err := database.DB.Where("item_option_id = ?", oldOptID).Find(&tagLinks).Error; err == nil {
				for _, link := range tagLinks {
					newLink := link
					newLink.ID = 0
					newLink.Model = gorm.Model{}
					newLink.ItemOptionID = newOpt.ID
					database.DB.Create(&newLink)
				}
			}
		}
	}

	return &newPriceModifier, nil
}

func (r *Repository) DeletePriceModifier(id uint) error {
	if result := database.DB.Delete(&entities.PriceModifier{}, id); result.Error != nil {
		return result.Error
	}
	return nil
}
