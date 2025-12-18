package repository

import (
	"VersatilePOS/database"
	"VersatilePOS/database/entities"

	"gorm.io/gorm"
)

type Repository struct{}

func (r *Repository) CreateItem(item *entities.Item, inventory *entities.ItemInventory) (*entities.Item, error) {
	err := database.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(item).Error; err != nil {
			return err
		}
		if inventory != nil {
			inventory.ItemID = item.ID
			if err := tx.Create(inventory).Error; err != nil {
				return err
			}
		}
		return nil
	})
	if err != nil {
		return nil, err
	}
	return item, nil
}

func (r *Repository) GetItems(businessID uint) ([]entities.Item, map[uint]*entities.ItemInventory, error) {
	var items []entities.Item
	if err := database.DB.Where("business_id = ?", businessID).Find(&items).Error; err != nil {
		return nil, nil, err
	}

	itemIDs := make([]uint, len(items))
	for i, item := range items {
		itemIDs[i] = item.ID
	}

	var inventories []entities.ItemInventory
	if len(itemIDs) > 0 {
		if err := database.DB.Where("item_id IN ?", itemIDs).Find(&inventories).Error; err != nil {
			return nil, nil, err
		}
	}

	inventoryMap := make(map[uint]*entities.ItemInventory)
	for i := range inventories {
		inventoryMap[inventories[i].ItemID] = &inventories[i]
	}

	return items, inventoryMap, nil
}

func (r *Repository) GetItemByID(id uint) (*entities.Item, *entities.ItemInventory, error) {
	var item entities.Item
	if err := database.DB.First(&item, id).Error; err != nil {
		return nil, nil, err
	}

	var inventory entities.ItemInventory
	if err := database.DB.Where("item_id = ?", id).First(&inventory).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return &item, nil, nil
		}
		return nil, nil, err
	}

	return &item, &inventory, nil
}

func (r *Repository) UpdateItem(item *entities.Item, inventory *entities.ItemInventory, trackInventory *bool) error {
	return database.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Save(item).Error; err != nil {
			return err
		}

		if trackInventory != nil {
			if *trackInventory {
				// Enable tracking or update existing
				if inventory.ID != 0 {
					if err := tx.Save(inventory).Error; err != nil {
						return err
					}
				} else {
					inventory.ItemID = item.ID
					if err := tx.Create(inventory).Error; err != nil {
						return err
					}
				}
			} else {
				// Disable tracking (delete inventory record)
				if err := tx.Where("item_id = ?", item.ID).Delete(&entities.ItemInventory{}).Error; err != nil {
					return err
				}
			}
		} else if inventory != nil && inventory.ID != 0 {
			// Just update inventory if it exists and we are not changing tracking status
			if err := tx.Save(inventory).Error; err != nil {
				return err
			}
		}
		return nil
	})
}

func (r *Repository) DeleteItem(id uint) error {
	return database.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("item_id = ?", id).Delete(&entities.ItemInventory{}).Error; err != nil {
			return err
		}
		if err := tx.Where("item_id = ?", id).Delete(&entities.ItemTagLink{}).Error; err != nil {
			return err
		}
		if err := tx.Where("item_id = ?", id).Delete(&entities.PriceModifierItemLink{}).Error; err != nil {
			return err
		}
		if err := tx.Delete(&entities.Item{}, id).Error; err != nil {
			return err
		}
		return nil
	})
}

// ItemOption methods

func (r *Repository) CreateItemOption(option *entities.ItemOption, inventory *entities.ItemOptionInventory) (*entities.ItemOption, error) {
	err := database.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(option).Error; err != nil {
			return err
		}
		if inventory != nil {
			inventory.ItemOptionID = option.ID
			if err := tx.Create(inventory).Error; err != nil {
				return err
			}
		}
		return nil
	})
	if err != nil {
		return nil, err
	}
	return option, nil
}

func (r *Repository) GetItemOptions(businessID uint) ([]entities.ItemOption, map[uint]*entities.ItemOptionInventory, error) {
	var items []entities.Item
	if err := database.DB.Where("business_id = ?", businessID).Preload("ItemOptions.Inventory").Find(&items).Error; err != nil {
		return nil, nil, err
	}

	var options []entities.ItemOption
	inventoryMap := make(map[uint]*entities.ItemOptionInventory)

	for _, item := range items {
		for _, option := range item.ItemOptions {
			options = append(options, option)
			if option.Inventory != nil && option.Inventory.ID != 0 {
				inventoryMap[option.ID] = option.Inventory
			}
		}
	}

	return options, inventoryMap, nil
}

func (r *Repository) GetItemOptionByID(id uint) (*entities.ItemOption, *entities.ItemOptionInventory, error) {
	var option entities.ItemOption
	// Use Unscoped to allow retrieving soft-deleted (historical) options
	if err := database.DB.Unscoped().Preload("Item").First(&option, id).Error; err != nil {
		return nil, nil, err
	}

	var inventory entities.ItemOptionInventory
	if err := database.DB.Where("item_option_id = ?", id).First(&inventory).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return &option, nil, nil
		}
		return nil, nil, err
	}

	return &option, &inventory, nil
}

func (r *Repository) UpdateItemOption(option *entities.ItemOption, inventory *entities.ItemOptionInventory, trackInventory *bool) error {
	return database.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Save(option).Error; err != nil {
			return err
		}

		if trackInventory != nil {
			if *trackInventory {
				if inventory.ID != 0 {
					if err := tx.Save(inventory).Error; err != nil {
						return err
					}
				} else {
					inventory.ItemOptionID = option.ID
					if err := tx.Create(inventory).Error; err != nil {
						return err
					}
				}
			} else {
				if err := tx.Where("item_option_id = ?", option.ID).Delete(&entities.ItemOptionInventory{}).Error; err != nil {
					return err
				}
			}
		} else if inventory != nil && inventory.ID != 0 {
			if err := tx.Save(inventory).Error; err != nil {
				return err
			}
		}
		return nil
	})
}

func (r *Repository) DeleteItemOption(id uint) error {
	return database.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("item_option_id = ?", id).Delete(&entities.ItemOptionTagLink{}).Error; err != nil {
			return err
		}
		if err := tx.Where("item_option_id = ?", id).Delete(&entities.ItemOptionInventory{}).Error; err != nil {
			return err
		}
		if err := tx.Delete(&entities.ItemOption{}, id).Error; err != nil {
			return err
		}
		return nil
	})
}

func (r *Repository) CreatePriceModifierItemLink(link *entities.PriceModifierItemLink) (*entities.PriceModifierItemLink, error) {
	if result := database.DB.Create(link); result.Error != nil {
		return nil, result.Error
	}
	return link, nil
}

func (r *Repository) DeletePriceModifierFromItem(itemID uint, priceModifierID uint) error {
	return database.DB.Where("item_id = ? AND price_modifier_id = ?", itemID, priceModifierID).Delete(&entities.PriceModifierItemLink{}).Error
}

func (r *Repository) GetItemWithPriceModifiers(id uint) (*entities.Item, *entities.ItemInventory, []entities.PriceModifier, error) {
	var item entities.Item
	if err := database.DB.Preload("PriceModifierLinks", "deleted_at IS NULL").
		Preload("PriceModifierLinks.PriceModifier", "deleted_at IS NULL").First(&item, id).Error; err != nil {
		return nil, nil, nil, err
	}

	var inventory entities.ItemInventory
	inventoryErr := database.DB.Where("item_id = ?", id).First(&inventory).Error
	var inventoryPtr *entities.ItemInventory
	if inventoryErr == nil {
		inventoryPtr = &inventory
	} else if inventoryErr != gorm.ErrRecordNotFound {
		return nil, nil, nil, inventoryErr
	}

	// Extract price modifiers from preloaded links (filter out soft-deleted ones)
	var priceModifiers []entities.PriceModifier
	for _, link := range item.PriceModifierLinks {
		// Skip if price modifier is zero-value (indicates soft-deleted)
		if link.PriceModifier.ID != 0 && link.PriceModifier.Name != "" {
			priceModifiers = append(priceModifiers, link.PriceModifier)
		}
	}

	return &item, inventoryPtr, priceModifiers, nil
}

func (r *Repository) GetItemsWithPriceModifiers(businessID uint) ([]entities.Item, map[uint]*entities.ItemInventory, map[uint][]entities.PriceModifier, error) {
	var items []entities.Item
	if err := database.DB.Preload("PriceModifierLinks", "deleted_at IS NULL").
		Preload("PriceModifierLinks.PriceModifier", "deleted_at IS NULL").Where("business_id = ?", businessID).Find(&items).Error; err != nil {
		return nil, nil, nil, err
	}

	itemIDs := make([]uint, len(items))
	for i, item := range items {
		itemIDs[i] = item.ID
	}

	// Get inventories
	var inventories []entities.ItemInventory
	inventoryMap := make(map[uint]*entities.ItemInventory)
	if len(itemIDs) > 0 {
		if err := database.DB.Where("item_id IN ?", itemIDs).Find(&inventories).Error; err != nil {
			return nil, nil, nil, err
		}
		for i := range inventories {
			inventoryMap[inventories[i].ItemID] = &inventories[i]
		}
	}

	// Build price modifier map from preloaded data
	priceModifierMap := make(map[uint][]entities.PriceModifier)
	for _, item := range items {
		var priceModifiers []entities.PriceModifier
		for _, link := range item.PriceModifierLinks {
			// Skip if price modifier is zero-value (indicates soft-deleted)
			if link.PriceModifier.ID != 0 && link.PriceModifier.Name != "" {
				priceModifiers = append(priceModifiers, link.PriceModifier)
			}
		}
		if len(priceModifiers) > 0 {
			priceModifierMap[item.ID] = priceModifiers
		}
	}

	return items, inventoryMap, priceModifierMap, nil
}
