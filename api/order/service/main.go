package service

import (
	orderModels "VersatilePOS/order/models"
	"VersatilePOS/order/repository"
	itemRepository "VersatilePOS/item/repository"
	paymentRepository "VersatilePOS/payment/repository"
	"VersatilePOS/database"
	"VersatilePOS/database/entities"
	"VersatilePOS/generic/constants"
	"VersatilePOS/generic/rbac"
	"errors"
	"gorm.io/gorm"
	"time"
)

type Service struct {
	repo         repository.Repository
	itemRepo     itemRepository.Repository
	paymentRepo  paymentRepository.Repository
}

func NewService() *Service {
	return &Service{
		repo:        repository.Repository{},
		itemRepo:    itemRepository.Repository{},
		paymentRepo: paymentRepository.Repository{},
	}
}

// isOrderInFinalState checks if an order is in a final state (cannot be modified)
func isOrderInFinalState(status constants.OrderStatus) bool {
	return status == constants.OrderConfirmed || status == constants.OrderCompleted || status == constants.OrderRefunded
}

func (s *Service) CreateOrder(req orderModels.CreateOrderRequest, userID uint) (*orderModels.OrderDto, error) {
	// Check RBAC permissions
	ok, err := rbac.HasAccess(constants.Orders, constants.Write, req.BusinessID, userID)
	if err != nil {
		return nil, errors.New("failed to verify permissions")
	}
	if !ok {
		return nil, errors.New("unauthorized to create orders for this business")
	}

	now := time.Now()
	order := &entities.Order{
		BusinessID:        req.BusinessID,
		ServicingAccountID: req.ServicingAccountID,
		DatePlaced:        now,
		Status:            constants.OrderPending,
		TipAmount:         req.TipAmount,
		ServiceCharge:     req.ServiceCharge,
		Customer:          req.Customer,
		CustomerEmail:     req.CustomerEmail,
		CustomerPhone:     req.CustomerPhone,
		ValidFrom:         &now,
	}

	createdOrder, err := s.repo.CreateOrder(order)
	if err != nil {
		return nil, err
	}

	dto := orderModels.NewOrderDtoFromEntity(*createdOrder)
	return &dto, nil
}

func (s *Service) GetOrders(businessID uint, userID uint) ([]orderModels.OrderDto, error) {
	// Check RBAC permissions
	ok, err := rbac.HasAccess(constants.Orders, constants.Read, businessID, userID)
	if err != nil {
		return nil, errors.New("failed to verify permissions")
	}
	if !ok {
		return nil, errors.New("unauthorized to view orders for this business")
	}

	orders, err := s.repo.GetOrders(businessID)
	if err != nil {
		return nil, err
	}

	var orderDtos []orderModels.OrderDto
	for _, order := range orders {
		orderDtos = append(orderDtos, orderModels.NewOrderDtoFromEntity(order))
	}

	return orderDtos, nil
}

func (s *Service) GetOrderByID(id uint, userID uint) (*orderModels.OrderDto, error) {
	order, err := s.repo.GetOrderByID(id)
	if err != nil {
		return nil, err
	}
	if order == nil {
		return nil, errors.New("order not found")
	}

	// Check RBAC permissions
	ok, err := rbac.HasAccess(constants.Orders, constants.Read, order.BusinessID, userID)
	if err != nil {
		return nil, errors.New("failed to verify permissions")
	}
	if !ok {
		return nil, errors.New("unauthorized to view this order")
	}

	dto := orderModels.NewOrderDtoFromEntity(*order)
	return &dto, nil
}

func (s *Service) UpdateOrder(id uint, req orderModels.UpdateOrderRequest, userID uint) (*orderModels.OrderDto, error) {
	order, err := s.repo.GetOrderByID(id)
	if err != nil {
		return nil, err
	}
	if order == nil {
		return nil, errors.New("order not found")
	}

	// Check RBAC permissions
	ok, err := rbac.HasAccess(constants.Orders, constants.Write, order.BusinessID, userID)
	if err != nil {
		return nil, errors.New("failed to verify permissions")
	}
	if !ok {
		return nil, errors.New("unauthorized to update this order")
	}

	if req.Status != nil {
		order.Status = constants.OrderStatus(*req.Status)
		// Validate status
		if order.Status != constants.OrderPending && order.Status != constants.OrderConfirmed &&
			order.Status != constants.OrderCompleted && order.Status != constants.OrderRefunded &&
			order.Status != constants.OrderCancelled {
			return nil, errors.New("invalid order status")
		}
	}
	if req.TipAmount != nil {
		order.TipAmount = *req.TipAmount
	}
	if req.ServiceCharge != nil {
		order.ServiceCharge = *req.ServiceCharge
	}
	if req.Customer != nil {
		order.Customer = *req.Customer
	}
	if req.CustomerEmail != nil {
		order.CustomerEmail = *req.CustomerEmail
	}
	if req.CustomerPhone != nil {
		order.CustomerPhone = *req.CustomerPhone
	}

	err = s.repo.UpdateOrder(order)
	if err != nil {
		return nil, err
	}

	dto := orderModels.NewOrderDtoFromEntity(*order)
	return &dto, nil
}

func (s *Service) AddItemToOrder(orderID uint, req orderModels.CreateOrderItemRequest, userID uint) (*orderModels.OrderItemDto, error) {
	order, err := s.repo.GetOrderByID(orderID)
	if err != nil {
		return nil, err
	}
	if order == nil {
		return nil, errors.New("order not found")
	}

	// Check RBAC permissions
	ok, err := rbac.HasAccess(constants.Orders, constants.Write, order.BusinessID, userID)
	if err != nil {
		return nil, errors.New("failed to verify permissions")
	}
	if !ok {
		return nil, errors.New("unauthorized to modify this order")
	}

	// Check if order is in final state
	if isOrderInFinalState(order.Status) {
		return nil, errors.New("cannot modify order items: order is in final state")
	}

	// Validate that the item exists and belongs to the same business as the order
	item, _, err := s.itemRepo.GetItemByID(req.ItemID)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.New("item not found")
		}
		return nil, err
	}
	if item == nil {
		return nil, errors.New("item not found")
	}
	if item.BusinessID != order.BusinessID {
		return nil, errors.New("item does not belong to the same business as the order")
	}

	orderItem := &entities.OrderItem{
		OrderID: orderID,
		ItemID:  req.ItemID,
		Count:   req.Count,
	}

	createdOrderItem, err := s.repo.CreateOrderItem(orderItem)
	if err != nil {
		return nil, err
	}

	dto := orderModels.NewOrderItemDtoFromEntity(*createdOrderItem)
	return &dto, nil
}

func (s *Service) GetOrderItems(orderID uint, userID uint) ([]orderModels.OrderItemDto, error) {
	order, err := s.repo.GetOrderByID(orderID)
	if err != nil {
		return nil, err
	}
	if order == nil {
		return nil, errors.New("order not found")
	}

	// Check RBAC permissions
	ok, err := rbac.HasAccess(constants.Orders, constants.Read, order.BusinessID, userID)
	if err != nil {
		return nil, errors.New("failed to verify permissions")
	}
	if !ok {
		return nil, errors.New("unauthorized to view this order")
	}

	orderItems, err := s.repo.GetOrderItems(orderID)
	if err != nil {
		return nil, err
	}

	var orderItemDtos []orderModels.OrderItemDto
	for _, orderItem := range orderItems {
		orderItemDtos = append(orderItemDtos, orderModels.NewOrderItemDtoFromEntity(orderItem))
	}

	return orderItemDtos, nil
}

func (s *Service) UpdateOrderItem(orderID, itemID uint, req orderModels.UpdateOrderItemRequest, userID uint) (*orderModels.OrderItemDto, error) {
	order, err := s.repo.GetOrderByID(orderID)
	if err != nil {
		return nil, err
	}
	if order == nil {
		return nil, errors.New("order not found")
	}

	// Check RBAC permissions
	ok, err := rbac.HasAccess(constants.Orders, constants.Write, order.BusinessID, userID)
	if err != nil {
		return nil, errors.New("failed to verify permissions")
	}
	if !ok {
		return nil, errors.New("unauthorized to modify this order")
	}

	// Check if order is in final state
	if isOrderInFinalState(order.Status) {
		return nil, errors.New("cannot modify order items: order is in final state")
	}

	orderItem, err := s.repo.GetOrderItemByID(orderID, itemID)
	if err != nil {
		return nil, err
	}
	if orderItem == nil {
		return nil, errors.New("order item not found")
	}

	if req.Count != nil {
		orderItem.Count = *req.Count
	}

	err = s.repo.UpdateOrderItem(orderItem)
	if err != nil {
		return nil, err
	}

	dto := orderModels.NewOrderItemDtoFromEntity(*orderItem)
	return &dto, nil
}

func (s *Service) RemoveItemFromOrder(orderID, itemID uint, userID uint) error {
	order, err := s.repo.GetOrderByID(orderID)
	if err != nil {
		return err
	}
	if order == nil {
		return errors.New("order not found")
	}

	// Check RBAC permissions
	ok, err := rbac.HasAccess(constants.Orders, constants.Write, order.BusinessID, userID)
	if err != nil {
		return errors.New("failed to verify permissions")
	}
	if !ok {
		return errors.New("unauthorized to modify this order")
	}

	// Check if order is in final state
	if isOrderInFinalState(order.Status) {
		return errors.New("cannot modify order items: order is in final state")
	}

	orderItem, err := s.repo.GetOrderItemByID(orderID, itemID)
	if err != nil {
		return err
	}
	if orderItem == nil {
		return errors.New("order item not found")
	}

	return s.repo.DeleteOrderItem(orderItem)
}

func (s *Service) ApplyPriceModifierToOrder(orderID uint, req orderModels.ApplyPriceModifierRequest, userID uint) error {
	order, err := s.repo.GetOrderByID(orderID)
	if err != nil {
		return err
	}
	if order == nil {
		return errors.New("order not found")
	}

	// Check RBAC permissions
	ok, err := rbac.HasAccess(constants.Orders, constants.Write, order.BusinessID, userID)
	if err != nil {
		return errors.New("failed to verify permissions")
	}
	if !ok {
		return errors.New("unauthorized to modify this order")
	}

	// Check if order is in final state
	if isOrderInFinalState(order.Status) {
		return errors.New("cannot modify order: order is in final state")
	}

	// Verify order item exists
	orderItem, err := s.repo.GetOrderItemByID(orderID, req.OrderItemID)
	if err != nil {
		return err
	}
	if orderItem == nil {
		return errors.New("order item not found")
	}

	link := &entities.PriceModifierOrderLink{
		PriceModifierID: req.PriceModifierID,
		OrderItemID:     req.OrderItemID,
	}

	_, err = s.repo.CreatePriceModifierOrderLink(link)
	return err
}

func (s *Service) AddOptionToOrderItem(orderID, itemID uint, req orderModels.CreateItemOptionLinkRequest, userID uint) (*orderModels.ItemOptionLinkDto, error) {
	order, err := s.repo.GetOrderByID(orderID)
	if err != nil {
		return nil, err
	}
	if order == nil {
		return nil, errors.New("order not found")
	}

	// Check RBAC permissions
	ok, err := rbac.HasAccess(constants.Orders, constants.Write, order.BusinessID, userID)
	if err != nil {
		return nil, errors.New("failed to verify permissions")
	}
	if !ok {
		return nil, errors.New("unauthorized to modify this order")
	}

	// Check if order is in final state
	if isOrderInFinalState(order.Status) {
		return nil, errors.New("cannot modify order items: order is in final state")
	}

	// Verify order item exists
	orderItem, err := s.repo.GetOrderItemByID(orderID, itemID)
	if err != nil {
		return nil, err
	}
	if orderItem == nil {
		return nil, errors.New("order item not found")
	}

	// Validate that the item option exists and belongs to the same item
	itemOption, _, err := s.itemRepo.GetItemOptionByID(req.ItemOptionID)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.New("item option not found")
		}
		return nil, err
	}
	if itemOption == nil {
		return nil, errors.New("item option not found")
	}
	if itemOption.ItemID != orderItem.ItemID {
		return nil, errors.New("item option does not belong to the same item as the order item")
	}

	link := &entities.ItemOptionLink{
		OrderItemID:  itemID,
		ItemOptionID: req.ItemOptionID,
		Count:        req.Count,
	}

	createdLink, err := s.repo.CreateItemOptionLink(link)
	if err != nil {
		return nil, err
	}

	dto := orderModels.NewItemOptionLinkDtoFromEntity(*createdLink)
	return &dto, nil
}

func (s *Service) GetItemOptionsInOrder(orderID, itemID uint, userID uint) ([]orderModels.ItemOptionLinkDto, error) {
	order, err := s.repo.GetOrderByID(orderID)
	if err != nil {
		return nil, err
	}
	if order == nil {
		return nil, errors.New("order not found")
	}

	// Check RBAC permissions
	ok, err := rbac.HasAccess(constants.Orders, constants.Read, order.BusinessID, userID)
	if err != nil {
		return nil, errors.New("failed to verify permissions")
	}
	if !ok {
		return nil, errors.New("unauthorized to view this order")
	}

	// Verify order item exists
	orderItem, err := s.repo.GetOrderItemByID(orderID, itemID)
	if err != nil {
		return nil, err
	}
	if orderItem == nil {
		return nil, errors.New("order item not found")
	}

	links, err := s.repo.GetItemOptionLinks(itemID)
	if err != nil {
		return nil, err
	}

	var linkDtos []orderModels.ItemOptionLinkDto
	for _, link := range links {
		linkDtos = append(linkDtos, orderModels.NewItemOptionLinkDtoFromEntity(link))
	}

	return linkDtos, nil
}

func (s *Service) RemoveOptionFromOrderItem(orderID, itemID, optionID uint, userID uint) error {
	order, err := s.repo.GetOrderByID(orderID)
	if err != nil {
		return err
	}
	if order == nil {
		return errors.New("order not found")
	}

	// Check RBAC permissions
	ok, err := rbac.HasAccess(constants.Orders, constants.Write, order.BusinessID, userID)
	if err != nil {
		return errors.New("failed to verify permissions")
	}
	if !ok {
		return errors.New("unauthorized to modify this order")
	}

	// Check if order is in final state
	if isOrderInFinalState(order.Status) {
		return errors.New("cannot modify order items: order is in final state")
	}

	// Verify order item exists
	orderItem, err := s.repo.GetOrderItemByID(orderID, itemID)
	if err != nil {
		return err
	}
	if orderItem == nil {
		return errors.New("order item not found")
	}

	link, err := s.repo.GetItemOptionLinkByID(itemID, optionID)
	if err != nil {
		return err
	}
	if link == nil {
		return errors.New("item option link not found")
	}

	return s.repo.DeleteItemOptionLink(link)
}

func (s *Service) LinkPaymentToOrder(orderID, paymentID uint, userID uint) error {
	// Verify order exists
	order, err := s.repo.GetOrderByID(orderID)
	if err != nil {
		return err
	}
	if order == nil {
		return errors.New("order not found")
	}

	// Check RBAC permissions
	ok, err := rbac.HasAccess(constants.Orders, constants.Write, order.BusinessID, userID)
	if err != nil {
		return errors.New("failed to verify permissions")
	}
	if !ok {
		return errors.New("unauthorized to modify this order")
	}

	// Verify payment exists
	payment, err := s.paymentRepo.GetPaymentByID(paymentID)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return errors.New("payment not found")
		}
		return err
	}
	if payment == nil {
		return errors.New("payment not found")
	}

	// Check if link already exists
	var existingLink entities.OrderPaymentLink
	if result := database.DB.Where("order_id = ? AND payment_id = ?", orderID, paymentID).First(&existingLink); result.Error == nil {
		return errors.New("payment is already linked to this order")
	} else if result.Error != nil && result.Error != gorm.ErrRecordNotFound {
		return result.Error
	}

	link := &entities.OrderPaymentLink{
		OrderID:   orderID,
		PaymentID: paymentID,
	}

	_, err = s.repo.CreateOrderPaymentLink(link)
	return err
}
