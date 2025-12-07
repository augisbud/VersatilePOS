package constants

type PaymentStatus string

const (
	Pending   PaymentStatus = "Pending"
	Completed PaymentStatus = "Completed"
	Failed    PaymentStatus = "Failed"
	Refunded  PaymentStatus = "Refunded"
)
