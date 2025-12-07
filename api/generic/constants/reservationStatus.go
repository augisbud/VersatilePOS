package constants

type ReservationStatus string

const (
	ReservationPending    ReservationStatus = "Pending"
	ReservationConfirmed  ReservationStatus = "Confirmed"
	ReservationCompleted  ReservationStatus = "Completed"
	ReservationCancelled  ReservationStatus = "Cancelled"
	ReservationNoShow     ReservationStatus = "NoShow"
)

