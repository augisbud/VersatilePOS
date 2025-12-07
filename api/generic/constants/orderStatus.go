package constants

type OrderStatus string

const (
	OrderPending   OrderStatus = "Pending"
	OrderConfirmed OrderStatus = "Confirmed"
	OrderCompleted OrderStatus = "Completed"
	OrderRefunded  OrderStatus = "Refunded"
	OrderCancelled OrderStatus = "Cancelled"
)
