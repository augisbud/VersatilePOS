package models

import "VersatilePOS/database/entities"

type ItemOptionLinkDto struct {
	ID           uint   `json:"id"`
	OrderItemID  uint   `json:"orderItemId"`
	ItemOptionID uint   `json:"itemOptionId"`
	Count        uint32 `json:"count"`
	// Snapshot fields for display/calculation
	OptionName             string  `json:"optionName,omitempty"`
	PriceModifierName      string  `json:"priceModifierName,omitempty"`
	PriceModifierValue     float64 `json:"priceModifierValue,omitempty"`
	PriceModifierType      string  `json:"priceModifierType,omitempty"`
	PriceModifierIsPercent bool    `json:"priceModifierIsPercent,omitempty"`
}

// NewItemOptionLinkDtoFromEntity constructs an ItemOptionLinkDto from the DB entity.
func NewItemOptionLinkDtoFromEntity(iol entities.ItemOptionLink) ItemOptionLinkDto {
	dto := ItemOptionLinkDto{
		ID:           iol.ID,
		OrderItemID:  iol.OrderItemID,
		ItemOptionID: iol.ItemOptionID,
		Count:        iol.Count,
	}

	// Populate snapshot fields if relations are loaded
	if iol.ItemOption.ID != 0 {
		dto.OptionName = iol.ItemOption.Name
		if iol.ItemOption.PriceModifier.ID != 0 {
			dto.PriceModifierName = iol.ItemOption.PriceModifier.Name
			dto.PriceModifierValue = iol.ItemOption.PriceModifier.Value
			dto.PriceModifierType = string(iol.ItemOption.PriceModifier.ModifierType)
			dto.PriceModifierIsPercent = iol.ItemOption.PriceModifier.IsPercentage
		}
	}

	return dto
}
