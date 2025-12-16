package models

type TagEntitiesResponse struct {
	Items       []interface{} `json:"items"`
	ItemOptions []interface{} `json:"itemOptions"`
	Services    []interface{} `json:"services"`
}
