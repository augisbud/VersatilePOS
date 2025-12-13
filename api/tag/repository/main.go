package repository

import (
	"VersatilePOS/database"
	"VersatilePOS/database/entities"

	"gorm.io/gorm"
)

type Repository struct{}

func (r *Repository) CreateTag(tag *entities.Tag) (*entities.Tag, error) {
	if err := database.DB.Create(tag).Error; err != nil {
		return nil, err
	}
	return tag, nil
}

func (r *Repository) GetTags(businessID uint) ([]entities.Tag, error) {
	var tags []entities.Tag
	if err := database.DB.Where("business_id = ?", businessID).Find(&tags).Error; err != nil {
		return nil, err
	}
	return tags, nil
}

func (r *Repository) GetTagByID(id uint) (*entities.Tag, error) {
	var tag entities.Tag
	if err := database.DB.First(&tag, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &tag, nil
}

func (r *Repository) UpdateTag(tag *entities.Tag) error {
	return database.DB.Save(tag).Error
}

func (r *Repository) DeleteTag(id uint) error {
	return database.DB.Delete(&entities.Tag{}, id).Error
}

// Link operations

func (r *Repository) CreateItemTagLink(link *entities.ItemTagLink) (*entities.ItemTagLink, error) {
	if err := database.DB.Create(link).Error; err != nil {
		return nil, err
	}
	return link, nil
}

func (r *Repository) GetItemTagLink(tagID, itemID uint) (*entities.ItemTagLink, error) {
	var link entities.ItemTagLink
	if err := database.DB.Where("tag_id = ? AND item_id = ?", tagID, itemID).First(&link).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &link, nil
}

func (r *Repository) DeleteItemTagLink(tagID, itemID uint) error {
	return database.DB.Where("tag_id = ? AND item_id = ?", tagID, itemID).Delete(&entities.ItemTagLink{}).Error
}

func (r *Repository) GetItemsByTag(tagID uint) ([]entities.Item, error) {
	var items []entities.Item
	if err := database.DB.
		Joins("JOIN item_tag_links ON items.id = item_tag_links.item_id").
		Where("item_tag_links.tag_id = ?", tagID).
		Find(&items).Error; err != nil {
		return nil, err
	}
	return items, nil
}

func (r *Repository) GetTagsByItem(itemID uint) ([]entities.Tag, error) {
	var tags []entities.Tag
	if err := database.DB.
		Joins("JOIN item_tag_links ON tags.id = item_tag_links.tag_id").
		Where("item_tag_links.item_id = ?", itemID).
		Find(&tags).Error; err != nil {
		return nil, err
	}
	return tags, nil
}

func (r *Repository) CreateItemOptionTagLink(link *entities.ItemOptionTagLink) (*entities.ItemOptionTagLink, error) {
	if err := database.DB.Create(link).Error; err != nil {
		return nil, err
	}
	return link, nil
}

func (r *Repository) GetItemOptionTagLink(tagID, itemOptionID uint) (*entities.ItemOptionTagLink, error) {
	var link entities.ItemOptionTagLink
	if err := database.DB.Where("tag_id = ? AND item_option_id = ?", tagID, itemOptionID).First(&link).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &link, nil
}

func (r *Repository) DeleteItemOptionTagLink(tagID, itemOptionID uint) error {
	return database.DB.Where("tag_id = ? AND item_option_id = ?", tagID, itemOptionID).Delete(&entities.ItemOptionTagLink{}).Error
}

func (r *Repository) GetItemOptionsByTag(tagID uint) ([]entities.ItemOption, error) {
	var options []entities.ItemOption
	if err := database.DB.
		Joins("JOIN item_option_tag_links ON item_options.id = item_option_tag_links.item_option_id").
		Where("item_option_tag_links.tag_id = ?", tagID).
		Find(&options).Error; err != nil {
		return nil, err
	}
	return options, nil
}

func (r *Repository) GetTagsByItemOption(itemOptionID uint) ([]entities.Tag, error) {
	var tags []entities.Tag
	if err := database.DB.
		Joins("JOIN item_option_tag_links ON tags.id = item_option_tag_links.tag_id").
		Where("item_option_tag_links.item_option_id = ?", itemOptionID).
		Find(&tags).Error; err != nil {
		return nil, err
	}
	return tags, nil
}

func (r *Repository) CreateServiceTagLink(link *entities.ServiceTagLink) (*entities.ServiceTagLink, error) {
	if err := database.DB.Create(link).Error; err != nil {
		return nil, err
	}
	return link, nil
}

func (r *Repository) GetServiceTagLink(tagID, serviceID uint) (*entities.ServiceTagLink, error) {
	var link entities.ServiceTagLink
	if err := database.DB.Where("tag_id = ? AND service_id = ?", tagID, serviceID).First(&link).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &link, nil
}

func (r *Repository) DeleteServiceTagLink(tagID, serviceID uint) error {
	return database.DB.Where("tag_id = ? AND service_id = ?", tagID, serviceID).Delete(&entities.ServiceTagLink{}).Error
}

func (r *Repository) GetServicesByTag(tagID uint) ([]entities.Service, error) {
	var services []entities.Service
	if err := database.DB.
		Joins("JOIN service_tag_links ON services.id = service_tag_links.service_id").
		Where("service_tag_links.tag_id = ?", tagID).
		Find(&services).Error; err != nil {
		return nil, err
	}
	return services, nil
}

func (r *Repository) GetTagsByService(serviceID uint) ([]entities.Tag, error) {
	var tags []entities.Tag
	if err := database.DB.
		Joins("JOIN service_tag_links ON tags.id = service_tag_links.tag_id").
		Where("service_tag_links.service_id = ?", serviceID).
		Find(&tags).Error; err != nil {
		return nil, err
	}
	return tags, nil
}
