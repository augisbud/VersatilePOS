package repository

import (
	"VersatilePOS/database"
	"VersatilePOS/database/entities"

	"gorm.io/gorm"
)

type Repository struct{}

func (r *Repository) CreateOrder(order *entities.Order) (*entities.Order, error) {
	if result := database.DB.Create(order); result.Error != nil {
		return nil, result.Error
	}
	return order, nil
}

func (r *Repository) GetOrders(businessID uint) ([]entities.Order, error) {
	var orders []entities.Order
	query := database.DB.Preload("OrderItems").Preload("OrderPaymentLinks.Payment")
	if businessID != 0 {
		query = query.Where("business_id = ?", businessID)
	}
	if result := query.Find(&orders); result.Error != nil {
		return nil, result.Error
	}
	return orders, nil
}

func (r *Repository) GetOrderByID(id uint) (*entities.Order, error) {
	var order entities.Order
	if result := database.DB.Preload("OrderItems").Preload("OrderItems.ItemOptionLinks").Preload("OrderItems.PriceModifierOrderLinks.PriceModifier").Preload("OrderPaymentLinks.Payment").First(&order, id); result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, result.Error
	}
	return &order, nil
}

func (r *Repository) UpdateOrder(order *entities.Order) error {
	if result := database.DB.Save(order); result.Error != nil {
		return result.Error
	}
	return nil
}

func (r *Repository) CreateOrderItem(orderItem *entities.OrderItem) (*entities.OrderItem, error) {
	if result := database.DB.Create(orderItem); result.Error != nil {
		return nil, result.Error
	}
	return orderItem, nil
}

func (r *Repository) GetOrderItems(orderID uint) ([]entities.OrderItem, error) {
	var orderItems []entities.OrderItem
	if result := database.DB.Where("order_id = ?", orderID).Preload("ItemOptionLinks").Preload("PriceModifierOrderLinks.PriceModifier").Find(&orderItems); result.Error != nil {
		return nil, result.Error
	}
	return orderItems, nil
}

func (r *Repository) GetOrderItemByID(orderID, itemID uint) (*entities.OrderItem, error) {
	var orderItem entities.OrderItem
	if result := database.DB.Where("order_id = ? AND id = ?", orderID, itemID).Preload("ItemOptionLinks").Preload("PriceModifierOrderLinks.PriceModifier").First(&orderItem); result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, result.Error
	}
	return &orderItem, nil
}

func (r *Repository) UpdateOrderItem(orderItem *entities.OrderItem) error {
	if result := database.DB.Save(orderItem); result.Error != nil {
		return result.Error
	}
	return nil
}

func (r *Repository) DeleteOrderItem(orderItem *entities.OrderItem) error {
	if result := database.DB.Delete(orderItem); result.Error != nil {
		return result.Error
	}
	return nil
}

func (r *Repository) CreatePriceModifierOrderLink(link *entities.PriceModifierOrderLink) (*entities.PriceModifierOrderLink, error) {
	if result := database.DB.Create(link); result.Error != nil {
		return nil, result.Error
	}
	return link, nil
}

func (r *Repository) CreateItemOptionLink(link *entities.ItemOptionLink) (*entities.ItemOptionLink, error) {
	if result := database.DB.Create(link); result.Error != nil {
		return nil, result.Error
	}
	return link, nil
}

func (r *Repository) GetItemOptionLinks(orderItemID uint) ([]entities.ItemOptionLink, error) {
	var links []entities.ItemOptionLink
	if result := database.DB.Where("order_item_id = ?", orderItemID).Find(&links); result.Error != nil {
		return nil, result.Error
	}
	return links, nil
}

func (r *Repository) GetItemOptionLinkByID(orderItemID, optionID uint) (*entities.ItemOptionLink, error) {
	var link entities.ItemOptionLink
	if result := database.DB.Where("order_item_id = ? AND id = ?", orderItemID, optionID).First(&link); result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, result.Error
	}
	return &link, nil
}

func (r *Repository) DeleteItemOptionLink(link *entities.ItemOptionLink) error {
	if result := database.DB.Delete(link); result.Error != nil {
		return result.Error
	}
	return nil
}
