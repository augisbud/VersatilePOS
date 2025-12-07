package service

import (
	orderModels "VersatilePOS/order/models"
	"VersatilePOS/order/repository"
	"VersatilePOS/database/entities"
	"VersatilePOS/generic/constants"
	"errors"
	"time"
)

type Service struct {
	repo repository.Repository
}

func NewService() *Service {
	return &Service{
		repo: repository.Repository{},
	}
}

// isOrderInFinalState checks if an order is in a final state (cannot be modified)
func isOrderInFinalState(status constants.OrderStatus) bool {
	return status == constants.OrderConfirmed || status == constants.OrderCompleted || status == constants.OrderRefunded
}

func (s *Service) CreateOrder(req orderModels.CreateOrderRequest, userID uint) (*orderModels.OrderDto, error) {
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

func (s *Service) GetOrders(businessID uint) ([]orderModels.OrderDto, error) {
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

func (s *Service) GetOrderByID(id uint) (*orderModels.OrderDto, error) {
	order, err := s.repo.GetOrderByID(id)
	if err != nil {
		return nil, err
	}
	if order == nil {
		return nil, errors.New("order not found")
	}

	dto := orderModels.NewOrderDtoFromEntity(*order)
	return &dto, nil
}

func (s *Service) UpdateOrder(id uint, req orderModels.UpdateOrderRequest) (*orderModels.OrderDto, error) {
	order, err := s.repo.GetOrderByID(id)
	if err != nil {
		return nil, err
	}
	if order == nil {
		return nil, errors.New("order not found")
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

func (s *Service) AddItemToOrder(orderID uint, req orderModels.CreateOrderItemRequest) (*orderModels.OrderItemDto, error) {
	order, err := s.repo.GetOrderByID(orderID)
	if err != nil {
		return nil, err
	}
	if order == nil {
		return nil, errors.New("order not found")
	}

	// Check if order is in final state
	if isOrderInFinalState(order.Status) {
		return nil, errors.New("cannot modify order items: order is in final state")
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

func (s *Service) GetOrderItems(orderID uint) ([]orderModels.OrderItemDto, error) {
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

func (s *Service) UpdateOrderItem(orderID, itemID uint, req orderModels.UpdateOrderItemRequest) (*orderModels.OrderItemDto, error) {
	order, err := s.repo.GetOrderByID(orderID)
	if err != nil {
		return nil, err
	}
	if order == nil {
		return nil, errors.New("order not found")
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

func (s *Service) RemoveItemFromOrder(orderID, itemID uint) error {
	order, err := s.repo.GetOrderByID(orderID)
	if err != nil {
		return err
	}
	if order == nil {
		return errors.New("order not found")
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

func (s *Service) ApplyPriceModifierToOrder(orderID uint, req orderModels.ApplyPriceModifierRequest) error {
	order, err := s.repo.GetOrderByID(orderID)
	if err != nil {
		return err
	}
	if order == nil {
		return errors.New("order not found")
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

func (s *Service) AddOptionToOrderItem(orderID, itemID uint, req orderModels.CreateItemOptionLinkRequest) (*orderModels.ItemOptionLinkDto, error) {
	order, err := s.repo.GetOrderByID(orderID)
	if err != nil {
		return nil, err
	}
	if order == nil {
		return nil, errors.New("order not found")
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

func (s *Service) GetItemOptionsInOrder(orderID, itemID uint) ([]orderModels.ItemOptionLinkDto, error) {
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

func (s *Service) RemoveOptionFromOrderItem(orderID, itemID, optionID uint) error {
	order, err := s.repo.GetOrderByID(orderID)
	if err != nil {
		return err
	}
	if order == nil {
		return errors.New("order not found")
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
