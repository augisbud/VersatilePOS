package constants

type PaymentType string

const (
	Cash          PaymentType = "Cash"
	CreditCard    PaymentType = "CreditCard"
	DebitCard     PaymentType = "DebitCard"
	DigitalWallet PaymentType = "DigitalWallet"
	GiftCard      PaymentType = "GiftCard"
	Check         PaymentType = "Check"
	Other         PaymentType = "Other"
)
