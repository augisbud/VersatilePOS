package controller

import (
	"VersatilePOS/account/models"
	genericModels "VersatilePOS/generic/models"
	"VersatilePOS/middleware"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// @Summary Create account role
// @Description Create a new account role for a business.
// @Tags account
// @Accept  json
// @Produce  json
// @Param   accountRole  body  models.CreateAccountRoleRequest  true  "Account role to create"
// @Success 201 {object} models.AccountRoleDto
// @Failure 400 {object} models.HTTPError
// @Failure 401 {object} models.HTTPError
// @Failure 403 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Security BearerAuth
// @Router /account/role [post]
// @Id createAccountRole
func (ctrl *Controller) CreateAccountRole(c *gin.Context) {
	var req models.CreateAccountRoleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.IndentedJSON(http.StatusBadRequest, genericModels.HTTPError{Error: err.Error()})
		return
	}

	claims, err := middleware.AuthorizeAndGetClaims(c)
	if err != nil {
		c.IndentedJSON(http.StatusUnauthorized, genericModels.HTTPError{Error: err.Error()})
		return
	}

	role, err := ctrl.service.CreateAccountRole(req, claims)
	if err != nil {
		switch err.Error() {
		case "unauthorized":
			c.IndentedJSON(http.StatusUnauthorized, genericModels.HTTPError{Error: err.Error()})
		case "business not found":
			c.IndentedJSON(http.StatusBadRequest, genericModels.HTTPError{Error: err.Error()})
		case "only the business owner can create roles":
			c.IndentedJSON(http.StatusForbidden, genericModels.HTTPError{Error: err.Error()})
		default:
			c.IndentedJSON(http.StatusInternalServerError, genericModels.HTTPError{Error: err.Error()})
		}
		return
	}

	c.IndentedJSON(http.StatusCreated, role)
}

// @Summary Get an account role by ID
// @Description Get an account role by ID. Only business owners can get roles.
// @Tags account
// @Produce  json
// @Param   id   path      int  true  "Role ID"
// @Success 200 {object} models.AccountRoleDto
// @Failure 400 {object} models.HTTPError
// @Failure 401 {object} models.HTTPError
// @Failure 403 {object} models.HTTPError
// @Failure 404 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Security BearerAuth
// @Router /account/role/{id} [get]
// @Id getAccountRoleById
func (ctrl *Controller) GetRole(c *gin.Context) {
	roleIDStr := c.Param("id")
	roleID, err := strconv.ParseUint(roleIDStr, 10, 32)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, genericModels.HTTPError{Error: "Invalid role ID"})
		return
	}

	claims, err := middleware.AuthorizeAndGetClaims(c)
	if err != nil {
		c.IndentedJSON(http.StatusUnauthorized, genericModels.HTTPError{Error: err.Error()})
		return
	}

	role, err := ctrl.service.GetRole(uint(roleID), claims)
	if err != nil {
		switch err.Error() {
		case "unauthorized":
			c.IndentedJSON(http.StatusForbidden, genericModels.HTTPError{Error: err.Error()})
		case "role not found":
			c.IndentedJSON(http.StatusNotFound, genericModels.HTTPError{Error: err.Error()})
		default:
			c.IndentedJSON(http.StatusInternalServerError, genericModels.HTTPError{Error: err.Error()})
		}
		return
	}

	c.IndentedJSON(http.StatusOK, role)
}

// @Summary Update an account role by ID
// @Description Update an account role by ID. Only business owners can update roles.
// @Tags account
// @Accept  json
// @Produce  json
// @Param   id   path      int  true  "Role ID"
// @Param   role  body  models.UpdateAccountRoleRequest  true  "Role to update"
// @Success 200 {object} models.AccountRoleDto
// @Failure 400 {object} models.HTTPError
// @Failure 401 {object} models.HTTPError
// @Failure 403 {object} models.HTTPError
// @Failure 404 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Security BearerAuth
// @Router /account/role/{id} [put]
// @Id updateAccountRoleById
func (ctrl *Controller) UpdateRole(c *gin.Context) {
	roleIDStr := c.Param("id")
	roleID, err := strconv.ParseUint(roleIDStr, 10, 32)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, genericModels.HTTPError{Error: "Invalid role ID"})
		return
	}

	var req models.UpdateAccountRoleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.IndentedJSON(http.StatusBadRequest, genericModels.HTTPError{Error: err.Error()})
		return
	}

	claims, err := middleware.AuthorizeAndGetClaims(c)
	if err != nil {
		c.IndentedJSON(http.StatusUnauthorized, genericModels.HTTPError{Error: err.Error()})
		return
	}

	role, err := ctrl.service.UpdateRole(uint(roleID), req, claims)
	if err != nil {
		switch err.Error() {
		case "unauthorized":
			c.IndentedJSON(http.StatusForbidden, genericModels.HTTPError{Error: err.Error()})
		case "role not found":
			c.IndentedJSON(http.StatusNotFound, genericModels.HTTPError{Error: err.Error()})
		default:
			c.IndentedJSON(http.StatusInternalServerError, genericModels.HTTPError{Error: err.Error()})
		}
		return
	}

	c.IndentedJSON(http.StatusOK, role)
}

// @Summary Delete an account role by ID
// @Description Delete an account role by ID. Only business owners can delete roles.
// @Tags account
// @Param   id   path      int  true  "Role ID"
// @Success 204
// @Failure 400 {object} models.HTTPError
// @Failure 401 {object} models.HTTPError
// @Failure 403 {object} models.HTTPError
// @Failure 404 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Security BearerAuth
// @Router /account/role/{id} [delete]
// @Id deleteAccountRoleById
func (ctrl *Controller) DeleteRole(c *gin.Context) {
	roleIDStr := c.Param("id")
	roleID, err := strconv.ParseUint(roleIDStr, 10, 32)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, genericModels.HTTPError{Error: "Invalid role ID"})
		return
	}

	claims, err := middleware.AuthorizeAndGetClaims(c)
	if err != nil {
		c.IndentedJSON(http.StatusUnauthorized, genericModels.HTTPError{Error: err.Error()})
		return
	}

	err = ctrl.service.DeleteRole(uint(roleID), claims)
	if err != nil {
		switch err.Error() {
		case "unauthorized":
			c.IndentedJSON(http.StatusForbidden, genericModels.HTTPError{Error: err.Error()})
		case "role not found":
			c.IndentedJSON(http.StatusNotFound, genericModels.HTTPError{Error: err.Error()})
		default:
			c.IndentedJSON(http.StatusInternalServerError, genericModels.HTTPError{Error: err.Error()})
		}
		return
	}

	c.Status(http.StatusNoContent)
}
