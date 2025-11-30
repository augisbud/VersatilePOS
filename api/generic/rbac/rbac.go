package rbac

import (
	"VersatilePOS/database"
	"VersatilePOS/database/entities"
	"VersatilePOS/generic/constants"
	"fmt"
	"slices"
)

func HasAccess(action constants.Action, level constants.AccessLevel, businessID uint, userID uint) (bool, error) {
	var roleLinks []entities.AccountRoleLink
	if err := database.DB.Preload("AccountRole").Where("account_id = ? AND status = ?", userID, constants.Active).Find(&roleLinks).Error; err != nil {
		return false, fmt.Errorf("failed to load role links: %v", err)
	}

	for _, rl := range roleLinks {
		if rl.AccountRole.BusinessID != businessID {
			continue
		}

		var funcLinks []entities.AccountRoleFunctionLink
		if err := database.DB.Preload("Function").Where("account_role_id = ?", rl.AccountRoleID).Find(&funcLinks).Error; err != nil {
			return false, fmt.Errorf("failed to load role-function links: %v", err)
		}

		for _, fl := range funcLinks {
			if fl.Function.Action != action {
				continue
			}
			if slices.Contains(fl.AccessLevels, string(level)) {
				return true, nil
			}
		}
	}

	return false, nil
}
