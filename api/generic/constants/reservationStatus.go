package constants

type ReservationStatus string

const (
	ReservationConfirmed  ReservationStatus = "Confirmed"
	ReservationCompleted  ReservationStatus = "Completed"
	ReservationCancelled  ReservationStatus = "Cancelled"
	ReservationNoShow     ReservationStatus = "NoShow"
)

