package constants

type ModifierType string

const (
	Discount  ModifierType = "Discount"
	Surcharge ModifierType = "Surcharge"
	Tax       ModifierType = "Tax"
	Tip       ModifierType = "Tip"
)
