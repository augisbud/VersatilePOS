package controller

import (
	"VersatilePOS/account/models"
	genericModels "VersatilePOS/generic/models"
	"VersatilePOS/middleware"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// @Summary Get all system functions
// @Description Get all available system functions. Only business owners can access this.
// @Tags account
// @Produce  json
// @Success 200 {array} models.FunctionDto
// @Failure 401 {object} models.HTTPError
// @Failure 403 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Security BearerAuth
// @Router /account/functions [get]
// @Id getAllFunctions
func (ctrl *Controller) GetAllFunctions(c *gin.Context) {
	claims, err := middleware.AuthorizeAndGetClaims(c)
	if err != nil {
		c.IndentedJSON(http.StatusUnauthorized, genericModels.HTTPError{Error: err.Error()})
		return
	}

	functions, err := ctrl.service.GetAllFunctions(claims)
	if err != nil {
		switch err.Error() {
		case "unauthorized", "only business owners can view functions":
			c.IndentedJSON(http.StatusForbidden, genericModels.HTTPError{Error: err.Error()})
		default:
			c.IndentedJSON(http.StatusInternalServerError, genericModels.HTTPError{Error: err.Error()})
		}
		return
	}

	c.IndentedJSON(http.StatusOK, functions)
}

// @Summary Assign a function to an account role
// @Description Assign a function to an account role. Only business owners can perform this action.
// @Tags account
// @Accept  json
// @Param   id   path      int  true  "Role ID"
// @Param   function  body  models.AssignFunctionRequest  true  "Function to assign"
// @Success 204
// @Failure 400 {object} models.HTTPError
// @Failure 401 {object} models.HTTPError
// @Failure 403 {object} models.HTTPError
// @Failure 404 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Security BearerAuth
// @Router /account/role/{id}/function [post]
// @Id assignFunctionToRole
func (ctrl *Controller) AssignFunctionToRole(c *gin.Context) {
	roleIDStr := c.Param("id")
	roleID, err := strconv.ParseUint(roleIDStr, 10, 32)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, genericModels.HTTPError{Error: "Invalid role ID"})
		return
	}

	var req models.AssignFunctionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.IndentedJSON(http.StatusBadRequest, genericModels.HTTPError{Error: err.Error()})
		return
	}

	claims, err := middleware.AuthorizeAndGetClaims(c)
	if err != nil {
		c.IndentedJSON(http.StatusUnauthorized, genericModels.HTTPError{Error: err.Error()})
		return
	}

	err = ctrl.service.AssignFunctionToRole(uint(roleID), req, claims)
	if err != nil {
		switch err.Error() {
		case "unauthorized":
			c.IndentedJSON(http.StatusForbidden, genericModels.HTTPError{Error: err.Error()})
		case "role not found", "function not found":
			c.IndentedJSON(http.StatusNotFound, genericModels.HTTPError{Error: err.Error()})
		default:
			c.IndentedJSON(http.StatusInternalServerError, genericModels.HTTPError{Error: err.Error()})
		}
		return
	}

	c.Status(http.StatusNoContent)
}

// @Summary Get all functions for an account role
// @Description Get all functions assigned to a specific account role.
// @Tags account
// @Produce  json
// @Param   id   path      int  true  "Role ID"
// @Success 200 {array} models.AccountRoleFunctionLinkDto
// @Failure 400 {object} models.HTTPError
// @Failure 401 {object} models.HTTPError
// @Failure 403 {object} models.HTTPError
// @Failure 404 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Security BearerAuth
// @Router /account/role/{id}/function [get]
// @Id getFunctionsForRole
func (ctrl *Controller) GetFunctionsForRole(c *gin.Context) {
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

	functions, err := ctrl.service.GetFunctionsByRoleID(uint(roleID), claims)
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

	c.IndentedJSON(http.StatusOK, functions)
}
