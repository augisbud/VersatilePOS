package controller

import (
	orderModels "VersatilePOS/order/models"
	"VersatilePOS/order/service"
	"VersatilePOS/generic/models"
	"VersatilePOS/middleware"
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type Controller struct {
	service *service.Service
}

func NewController() *Controller {
	return &Controller{
		service: service.NewService(),
	}
}

// @Summary Create order
// @Description Create a new order. Authentication is optional - if authenticated, the user's ID will be used as ServicingAccountID if not provided.
// @Tags order
// @Accept  json
// @Produce  json
// @Param   order  body  models.CreateOrderRequest  true  "Order to create"
// @Success 201 {object} models.OrderDto
// @Failure 400 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Security BearerAuth
// @Router /order [post]
// @Id createOrder
func (ctrl *Controller) CreateOrder(c *gin.Context) {
	var req orderModels.CreateOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: err.Error()})
		return
	}

	// Authentication is optional - if user is authenticated, we can use their ID
	// Otherwise, ServicingAccountID can be set in the request or left null
	var userID uint
	if userIDFromContext, err := middleware.GetUserIDFromContext(c); err == nil {
		userID = userIDFromContext
		// If no ServicingAccountID provided in request, use authenticated user's ID
		if req.ServicingAccountID == nil {
			req.ServicingAccountID = &userID
		}
	}

	order, err := ctrl.service.CreateOrder(req, userID)
	if err != nil {
		log.Println("Failed to create order:", err)
		c.IndentedJSON(http.StatusInternalServerError, models.HTTPError{Error: "internal server error"})
		return
	}

	c.IndentedJSON(http.StatusCreated, order)
}

// @Summary Get orders
// @Description Get all orders, optionally filtered by business
// @Tags order
// @Produce  json
// @Param   businessId  query  int  false  "Business ID to filter by"
// @Success 200 {array} models.OrderDto
// @Failure 500 {object} models.HTTPError
// @Router /order [get]
// @Id getOrders
func (ctrl *Controller) GetOrders(c *gin.Context) {
	var businessID uint
	if businessIDStr := c.Query("businessId"); businessIDStr != "" {
		id, err := strconv.ParseUint(businessIDStr, 10, 32)
		if err != nil {
			c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: "invalid businessId"})
			return
		}
		businessID = uint(id)
	}

	orders, err := ctrl.service.GetOrders(businessID)
	if err != nil {
		log.Println("Failed to get orders:", err)
		c.IndentedJSON(http.StatusInternalServerError, models.HTTPError{Error: "internal server error"})
		return
	}

	c.IndentedJSON(http.StatusOK, orders)
}

// @Summary Get order by id
// @Description Get a specific order by its ID
// @Tags order
// @Produce  json
// @Param   id  path  int  true  "Order ID"
// @Success 200 {object} models.OrderDto
// @Failure 400 {object} models.HTTPError
// @Failure 404 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Router /order/{id} [get]
// @Id getOrderById
func (ctrl *Controller) GetOrderByID(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: "invalid order id"})
		return
	}

	order, err := ctrl.service.GetOrderByID(uint(id))
	if err != nil {
		if err.Error() == "order not found" {
			c.IndentedJSON(http.StatusNotFound, models.HTTPError{Error: err.Error()})
			return
		}
		log.Println("Failed to get order:", err)
		c.IndentedJSON(http.StatusInternalServerError, models.HTTPError{Error: "internal server error"})
		return
	}

	c.IndentedJSON(http.StatusOK, order)
}

// @Summary Update order
// @Description Update order details (status, etc.)
// @Tags order
// @Accept  json
// @Produce  json
// @Param   id  path  int  true  "Order ID"
// @Param   order  body  models.UpdateOrderRequest  true  "Order updates"
// @Success 200 {object} models.OrderDto
// @Failure 400 {object} models.HTTPError
// @Failure 404 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Router /order/{id} [put]
// @Id updateOrder
func (ctrl *Controller) UpdateOrder(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: "invalid order id"})
		return
	}

	var req orderModels.UpdateOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: err.Error()})
		return
	}

	order, err := ctrl.service.UpdateOrder(uint(id), req)
	if err != nil {
		if err.Error() == "order not found" {
			c.IndentedJSON(http.StatusNotFound, models.HTTPError{Error: err.Error()})
			return
		}
		if err.Error() == "invalid order status" {
			c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: err.Error()})
			return
		}
		log.Println("Failed to update order:", err)
		c.IndentedJSON(http.StatusInternalServerError, models.HTTPError{Error: "internal server error"})
		return
	}

	c.IndentedJSON(http.StatusOK, order)
}

// @Summary Add item to order
// @Description Add an item to an order
// @Tags order
// @Accept  json
// @Produce  json
// @Param   id  path  int  true  "Order ID"
// @Param   item  body  models.CreateOrderItemRequest  true  "Item to add"
// @Success 201 {object} models.OrderItemDto
// @Failure 400 {object} models.HTTPError
// @Failure 404 {object} models.HTTPError
// @Failure 409 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Router /order/{id}/item [post]
// @Id addItemToOrder
func (ctrl *Controller) AddItemToOrder(c *gin.Context) {
	orderID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: "invalid order id"})
		return
	}

	var req orderModels.CreateOrderItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: err.Error()})
		return
	}

	orderItem, err := ctrl.service.AddItemToOrder(uint(orderID), req)
	if err != nil {
		if err.Error() == "order not found" {
			c.IndentedJSON(http.StatusNotFound, models.HTTPError{Error: err.Error()})
			return
		}
		if err.Error() == "cannot modify order items: order is in final state" {
			c.IndentedJSON(http.StatusConflict, models.HTTPError{Error: err.Error()})
			return
		}
		log.Println("Failed to add item to order:", err)
		c.IndentedJSON(http.StatusInternalServerError, models.HTTPError{Error: "internal server error"})
		return
	}

	c.IndentedJSON(http.StatusCreated, orderItem)
}

// @Summary Get order items
// @Description Get all items in an order
// @Tags order
// @Produce  json
// @Param   id  path  int  true  "Order ID"
// @Success 200 {array} models.OrderItemDto
// @Failure 400 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Router /order/{id}/item [get]
// @Id getOrderItems
func (ctrl *Controller) GetOrderItems(c *gin.Context) {
	orderID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: "invalid order id"})
		return
	}

	orderItems, err := ctrl.service.GetOrderItems(uint(orderID))
	if err != nil {
		log.Println("Failed to get order items:", err)
		c.IndentedJSON(http.StatusInternalServerError, models.HTTPError{Error: "internal server error"})
		return
	}

	c.IndentedJSON(http.StatusOK, orderItems)
}

// @Summary Update order item
// @Description Update an order item
// @Tags order
// @Accept  json
// @Produce  json
// @Param   orderId  path  int  true  "Order ID"
// @Param   itemId  path  int  true  "Item ID"
// @Param   item  body  models.UpdateOrderItemRequest  true  "Item updates"
// @Success 200 {object} models.OrderItemDto
// @Failure 400 {object} models.HTTPError
// @Failure 404 {object} models.HTTPError
// @Failure 409 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Router /order/{orderId}/item/{itemId} [put]
// @Id updateOrderItem
func (ctrl *Controller) UpdateOrderItem(c *gin.Context) {
	orderID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: "invalid order id"})
		return
	}

	itemID, err := strconv.ParseUint(c.Param("itemId"), 10, 32)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: "invalid item id"})
		return
	}

	var req orderModels.UpdateOrderItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: err.Error()})
		return
	}

	orderItem, err := ctrl.service.UpdateOrderItem(uint(orderID), uint(itemID), req)
	if err != nil {
		if err.Error() == "order not found" || err.Error() == "order item not found" {
			c.IndentedJSON(http.StatusNotFound, models.HTTPError{Error: err.Error()})
			return
		}
		if err.Error() == "cannot modify order items: order is in final state" {
			c.IndentedJSON(http.StatusConflict, models.HTTPError{Error: err.Error()})
			return
		}
		log.Println("Failed to update order item:", err)
		c.IndentedJSON(http.StatusInternalServerError, models.HTTPError{Error: "internal server error"})
		return
	}

	c.IndentedJSON(http.StatusOK, orderItem)
}

// @Summary Remove item from order
// @Description Remove an item from an order
// @Tags order
// @Param   orderId  path  int  true  "Order ID"
// @Param   itemId  path  int  true  "Item ID"
// @Success 204
// @Failure 400 {object} models.HTTPError
// @Failure 404 {object} models.HTTPError
// @Failure 409 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Router /order/{orderId}/item/{itemId} [delete]
// @Id removeItemFromOrder
func (ctrl *Controller) RemoveItemFromOrder(c *gin.Context) {
	orderID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: "invalid order id"})
		return
	}

	itemID, err := strconv.ParseUint(c.Param("itemId"), 10, 32)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: "invalid item id"})
		return
	}

	err = ctrl.service.RemoveItemFromOrder(uint(orderID), uint(itemID))
	if err != nil {
		if err.Error() == "order not found" || err.Error() == "order item not found" {
			c.IndentedJSON(http.StatusNotFound, models.HTTPError{Error: err.Error()})
			return
		}
		if err.Error() == "cannot modify order items: order is in final state" {
			c.IndentedJSON(http.StatusConflict, models.HTTPError{Error: err.Error()})
			return
		}
		log.Println("Failed to remove item from order:", err)
		c.IndentedJSON(http.StatusInternalServerError, models.HTTPError{Error: "internal server error"})
		return
	}

	c.Status(http.StatusNoContent)
}

// @Summary Apply price modifier to order
// @Description Apply a price modifier to an order item
// @Tags order
// @Accept  json
// @Produce  json
// @Param   orderId  path  int  true  "Order ID"
// @Param   modifier  body  models.ApplyPriceModifierRequest  true  "Price modifier to apply"
// @Success 201
// @Failure 400 {object} models.HTTPError
// @Failure 404 {object} models.HTTPError
// @Failure 409 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Router /order/{orderId}/price-modifier [post]
// @Id applyPriceModifierToOrder
func (ctrl *Controller) ApplyPriceModifierToOrder(c *gin.Context) {
	orderID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: "invalid order id"})
		return
	}

	var req orderModels.ApplyPriceModifierRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: err.Error()})
		return
	}

	err = ctrl.service.ApplyPriceModifierToOrder(uint(orderID), req)
	if err != nil {
		if err.Error() == "order not found" || err.Error() == "order item not found" {
			c.IndentedJSON(http.StatusNotFound, models.HTTPError{Error: err.Error()})
			return
		}
		if err.Error() == "cannot modify order: order is in final state" {
			c.IndentedJSON(http.StatusConflict, models.HTTPError{Error: err.Error()})
			return
		}
		log.Println("Failed to apply price modifier:", err)
		c.IndentedJSON(http.StatusInternalServerError, models.HTTPError{Error: "internal server error"})
		return
	}

	c.Status(http.StatusCreated)
}

// @Summary Add option to order item
// @Description Add an option to an order item
// @Tags order
// @Accept  json
// @Produce  json
// @Param   orderId  path  int  true  "Order ID"
// @Param   itemId  path  int  true  "Item ID"
// @Param   option  body  models.CreateItemOptionLinkRequest  true  "Option to add"
// @Success 201 {object} models.ItemOptionLinkDto
// @Failure 400 {object} models.HTTPError
// @Failure 404 {object} models.HTTPError
// @Failure 409 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Router /order/{orderId}/item/{itemId}/option [post]
// @Id addOptionToOrderItem
func (ctrl *Controller) AddOptionToOrderItem(c *gin.Context) {
	orderID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: "invalid order id"})
		return
	}

	itemID, err := strconv.ParseUint(c.Param("itemId"), 10, 32)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: "invalid item id"})
		return
	}

	var req orderModels.CreateItemOptionLinkRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: err.Error()})
		return
	}

	link, err := ctrl.service.AddOptionToOrderItem(uint(orderID), uint(itemID), req)
	if err != nil {
		if err.Error() == "order not found" || err.Error() == "order item not found" {
			c.IndentedJSON(http.StatusNotFound, models.HTTPError{Error: err.Error()})
			return
		}
		if err.Error() == "cannot modify order items: order is in final state" {
			c.IndentedJSON(http.StatusConflict, models.HTTPError{Error: err.Error()})
			return
		}
		log.Println("Failed to add option to order item:", err)
		c.IndentedJSON(http.StatusInternalServerError, models.HTTPError{Error: "internal server error"})
		return
	}

	c.IndentedJSON(http.StatusCreated, link)
}

// @Summary Get item options in order
// @Description Get all options for an order item
// @Tags order
// @Produce  json
// @Param   orderId  path  int  true  "Order ID"
// @Param   itemId  path  int  true  "Item ID"
// @Success 200 {array} models.ItemOptionLinkDto
// @Failure 400 {object} models.HTTPError
// @Failure 404 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Router /order/{orderId}/item/{itemId}/option [get]
// @Id getItemOptionsInOrder
func (ctrl *Controller) GetItemOptionsInOrder(c *gin.Context) {
	orderID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: "invalid order id"})
		return
	}

	itemID, err := strconv.ParseUint(c.Param("itemId"), 10, 32)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: "invalid item id"})
		return
	}

	links, err := ctrl.service.GetItemOptionsInOrder(uint(orderID), uint(itemID))
	if err != nil {
		if err.Error() == "order item not found" {
			c.IndentedJSON(http.StatusNotFound, models.HTTPError{Error: err.Error()})
			return
		}
		log.Println("Failed to get item options:", err)
		c.IndentedJSON(http.StatusInternalServerError, models.HTTPError{Error: "internal server error"})
		return
	}

	c.IndentedJSON(http.StatusOK, links)
}

// @Summary Remove option from order item
// @Description Remove an option from an order item
// @Tags order
// @Param   orderId  path  int  true  "Order ID"
// @Param   itemId  path  int  true  "Item ID"
// @Param   optionId  path  int  true  "Option ID"
// @Success 204
// @Failure 400 {object} models.HTTPError
// @Failure 404 {object} models.HTTPError
// @Failure 409 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Router /order/{orderId}/item/{itemId}/option/{optionId} [delete]
// @Id removeOptionFromOrderItem
func (ctrl *Controller) RemoveOptionFromOrderItem(c *gin.Context) {
	orderID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: "invalid order id"})
		return
	}

	itemID, err := strconv.ParseUint(c.Param("itemId"), 10, 32)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: "invalid item id"})
		return
	}

	optionID, err := strconv.ParseUint(c.Param("optionId"), 10, 32)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: "invalid option id"})
		return
	}

	err = ctrl.service.RemoveOptionFromOrderItem(uint(orderID), uint(itemID), uint(optionID))
	if err != nil {
		if err.Error() == "order not found" || err.Error() == "order item not found" || err.Error() == "item option link not found" {
			c.IndentedJSON(http.StatusNotFound, models.HTTPError{Error: err.Error()})
			return
		}
		if err.Error() == "cannot modify order items: order is in final state" {
			c.IndentedJSON(http.StatusConflict, models.HTTPError{Error: err.Error()})
			return
		}
		log.Println("Failed to remove option from order item:", err)
		c.IndentedJSON(http.StatusInternalServerError, models.HTTPError{Error: "internal server error"})
		return
	}

	c.Status(http.StatusNoContent)
}

// @Summary Link payment to order
// @Description Link a payment to an order
// @Tags order
// @Param   orderId  path  int  true  "Order ID"
// @Param   paymentId  path  int  true  "Payment ID"
// @Success 201
// @Failure 400 {object} models.HTTPError
// @Failure 404 {object} models.HTTPError
// @Failure 409 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Router /order/{orderId}/payment/{paymentId} [post]
// @Id linkPaymentToOrder
func (ctrl *Controller) LinkPaymentToOrder(c *gin.Context) {
	orderID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: "invalid order id"})
		return
	}

	paymentID, err := strconv.ParseUint(c.Param("paymentId"), 10, 32)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: "invalid payment id"})
		return
	}

	err = ctrl.service.LinkPaymentToOrder(uint(orderID), uint(paymentID))
	if err != nil {
		if err.Error() == "order not found" || err.Error() == "payment not found" {
			c.IndentedJSON(http.StatusNotFound, models.HTTPError{Error: err.Error()})
			return
		}
		if err.Error() == "payment is already linked to this order" {
			c.IndentedJSON(http.StatusConflict, models.HTTPError{Error: err.Error()})
			return
		}
		log.Println("Failed to link payment to order:", err)
		c.IndentedJSON(http.StatusInternalServerError, models.HTTPError{Error: "internal server error"})
		return
	}

	c.Status(http.StatusCreated)
}

func (ctrl *Controller) RegisterRoutes(r *gin.Engine) {
	orderGroup := r.Group("/order")
	{
		orderGroup.POST("", ctrl.CreateOrder)
		orderGroup.GET("", ctrl.GetOrders)
		orderGroup.GET("/:id", ctrl.GetOrderByID)
		orderGroup.PUT("/:id", ctrl.UpdateOrder)
		orderGroup.POST("/:id/item", ctrl.AddItemToOrder)
		orderGroup.GET("/:id/item", ctrl.GetOrderItems)
		orderGroup.PUT("/:id/item/:itemId", ctrl.UpdateOrderItem)
		orderGroup.DELETE("/:id/item/:itemId", ctrl.RemoveItemFromOrder)
		orderGroup.POST("/:id/price-modifier", ctrl.ApplyPriceModifierToOrder)
		orderGroup.POST("/:id/payment/:paymentId", ctrl.LinkPaymentToOrder)
		orderGroup.POST("/:id/item/:itemId/option", ctrl.AddOptionToOrderItem)
		orderGroup.GET("/:id/item/:itemId/option", ctrl.GetItemOptionsInOrder)
		orderGroup.DELETE("/:id/item/:itemId/option/:optionId", ctrl.RemoveOptionFromOrderItem)
	}
}
