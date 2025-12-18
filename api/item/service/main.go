package service

import (
	"VersatilePOS/database/entities"
	"VersatilePOS/generic/constants"
	"VersatilePOS/generic/rbac"
	"VersatilePOS/item/models"
	"VersatilePOS/item/repository"
	"VersatilePOS/priceModifier/modelsas"
	"errors"
)

type Service struct {
	repo repository.Repository
}

func NewService() *Service {
	return &Service{
		repo: repository.Repository{},
	}
}

// Item methods

func (s *Service) CreateItem(req models.CreateItemRequest, userID uint) (*models.ItemDto, error) {
	ok, err := rbac.HasAccess(constants.Items, constants.Write, req.BusinessID, userID)
	if err != nil {
		return nil, errors.New("failed to verify permissions")
	}
	if !ok {
		return nil, errors.New("unauthorized to create items for this business")
	}

	item := &entities.Item{
		BusinessID: req.BusinessID,
		Name:       req.Name,
		Price:      req.Price,
	}

	var inventory *entities.ItemInventory
	if req.TrackInventory {
		inventory = &entities.ItemInventory{
			QuantityInStock: req.QuantityInStock,
		}
	}

	createdItem, err := s.repo.CreateItem(item, inventory)
	if err != nil {
		return nil, err
	}

	dto := &models.ItemDto{
		ID:         createdItem.ID,
		BusinessID: createdItem.BusinessID,
		Name:       createdItem.Name,
		Price:      createdItem.Price,
	}
	if req.TrackInventory {
		dto.QuantityInStock = &req.QuantityInStock
	}

	return dto, nil
}

func (s *Service) GetItems(businessID uint, userID uint) ([]models.ItemDto, error) {
	ok, err := rbac.HasAccess(constants.Items, constants.Read, businessID, userID)
	if err != nil {
		return nil, errors.New("failed to verify permissions")
	}
	if !ok {
		return nil, errors.New("unauthorized to view items for this business")
	}

	items, inventoryMap, err := s.repo.GetItems(businessID)
	if err != nil {
		return nil, err
	}

	dtos := make([]models.ItemDto, len(items))
	for i, item := range items {
		dtos[i] = models.ItemDto{
			ID:         item.ID,
			BusinessID: item.BusinessID,
			Name:       item.Name,
			Price:      item.Price,
		}
		if inv, exists := inventoryMap[item.ID]; exists {
			dtos[i].QuantityInStock = &inv.QuantityInStock
		}
	}

	return dtos, nil
}

func (s *Service) GetItemByID(id uint, userID uint) (*models.ItemDto, error) {
	item, inventory, err := s.repo.GetItemByID(id)
	if err != nil {
		return nil, err
	}
	if item == nil {
		return nil, errors.New("item not found")
	}

	ok, err := rbac.HasAccess(constants.Items, constants.Read, item.BusinessID, userID)
	if err != nil {
		return nil, errors.New("failed to verify permissions")
	}
	if !ok {
		return nil, errors.New("unauthorized to view this item")
	}

	dto := &models.ItemDto{
		ID:         item.ID,
		BusinessID: item.BusinessID,
		Name:       item.Name,
		Price:      item.Price,
	}
	if inventory != nil {
		dto.QuantityInStock = &inventory.QuantityInStock
	}

	return dto, nil
}

func (s *Service) UpdateItem(id uint, req models.UpdateItemRequest, userID uint) (*models.ItemDto, error) {
	item, inventory, err := s.repo.GetItemByID(id)
	if err != nil {
		return nil, err
	}
	if item == nil {
		return nil, errors.New("item not found")
	}

	ok, err := rbac.HasAccess(constants.Items, constants.Write, item.BusinessID, userID)
	if err != nil {
		return nil, errors.New("failed to verify permissions")
	}
	if !ok {
		return nil, errors.New("unauthorized to update this item")
	}

	if req.Name != "" {
		item.Name = req.Name
	}
	if req.Price != 0 {
		item.Price = req.Price
	}

	if req.TrackInventory != nil && *req.TrackInventory {
		if inventory == nil {
			inventory = &entities.ItemInventory{ItemID: item.ID}
		}
	}

	if req.QuantityInStock != nil && inventory != nil {
		inventory.QuantityInStock = *req.QuantityInStock
	}

	err = s.repo.UpdateItem(item, inventory, req.TrackInventory)
	if err != nil {
		return nil, err
	}

	dto := &models.ItemDto{
		ID:         item.ID,
		BusinessID: item.BusinessID,
		Name:       item.Name,
		Price:      item.Price,
	}

	if req.TrackInventory != nil && !*req.TrackInventory {
		dto.QuantityInStock = nil
	} else if inventory != nil {
		dto.QuantityInStock = &inventory.QuantityInStock
	}

	return dto, nil
}

func (s *Service) DeleteItem(id uint, userID uint) error {
	item, _, err := s.repo.GetItemByID(id)
	if err != nil {
		return err
	}
	if item == nil {
		return errors.New("item not found")
	}

	ok, err := rbac.HasAccess(constants.Items, constants.Write, item.BusinessID, userID)
	if err != nil {
		return errors.New("failed to verify permissions")
	}
	if !ok {
		return errors.New("unauthorized to delete this item")
	}

	return s.repo.DeleteItem(id)
}

// ItemOption methods

func (s *Service) CreateItemOption(req models.CreateItemOptionRequest, userID uint) (*models.ItemOptionDto, error) {
	item, _, err := s.repo.GetItemByID(req.ItemID)
	if err != nil {
		return nil, err
	}
	if item == nil {
		return nil, errors.New("item not found")
	}

	ok, err := rbac.HasAccess(constants.ItemOptions, constants.Write, item.BusinessID, userID)
	if err != nil {
		return nil, errors.New("failed to verify permissions")
	}
	if !ok {
		return nil, errors.New("unauthorized to create item options for this business")
	}

	option := &entities.ItemOption{
		ItemID:          req.ItemID,
		Name:            req.Name,
		PriceModifierID: req.PriceModifierID,
	}

	var inventory *entities.ItemOptionInventory
	if req.TrackInventory {
		inventory = &entities.ItemOptionInventory{
			QuantityInStock: req.QuantityInStock,
		}
	}

	createdOption, err := s.repo.CreateItemOption(option, inventory)
	if err != nil {
		return nil, err
	}

	dto := &models.ItemOptionDto{
		ID:              createdOption.ID,
		ItemID:          createdOption.ItemID,
		Name:            createdOption.Name,
		PriceModifierID: createdOption.PriceModifierID,
	}
	if req.TrackInventory {
		dto.QuantityInStock = &req.QuantityInStock
	}

	return dto, nil
}

func (s *Service) GetItemOptions(businessID uint, userID uint) ([]models.ItemOptionDto, error) {
	ok, err := rbac.HasAccess(constants.ItemOptions, constants.Read, businessID, userID)
	if err != nil {
		return nil, errors.New("failed to verify permissions")
	}
	if !ok {
		return nil, errors.New("unauthorized to view item options for this business")
	}

	options, inventoryMap, err := s.repo.GetItemOptions(businessID)
	if err != nil {
		return nil, err
	}

	dtos := make([]models.ItemOptionDto, len(options))
	for i, option := range options {
		dtos[i] = models.ItemOptionDto{
			ID:              option.ID,
			ItemID:          option.ItemID,
			Name:            option.Name,
			PriceModifierID: option.PriceModifierID,
		}
		if inv, exists := inventoryMap[option.ID]; exists {
			dtos[i].QuantityInStock = &inv.QuantityInStock
		}
	}

	return dtos, nil
}

func (s *Service) GetItemOptionByID(id uint, userID uint) (*models.ItemOptionDto, error) {
	option, inventory, err := s.repo.GetItemOptionByID(id)
	if err != nil {
		return nil, err
	}
	if option == nil {
		return nil, errors.New("item option not found")
	}

	ok, err := rbac.HasAccess(constants.ItemOptions, constants.Read, option.Item.BusinessID, userID)
	if err != nil {
		return nil, errors.New("failed to verify permissions")
	}
	if !ok {
		return nil, errors.New("unauthorized to view this item option")
	}

	dto := &models.ItemOptionDto{
		ID:              option.ID,
		ItemID:          option.ItemID,
		Name:            option.Name,
		PriceModifierID: option.PriceModifierID,
	}
	if inventory != nil {
		dto.QuantityInStock = &inventory.QuantityInStock
	}

	return dto, nil
}

func (s *Service) UpdateItemOption(id uint, req models.UpdateItemOptionRequest, userID uint) (*models.ItemOptionDto, error) {
	option, inventory, err := s.repo.GetItemOptionByID(id)
	if err != nil {
		return nil, err
	}
	if option == nil {
		return nil, errors.New("item option not found")
	}

	ok, err := rbac.HasAccess(constants.ItemOptions, constants.Write, option.Item.BusinessID, userID)
	if err != nil {
		return nil, errors.New("failed to verify permissions")
	}
	if !ok {
		return nil, errors.New("unauthorized to update this item option")
	}

	if req.Name != "" {
		option.Name = req.Name
	}
	if req.PriceModifierID != 0 {
		option.PriceModifierID = req.PriceModifierID
	}

	if req.TrackInventory != nil && *req.TrackInventory {
		if inventory == nil {
			inventory = &entities.ItemOptionInventory{ItemOptionID: option.ID}
		}
		if req.TrackInventory != nil && *req.TrackInventory {
			if inventory == nil {
				inventory = &entities.ItemOptionInventory{ItemOptionID: option.ID}
			}
		}

		if req.QuantityInStock != nil && inventory != nil {
			inventory.QuantityInStock = *req.QuantityInStock
		}
	}

	dto := &models.ItemOptionDto{
		ID:              option.ID,
		ItemID:          option.ItemID,
		Name:            option.Name,
		PriceModifierID: option.PriceModifierID,
	}

	if req.TrackInventory != nil && !*req.TrackInventory {
		dto.QuantityInStock = nil
	} else if inventory != nil {
		dto.QuantityInStock = &inventory.QuantityInStock
	}

	return dto, nil
}

func (s *Service) DeleteItemOption(id uint, userID uint) error {
	option, _, err := s.repo.GetItemOptionByID(id)
	if err != nil {
		return err
	}
	if option == nil {
		return errors.New("item option not found")
	}

	ok, err := rbac.HasAccess(constants.ItemOptions, constants.Write, option.Item.BusinessID, userID)
	if err != nil {
		return errors.New("failed to verify permissions")
	}
	if !ok {
		return errors.New("unauthorized to delete this item option")
	}

	return s.repo.DeleteItemOption(id)
}

func (s *Service) ApplyPriceModifierToItem(itemID uint, req models.ApplyPriceModifierToItemRequest, userID uint) error {
	item, _, err := s.repo.GetItemByID(itemID)
	if err != nil {
		return err
	}
	if item == nil {
		return errors.New("item not found")
	}

	// Check RBAC permissions
	ok, err := rbac.HasAccess(constants.Items, constants.Write, item.BusinessID, userID)
	if err != nil {
		return errors.New("failed to verify permissions")
	}
	if !ok {
		return errors.New("unauthorized to modify this item")
	}

	link := &entities.PriceModifierItemLink{
		PriceModifierID: req.PriceModifierID,
		ItemID:          itemID,
	}

	_, err = s.repo.CreatePriceModifierItemLink(link)
	return err
}

func (s *Service) RemovePriceModifierFromItem(itemID uint, priceModifierID uint, userID uint) error {
	item, _, err := s.repo.GetItemByID(itemID)
	if err != nil {
		return err
	}
	if item == nil {
		return errors.New("item not found")
	}

	// Check RBAC permissions
	ok, err := rbac.HasAccess(constants.Items, constants.Write, item.BusinessID, userID)
	if err != nil {
		return errors.New("failed to verify permissions")
	}
	if !ok {
		return errors.New("unauthorized to modify this item")
	}

	return s.repo.DeletePriceModifierFromItem(itemID, priceModifierID)
}

func (s *Service) GetItemWithPriceModifiers(id uint, userID uint) (*models.ItemWithModifiersDto, error) {
	item, inventory, priceModifiers, err := s.repo.GetItemWithPriceModifiers(id)
	if err != nil {
		return nil, err
	}
	if item == nil {
		return nil, errors.New("item not found")
	}

	// Check RBAC permissions
	ok, err := rbac.HasAccess(constants.Items, constants.Read, item.BusinessID, userID)
	if err != nil {
		return nil, errors.New("failed to verify permissions")
	}
	if !ok {
		return nil, errors.New("unauthorized to view this item")
	}

	// Convert price modifiers to DTOs
	priceModifierDtos := make([]modelsas.PriceModifierDto, len(priceModifiers))
	for i, pm := range priceModifiers {
		priceModifierDtos[i] = modelsas.NewPriceModifierDtoFromEntity(pm)
	}

	// Calculate final price
	finalPrice := s.calculateFinalPrice(item.Price, priceModifiers)

	dto := &models.ItemWithModifiersDto{
		ID:             item.ID,
		BusinessID:     item.BusinessID,
		Name:           item.Name,
		Price:          item.Price,
		PriceModifiers: priceModifierDtos,
		FinalPrice:     finalPrice,
	}

	if inventory != nil {
		dto.QuantityInStock = &inventory.QuantityInStock
	}

	return dto, nil
}

func (s *Service) GetItemsWithPriceModifiers(businessID uint, userID uint) ([]models.ItemWithModifiersDto, error) {
	// Check RBAC permissions
	ok, err := rbac.HasAccess(constants.Items, constants.Read, businessID, userID)
	if err != nil {
		return nil, errors.New("failed to verify permissions")
	}
	if !ok {
		return nil, errors.New("unauthorized to view items for this business")
	}

	items, inventoryMap, priceModifierMap, err := s.repo.GetItemsWithPriceModifiers(businessID)
	if err != nil {
		return nil, err
	}

	dtos := make([]models.ItemWithModifiersDto, len(items))
	for i, item := range items {
		// Convert price modifiers to DTOs
		priceModifiers := priceModifierMap[item.ID]
		priceModifierDtos := make([]modelsas.PriceModifierDto, len(priceModifiers))
		for j, pm := range priceModifiers {
			priceModifierDtos[j] = modelsas.NewPriceModifierDtoFromEntity(pm)
		}

		// Calculate final price
		finalPrice := s.calculateFinalPrice(item.Price, priceModifiers)

		dtos[i] = models.ItemWithModifiersDto{
			ID:             item.ID,
			BusinessID:     item.BusinessID,
			Name:           item.Name,
			Price:          item.Price,
			PriceModifiers: priceModifierDtos,
			FinalPrice:     finalPrice,
		}

		if inv, exists := inventoryMap[item.ID]; exists {
			dtos[i].QuantityInStock = &inv.QuantityInStock
		}
	}

	return dtos, nil
}

// Helper function to calculate final price after applying all modifiers
func (s *Service) calculateFinalPrice(basePrice float64, priceModifiers []entities.PriceModifier) float64 {
	finalPrice := basePrice

	// Apply discounts and surcharges first (they affect the base price)
	for _, modifier := range priceModifiers {
		if modifier.ModifierType == constants.Discount || modifier.ModifierType == constants.Surcharge {
			if modifier.IsPercentage {
				if modifier.ModifierType == constants.Discount {
					finalPrice = finalPrice * (1 - modifier.Value/100)
				} else { // Surcharge
					finalPrice = finalPrice * (1 + modifier.Value/100)
				}
			} else {
				if modifier.ModifierType == constants.Discount {
					finalPrice = finalPrice - modifier.Value
				} else { // Surcharge
					finalPrice = finalPrice + modifier.Value
				}
			}
		}
	}

	// Then apply taxes (they are calculated on the discounted/surcharged price)
	for _, modifier := range priceModifiers {
		if modifier.ModifierType == constants.Tax {
			if modifier.IsPercentage {
				finalPrice = finalPrice * (1 + modifier.Value/100)
			} else {
				finalPrice = finalPrice + modifier.Value
			}
		}
	}

	// Tips are usually added last and don't change the item price in most POS systems
	// But if needed, they can be applied here similar to taxes

	// Ensure the final price is not negative
	if finalPrice < 0 {
		finalPrice = 0
	}

	return finalPrice
}
