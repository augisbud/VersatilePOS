package controller

import (
	"VersatilePOS/generic/models"
	"VersatilePOS/middleware"
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// @Summary Get all roles for a business
// @Description Get all roles for a business
// @Tags business
// @Produce  json
// @Param   id   path      int  true  "Business ID"
// @Success 200 {array} models.AccountRoleDto
// @Failure 401 {object} models.HTTPError
// @Failure 403 {object} models.HTTPError
// @Failure 404 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Security BearerAuth
// @Router /business/{id}/roles [get]
// @Id getBusinessRoles
func (ctrl *Controller) GetBusinessRoles(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: "Invalid business ID"})
		return
	}

	userID, err := middleware.GetUserIDFromContext(c)
	if err != nil {
		c.IndentedJSON(http.StatusUnauthorized, models.HTTPError{Error: err.Error()})
		return
	}

	roles, err := ctrl.service.GetBusinessRoles(uint(id), userID)
	if err != nil {
		switch err.Error() {
		case "business not found":
			c.IndentedJSON(http.StatusNotFound, models.HTTPError{Error: err.Error()})
		case "user not found":
			c.IndentedJSON(http.StatusNotFound, models.HTTPError{Error: err.Error()})
		case "user does not belong to this business":
			c.IndentedJSON(http.StatusForbidden, models.HTTPError{Error: err.Error()})
		default:
			log.Println("Failed to get business roles:", err)
			c.IndentedJSON(http.StatusInternalServerError, models.HTTPError{Error: "internal server error"})
		}
		return
	}

	c.IndentedJSON(http.StatusOK, roles)
}

func (ctrl *Controller) RegisterRoleRoutes(rg *gin.RouterGroup) {
	rg.GET("/:id/roles", ctrl.GetBusinessRoles)
}
