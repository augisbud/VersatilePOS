package service

import (
	itemModels "VersatilePOS/item/models"
	itemRepository "VersatilePOS/item/repository"
	serviceModels "VersatilePOS/service/models"
	serviceRepository "VersatilePOS/service/repository"
	"VersatilePOS/database"
	"VersatilePOS/database/entities"
	"VersatilePOS/generic/constants"
	"VersatilePOS/generic/rbac"
	tagModels "VersatilePOS/tag/models"
	"VersatilePOS/tag/repository"
	"errors"
)

type Service struct {
	repo         repository.Repository
	itemRepo     itemRepository.Repository
	serviceRepo  serviceRepository.Repository
}

func NewService() *Service {
	return &Service{
		repo:        repository.Repository{},
		itemRepo:    itemRepository.Repository{},
		serviceRepo: serviceRepository.Repository{},
	}
}

// Tag CRUD operations

func (s *Service) CreateTag(req tagModels.CreateTagRequest, userID uint) (*tagModels.TagDto, error) {
	ok, err := rbac.HasAccess(constants.Tags, constants.Write, req.BusinessID, userID)
	if err != nil {
		return nil, errors.New("failed to verify permissions")
	}
	if !ok {
		return nil, errors.New("unauthorized to create tags for this business")
	}

	tag := &entities.Tag{
		BusinessID: req.BusinessID,
		Value:      req.Value,
	}

	createdTag, err := s.repo.CreateTag(tag)
	if err != nil {
		return nil, err
	}

	return &tagModels.TagDto{
		ID:         createdTag.ID,
		BusinessID: createdTag.BusinessID,
		Value:      createdTag.Value,
	}, nil
}

func (s *Service) GetTags(businessID uint, userID uint) ([]tagModels.TagDto, error) {
	ok, err := rbac.HasAccess(constants.Tags, constants.Read, businessID, userID)
	if err != nil {
		return nil, errors.New("failed to verify permissions")
	}
	if !ok {
		return nil, errors.New("unauthorized to view tags for this business")
	}

	tags, err := s.repo.GetTags(businessID)
	if err != nil {
		return nil, err
	}

	dtos := make([]tagModels.TagDto, len(tags))
	for i, tag := range tags {
		dtos[i] = tagModels.TagDto{
			ID:         tag.ID,
			BusinessID: tag.BusinessID,
			Value:      tag.Value,
		}
	}

	return dtos, nil
}

func (s *Service) GetTagByID(id uint, userID uint) (*tagModels.TagDto, error) {
	tag, err := s.repo.GetTagByID(id)
	if err != nil {
		return nil, err
	}
	if tag == nil {
		return nil, errors.New("tag not found")
	}

	ok, err := rbac.HasAccess(constants.Tags, constants.Read, tag.BusinessID, userID)
	if err != nil {
		return nil, errors.New("failed to verify permissions")
	}
	if !ok {
		return nil, errors.New("unauthorized to view this tag")
	}

	return &tagModels.TagDto{
		ID:         tag.ID,
		BusinessID: tag.BusinessID,
		Value:      tag.Value,
	}, nil
}

func (s *Service) UpdateTag(id uint, req tagModels.UpdateTagRequest, userID uint) (*tagModels.TagDto, error) {
	tag, err := s.repo.GetTagByID(id)
	if err != nil {
		return nil, err
	}
	if tag == nil {
		return nil, errors.New("tag not found")
	}

	ok, err := rbac.HasAccess(constants.Tags, constants.Write, tag.BusinessID, userID)
	if err != nil {
		return nil, errors.New("failed to verify permissions")
	}
	if !ok {
		return nil, errors.New("unauthorized to update this tag")
	}

	tag.Value = req.Value

	err = s.repo.UpdateTag(tag)
	if err != nil {
		return nil, err
	}

	return &tagModels.TagDto{
		ID:         tag.ID,
		BusinessID: tag.BusinessID,
		Value:      tag.Value,
	}, nil
}

func (s *Service) DeleteTag(id uint, userID uint) error {
	tag, err := s.repo.GetTagByID(id)
	if err != nil {
		return err
	}
	if tag == nil {
		return errors.New("tag not found")
	}

	ok, err := rbac.HasAccess(constants.Tags, constants.Write, tag.BusinessID, userID)
	if err != nil {
		return errors.New("failed to verify permissions")
	}
	if !ok {
		return errors.New("unauthorized to delete this tag")
	}

	return s.repo.DeleteTag(id)
}

// Link operations

func (s *Service) LinkItemToTag(tagID uint, req tagModels.LinkItemRequest, userID uint) error {
	// Verify tag exists and get business ID
	tag, err := s.repo.GetTagByID(tagID)
	if err != nil {
		return err
	}
	if tag == nil {
		return errors.New("tag not found")
	}

	// Check RBAC for tag
	ok, err := rbac.HasAccess(constants.Tags, constants.Write, tag.BusinessID, userID)
	if err != nil {
		return errors.New("failed to verify permissions")
	}
	if !ok {
		return errors.New("unauthorized to modify this tag")
	}

	// Verify item exists and belongs to same business
	item, _, err := s.itemRepo.GetItemByID(req.ItemID)
	if err != nil {
		return err
	}
	if item == nil {
		return errors.New("item not found")
	}

	if item.BusinessID != tag.BusinessID {
		return errors.New("item does not belong to the same business as the tag")
	}

	// Check if link already exists
	existingLink, err := s.repo.GetItemTagLink(tagID, req.ItemID)
	if err != nil {
		return err
	}
	if existingLink != nil {
		return errors.New("item is already linked to this tag")
	}

	// Create link
	link := &entities.ItemTagLink{
		TagID:  tagID,
		ItemID: req.ItemID,
	}

	_, err = s.repo.CreateItemTagLink(link)
	return err
}

func (s *Service) UnlinkItemFromTag(tagID uint, itemID uint, userID uint) error {
	// Verify tag exists and get business ID
	tag, err := s.repo.GetTagByID(tagID)
	if err != nil {
		return err
	}
	if tag == nil {
		return errors.New("tag not found")
	}

	// Check RBAC for tag
	ok, err := rbac.HasAccess(constants.Tags, constants.Write, tag.BusinessID, userID)
	if err != nil {
		return errors.New("failed to verify permissions")
	}
	if !ok {
		return errors.New("unauthorized to modify this tag")
	}

	return s.repo.DeleteItemTagLink(tagID, itemID)
}

func (s *Service) LinkItemOptionToTag(tagID uint, req tagModels.LinkItemOptionRequest, userID uint) error {
	// Verify tag exists and get business ID
	tag, err := s.repo.GetTagByID(tagID)
	if err != nil {
		return err
	}
	if tag == nil {
		return errors.New("tag not found")
	}

	// Check RBAC for tag
	ok, err := rbac.HasAccess(constants.Tags, constants.Write, tag.BusinessID, userID)
	if err != nil {
		return errors.New("failed to verify permissions")
	}
	if !ok {
		return errors.New("unauthorized to modify this tag")
	}

	// Verify item option exists and belongs to same business
	itemOption, _, err := s.itemRepo.GetItemOptionByID(req.ItemOptionID)
	if err != nil {
		return err
	}
	if itemOption == nil {
		return errors.New("item option not found")
	}

	if itemOption.Item.BusinessID != tag.BusinessID {
		return errors.New("item option does not belong to the same business as the tag")
	}

	// Check if link already exists
	existingLink, err := s.repo.GetItemOptionTagLink(tagID, req.ItemOptionID)
	if err != nil {
		return err
	}
	if existingLink != nil {
		return errors.New("item option is already linked to this tag")
	}

	// Create link
	link := &entities.ItemOptionTagLink{
		TagID:        tagID,
		ItemOptionID: req.ItemOptionID,
	}

	_, err = s.repo.CreateItemOptionTagLink(link)
	return err
}

func (s *Service) UnlinkItemOptionFromTag(tagID uint, itemOptionID uint, userID uint) error {
	// Verify tag exists and get business ID
	tag, err := s.repo.GetTagByID(tagID)
	if err != nil {
		return err
	}
	if tag == nil {
		return errors.New("tag not found")
	}

	// Check RBAC for tag
	ok, err := rbac.HasAccess(constants.Tags, constants.Write, tag.BusinessID, userID)
	if err != nil {
		return errors.New("failed to verify permissions")
	}
	if !ok {
		return errors.New("unauthorized to modify this tag")
	}

	return s.repo.DeleteItemOptionTagLink(tagID, itemOptionID)
}

func (s *Service) LinkServiceToTag(tagID uint, req tagModels.LinkServiceRequest, userID uint) error {
	// Verify tag exists and get business ID
	tag, err := s.repo.GetTagByID(tagID)
	if err != nil {
		return err
	}
	if tag == nil {
		return errors.New("tag not found")
	}

	// Check RBAC for tag
	ok, err := rbac.HasAccess(constants.Tags, constants.Write, tag.BusinessID, userID)
	if err != nil {
		return errors.New("failed to verify permissions")
	}
	if !ok {
		return errors.New("unauthorized to modify this tag")
	}

	// Verify service exists and belongs to same business
	service, err := s.serviceRepo.GetServiceByID(req.ServiceID)
	if err != nil {
		return err
	}
	if service == nil {
		return errors.New("service not found")
	}

	if service.BusinessID != tag.BusinessID {
		return errors.New("service does not belong to the same business as the tag")
	}

	// Check if link already exists
	existingLink, err := s.repo.GetServiceTagLink(tagID, req.ServiceID)
	if err != nil {
		return err
	}
	if existingLink != nil {
		return errors.New("service is already linked to this tag")
	}

	// Create link
	link := &entities.ServiceTagLink{
		TagID:     tagID,
		ServiceID: req.ServiceID,
	}

	_, err = s.repo.CreateServiceTagLink(link)
	return err
}

func (s *Service) UnlinkServiceFromTag(tagID uint, serviceID uint, userID uint) error {
	// Verify tag exists and get business ID
	tag, err := s.repo.GetTagByID(tagID)
	if err != nil {
		return err
	}
	if tag == nil {
		return errors.New("tag not found")
	}

	// Check RBAC for tag
	ok, err := rbac.HasAccess(constants.Tags, constants.Write, tag.BusinessID, userID)
	if err != nil {
		return errors.New("failed to verify permissions")
	}
	if !ok {
		return errors.New("unauthorized to modify this tag")
	}

	return s.repo.DeleteServiceTagLink(tagID, serviceID)
}

// Query methods - Get entities by tag

func (s *Service) GetItemsByTag(tagID uint, userID uint) ([]itemModels.ItemDto, error) {
	// Verify tag exists and get business ID
	tag, err := s.repo.GetTagByID(tagID)
	if err != nil {
		return nil, err
	}
	if tag == nil {
		return nil, errors.New("tag not found")
	}

	// Check RBAC for tag
	ok, err := rbac.HasAccess(constants.Tags, constants.Read, tag.BusinessID, userID)
	if err != nil {
		return nil, errors.New("failed to verify permissions")
	}
	if !ok {
		return nil, errors.New("unauthorized to view this tag")
	}

	// Get items linked to tag
	items, err := s.repo.GetItemsByTag(tagID)
	if err != nil {
		return nil, err
	}

	// Get inventory for items
	itemIDs := make([]uint, len(items))
	for i, item := range items {
		itemIDs[i] = item.ID
	}

	inventoryMap := make(map[uint]*entities.ItemInventory)
	if len(itemIDs) > 0 {
		var inventories []entities.ItemInventory
		if err := database.DB.Where("item_id IN ?", itemIDs).Find(&inventories).Error; err == nil {
			for i := range inventories {
				inventoryMap[inventories[i].ItemID] = &inventories[i]
			}
		}
	}

	// Convert to DTOs
	dtos := make([]itemModels.ItemDto, len(items))
	for i, item := range items {
		dtos[i] = itemModels.ItemDto{
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

func (s *Service) GetItemOptionsByTag(tagID uint, userID uint) ([]itemModels.ItemOptionDto, error) {
	// Verify tag exists and get business ID
	tag, err := s.repo.GetTagByID(tagID)
	if err != nil {
		return nil, err
	}
	if tag == nil {
		return nil, errors.New("tag not found")
	}

	// Check RBAC for tag
	ok, err := rbac.HasAccess(constants.Tags, constants.Read, tag.BusinessID, userID)
	if err != nil {
		return nil, errors.New("failed to verify permissions")
	}
	if !ok {
		return nil, errors.New("unauthorized to view this tag")
	}

	// Get item options linked to tag
	options, err := s.repo.GetItemOptionsByTag(tagID)
	if err != nil {
		return nil, err
	}

	// Get inventory for item options
	optionIDs := make([]uint, len(options))
	for i, option := range options {
		optionIDs[i] = option.ID
	}

	inventoryMap := make(map[uint]*entities.ItemOptionInventory)
	if len(optionIDs) > 0 {
		var inventories []entities.ItemOptionInventory
		if err := database.DB.Where("item_option_id IN ?", optionIDs).Find(&inventories).Error; err == nil {
			for i := range inventories {
				inventoryMap[inventories[i].ItemOptionID] = &inventories[i]
			}
		}
	}

	// Convert to DTOs
	dtos := make([]itemModels.ItemOptionDto, len(options))
	for i, option := range options {
		dtos[i] = itemModels.ItemOptionDto{
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

func (s *Service) GetServicesByTag(tagID uint, userID uint) ([]serviceModels.ServiceDto, error) {
	// Verify tag exists and get business ID
	tag, err := s.repo.GetTagByID(tagID)
	if err != nil {
		return nil, err
	}
	if tag == nil {
		return nil, errors.New("tag not found")
	}

	// Check RBAC for tag
	ok, err := rbac.HasAccess(constants.Tags, constants.Read, tag.BusinessID, userID)
	if err != nil {
		return nil, errors.New("failed to verify permissions")
	}
	if !ok {
		return nil, errors.New("unauthorized to view this tag")
	}

	// Get services linked to tag
	services, err := s.repo.GetServicesByTag(tagID)
	if err != nil {
		return nil, err
	}

	// Convert to DTOs
	dtos := make([]serviceModels.ServiceDto, len(services))
	for i, service := range services {
		dtos[i] = serviceModels.NewServiceDtoFromEntity(service)
	}

	return dtos, nil
}

// Query methods - Get tags by entity

func (s *Service) GetTagsByItem(itemID uint, userID uint) ([]tagModels.TagDto, error) {
	// Verify item exists and get business ID
	item, _, err := s.itemRepo.GetItemByID(itemID)
	if err != nil {
		return nil, err
	}
	if item == nil {
		return nil, errors.New("item not found")
	}

	// Check RBAC for item
	ok, err := rbac.HasAccess(constants.Items, constants.Read, item.BusinessID, userID)
	if err != nil {
		return nil, errors.New("failed to verify permissions")
	}
	if !ok {
		return nil, errors.New("unauthorized to view this item")
	}

	// Get tags linked to item
	tags, err := s.repo.GetTagsByItem(itemID)
	if err != nil {
		return nil, err
	}

	// Convert to DTOs
	dtos := make([]tagModels.TagDto, len(tags))
	for i, tag := range tags {
		dtos[i] = tagModels.TagDto{
			ID:         tag.ID,
			BusinessID: tag.BusinessID,
			Value:      tag.Value,
		}
	}

	return dtos, nil
}

func (s *Service) GetTagsByItemOption(itemOptionID uint, userID uint) ([]tagModels.TagDto, error) {
	// Verify item option exists and get business ID
	itemOption, _, err := s.itemRepo.GetItemOptionByID(itemOptionID)
	if err != nil {
		return nil, err
	}
	if itemOption == nil {
		return nil, errors.New("item option not found")
	}

	// Check RBAC for item option
	ok, err := rbac.HasAccess(constants.ItemOptions, constants.Read, itemOption.Item.BusinessID, userID)
	if err != nil {
		return nil, errors.New("failed to verify permissions")
	}
	if !ok {
		return nil, errors.New("unauthorized to view this item option")
	}

	// Get tags linked to item option
	tags, err := s.repo.GetTagsByItemOption(itemOptionID)
	if err != nil {
		return nil, err
	}

	// Convert to DTOs
	dtos := make([]tagModels.TagDto, len(tags))
	for i, tag := range tags {
		dtos[i] = tagModels.TagDto{
			ID:         tag.ID,
			BusinessID: tag.BusinessID,
			Value:      tag.Value,
		}
	}

	return dtos, nil
}

func (s *Service) GetTagsByService(serviceID uint, userID uint) ([]tagModels.TagDto, error) {
	// Verify service exists and get business ID
	service, err := s.serviceRepo.GetServiceByID(serviceID)
	if err != nil {
		return nil, err
	}
	if service == nil {
		return nil, errors.New("service not found")
	}

	// Check RBAC for service
	ok, err := rbac.HasAccess(constants.Services, constants.Read, service.BusinessID, userID)
	if err != nil {
		return nil, errors.New("failed to verify permissions")
	}
	if !ok {
		return nil, errors.New("unauthorized to view this service")
	}

	// Get tags linked to service
	tags, err := s.repo.GetTagsByService(serviceID)
	if err != nil {
		return nil, err
	}

	// Convert to DTOs
	dtos := make([]tagModels.TagDto, len(tags))
	for i, tag := range tags {
		dtos[i] = tagModels.TagDto{
			ID:         tag.ID,
			BusinessID: tag.BusinessID,
			Value:      tag.Value,
		}
	}

	return dtos, nil
}

// GetAllEntitiesByTag returns all items, item options, and services linked to a tag
func (s *Service) GetAllEntitiesByTag(tagID uint, userID uint) (*tagModels.TagEntitiesResponse, error) {
	// Verify tag exists and get business ID
	tag, err := s.repo.GetTagByID(tagID)
	if err != nil {
		return nil, err
	}
	if tag == nil {
		return nil, errors.New("tag not found")
	}

	// Check RBAC for tag
	ok, err := rbac.HasAccess(constants.Tags, constants.Read, tag.BusinessID, userID)
	if err != nil {
		return nil, errors.New("failed to verify permissions")
	}
	if !ok {
		return nil, errors.New("unauthorized to view this tag")
	}

	// Get all entities linked to tag
	items, err := s.repo.GetItemsByTag(tagID)
	if err != nil {
		return nil, err
	}

	itemOptions, err := s.repo.GetItemOptionsByTag(tagID)
	if err != nil {
		return nil, err
	}

	services, err := s.repo.GetServicesByTag(tagID)
	if err != nil {
		return nil, err
	}

	// Get inventory for items
	itemIDs := make([]uint, len(items))
	for i, item := range items {
		itemIDs[i] = item.ID
	}

	itemInventoryMap := make(map[uint]*entities.ItemInventory)
	if len(itemIDs) > 0 {
		var inventories []entities.ItemInventory
		if err := database.DB.Where("item_id IN ?", itemIDs).Find(&inventories).Error; err == nil {
			for i := range inventories {
				itemInventoryMap[inventories[i].ItemID] = &inventories[i]
			}
		}
	}

	// Convert items to DTOs
	itemDtos := make([]interface{}, len(items))
	for i, item := range items {
		dto := itemModels.ItemDto{
			ID:         item.ID,
			BusinessID: item.BusinessID,
			Name:       item.Name,
			Price:      item.Price,
		}
		if inv, exists := itemInventoryMap[item.ID]; exists {
			dto.QuantityInStock = &inv.QuantityInStock
		}
		itemDtos[i] = dto
	}

	// Get inventory for item options
	optionIDs := make([]uint, len(itemOptions))
	for i, option := range itemOptions {
		optionIDs[i] = option.ID
	}

	optionInventoryMap := make(map[uint]*entities.ItemOptionInventory)
	if len(optionIDs) > 0 {
		var inventories []entities.ItemOptionInventory
		if err := database.DB.Where("item_option_id IN ?", optionIDs).Find(&inventories).Error; err == nil {
			for i := range inventories {
				optionInventoryMap[inventories[i].ItemOptionID] = &inventories[i]
			}
		}
	}

	// Convert item options to DTOs
	itemOptionDtos := make([]interface{}, len(itemOptions))
	for i, option := range itemOptions {
		dto := itemModels.ItemOptionDto{
			ID:              option.ID,
			ItemID:          option.ItemID,
			Name:            option.Name,
			PriceModifierID: option.PriceModifierID,
		}
		if inv, exists := optionInventoryMap[option.ID]; exists {
			dto.QuantityInStock = &inv.QuantityInStock
		}
		itemOptionDtos[i] = dto
	}

	// Convert services to DTOs
	serviceDtos := make([]interface{}, len(services))
	for i, service := range services {
		serviceDtos[i] = serviceModels.NewServiceDtoFromEntity(service)
	}

	return &tagModels.TagEntitiesResponse{
		Items:       itemDtos,
		ItemOptions: itemOptionDtos,
		Services:    serviceDtos,
	}, nil
}
