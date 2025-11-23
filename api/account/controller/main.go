package controller

import (
	accountModels "VersatilePOS/account/models"
	"VersatilePOS/account/service"
	"VersatilePOS/generic/models"
	"VersatilePOS/middleware"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type Controller struct {
	service *service.Service
}

func NewController() *Controller {
	return &Controller{
		service: service.NewService(),
	}
}

// @Summary Create account
// @Description Create a new account. If creating an account for a business, authentication is required and the user must be the business owner.
// @Tags account
// @Accept  json
// @Produce  json
// @Param   account  body  models.CreateAccountRequest  true  "Account to create"
// @Success 201 {object} models.AccountDto
// @Failure 400 {object} models.HTTPError
// @Failure 401 {object} models.HTTPError
// @Failure 403 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Security BearerAuth
// @Router /account [post]
// @Id createAccount
func (ctrl *Controller) CreateAccount(c *gin.Context) {
	var req accountModels.CreateAccountRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: err.Error()})
		return
	}

	var claims map[string]interface{}
	var err error
	if req.BusinessID != 0 {
		claims, err = middleware.AuthorizeAndGetClaims(c)
		if err != nil {
			c.IndentedJSON(http.StatusUnauthorized, models.HTTPError{Error: err.Error()})
			return
		}
	}

	account, err := ctrl.service.CreateAccount(req, claims)
	if err != nil {
		switch err.Error() {
		case "unauthorized":
			c.IndentedJSON(http.StatusUnauthorized, models.HTTPError{Error: err.Error()})
		case "business not found":
			c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: err.Error()})
		case "only the business owner can add employees":
			c.IndentedJSON(http.StatusForbidden, models.HTTPError{Error: err.Error()})
		default:
			c.IndentedJSON(http.StatusInternalServerError, models.HTTPError{Error: err.Error()})
		}
		return
	}

	c.IndentedJSON(http.StatusCreated, account)
}

// @Summary Log in to account
// @Description Log in to account
// @Tags account
// @Accept  json
// @Produce  json
// @Param   credentials  body  models.LoginRequest  true  "Login credentials"
// @Success 200 {object} map[string]string
// @Failure 400 {object} models.HTTPError
// @Failure 401 {object} models.HTTPError
// @Router /account/login [post]
// @Id loginAccount
func (ctrl *Controller) Login(c *gin.Context) {
	var req accountModels.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: err.Error()})
		return
	}

	token, err := ctrl.service.Login(req)
	if err != nil {
		if err.Error() == "invalid credentials" {
			c.IndentedJSON(http.StatusUnauthorized, models.HTTPError{Error: err.Error()})
		} else {
			c.IndentedJSON(http.StatusInternalServerError, models.HTTPError{Error: err.Error()})
		}
		return
	}

	c.IndentedJSON(http.StatusOK, gin.H{"token": token})
}

// @Summary Get account information
// @Description Get account information for the currently authenticated user.
// @Tags account
// @Produce  json
// @Success 200 {object} models.AccountDto
// @Failure 401 {object} models.HTTPError
// @Failure 404 {object} models.HTTPError
// @Security BearerAuth
// @Router /account/me [get]
// @Id getMyAccount
func (ctrl *Controller) GetMyAccount(c *gin.Context) {
	userID, err := middleware.GetUserIDFromContext(c)
	if err != nil {
		c.IndentedJSON(http.StatusUnauthorized, models.HTTPError{Error: err.Error()})
		return
	}

	account, err := ctrl.service.GetMyAccount(userID)
	if err != nil {
		if err.Error() == "account not found" {
			c.IndentedJSON(http.StatusNotFound, models.HTTPError{Error: err.Error()})
		} else {
			c.IndentedJSON(http.StatusInternalServerError, models.HTTPError{Error: err.Error()})
		}
		return
	}

	c.IndentedJSON(http.StatusOK, account)
}

// @Summary Get accounts
// @Description Get accounts based on user's role. A business owner or employee sees all accounts for their business. An individual user sees only their own account.
// @Tags account
// @Produce  json
// @Param   businessId   path      int  true  "Business ID"
// @Success 200 {array} models.AccountDto
// @Failure 401 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Security BearerAuth
// @Router /account/{businessId} [get]
// @Id getAccounts
func (ctrl *Controller) GetAccounts(c *gin.Context) {
	businessIdStr := c.Param("businessId")
	businessId, err := strconv.ParseUint(businessIdStr, 10, 32)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: "Invalid business ID"})
		return
	}

	userID, err := middleware.GetUserIDFromContext(c)
	if err != nil {
		c.IndentedJSON(http.StatusUnauthorized, models.HTTPError{Error: err.Error()})
		return
	}

	accounts, err := ctrl.service.GetAccounts(uint(businessId), userID)
	if err != nil {
		c.IndentedJSON(http.StatusInternalServerError, models.HTTPError{Error: err.Error()})
		return
	}

	c.IndentedJSON(http.StatusOK, accounts)
}

// @Summary Delete an account
// @Description Delete an account. Only business owners can delete employee accounts.
// @Tags account
// @Param   id   path      int  true  "Account ID"
// @Success 204
// @Failure 401 {object} models.HTTPError
// @Failure 403 {object} models.HTTPError
// @Failure 404 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Security BearerAuth
// @Router /account/{id} [delete]
// @Id deleteAccountById
func (ctrl *Controller) DeleteAccount(c *gin.Context) {
	id := c.Param("id")
	requestingUserID, err := middleware.GetUserIDFromContext(c)
	if err != nil {
		c.IndentedJSON(http.StatusUnauthorized, models.HTTPError{Error: err.Error()})
		return
	}

	err = ctrl.service.DeleteAccount(id, requestingUserID)
	if err != nil {
		switch err.Error() {
		case "you cannot delete your own account", "only business owners can delete accounts", "you can only delete employees of your own business":
			c.IndentedJSON(http.StatusForbidden, models.HTTPError{Error: err.Error()})
		case "account not found":
			c.IndentedJSON(http.StatusNotFound, models.HTTPError{Error: err.Error()})
		default:
			c.IndentedJSON(http.StatusInternalServerError, models.HTTPError{Error: err.Error()})
		}
		return
	}

	c.Status(http.StatusNoContent)
}

// @Summary Assign a role to an account
// @Description Assign a role to an account. Only business owners can assign roles.
// @Tags account
// @Accept  json
// @Produce  json
// @Param   id   path      int  true  "Account ID"
// @Param   role  body  models.AssignRoleRequest  true  "Role to assign"
// @Success 201 {object} models.AccountRoleLinkDto
// @Failure 400 {object} models.HTTPError
// @Failure 401 {object} models.HTTPError
// @Failure 403 {object} models.HTTPError
// @Failure 404 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Security BearerAuth
// @Router /account/{id}/role [post]
// @Id assignRoleToAccount
func (ctrl *Controller) AssignRoleToAccount(c *gin.Context) {
	accountIDStr := c.Param("id")
	accountID, err := strconv.ParseUint(accountIDStr, 10, 32)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: "Invalid account ID"})
		return
	}

	var req accountModels.AssignRoleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: err.Error()})
		return
	}

	claims, err := middleware.AuthorizeAndGetClaims(c)
	if err != nil {
		c.IndentedJSON(http.StatusUnauthorized, models.HTTPError{Error: err.Error()})
		return
	}

	roleLink, err := ctrl.service.AssignRoleToAccount(uint(accountID), req, claims)
	if err != nil {
		switch err.Error() {
		case "account not found", "role not found":
			c.IndentedJSON(http.StatusNotFound, models.HTTPError{Error: err.Error()})
		case "unauthorized to assign this role", "account is not a member of the business":
			c.IndentedJSON(http.StatusForbidden, models.HTTPError{Error: err.Error()})
		default:
			c.IndentedJSON(http.StatusInternalServerError, models.HTTPError{Error: err.Error()})
		}
		return
	}

	c.IndentedJSON(http.StatusCreated, roleLink)
}

// @Summary Update the status of a role assigned to an account
// @Description Update the status of a role assigned to an account. Only business owners can perform this action.
// @Tags account
// @Accept  json
// @Produce  json
// @Param   id       path      int  true  "Account ID"
// @Param   roleId   path      int  true  "Role ID"
// @Param   status   body      models.UpdateAccountRoleLinkRequest  true  "New status"
// @Success 200 {object} models.AccountRoleLinkDto
// @Failure 400 {object} models.HTTPError
// @Failure 401 {object} models.HTTPError
// @Failure 403 {object} models.HTTPError
// @Failure 404 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Security BearerAuth
// @Router /account/{id}/role/{roleId} [patch]
// @Id updateAccountRoleStatus
func (ctrl *Controller) UpdateAccountRoleStatus(c *gin.Context) {
	accountIDStr := c.Param("id")
	accountID, err := strconv.ParseUint(accountIDStr, 10, 32)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: "Invalid account ID"})
		return
	}

	roleIDStr := c.Param("roleId")
	roleID, err := strconv.ParseUint(roleIDStr, 10, 32)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: "Invalid role ID"})
		return
	}

	var req accountModels.UpdateAccountRoleLinkRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: err.Error()})
		return
	}

	claims, err := middleware.AuthorizeAndGetClaims(c)
	if err != nil {
		c.IndentedJSON(http.StatusUnauthorized, models.HTTPError{Error: err.Error()})
		return
	}

	updatedLink, err := ctrl.service.UpdateAccountRoleLinkStatus(uint(accountID), uint(roleID), req, claims)
	if err != nil {
		switch err.Error() {
		case "role assignment not found":
			c.IndentedJSON(http.StatusNotFound, models.HTTPError{Error: err.Error()})
		case "unauthorized to update this role assignment":
			c.IndentedJSON(http.StatusForbidden, models.HTTPError{Error: err.Error()})
		default:
			c.IndentedJSON(http.StatusInternalServerError, models.HTTPError{Error: err.Error()})
		}
		return
	}

	c.IndentedJSON(http.StatusOK, updatedLink)
}

func (ctrl *Controller) RegisterRoutes(r *gin.Engine) {
	// Public routes
	r.POST("/account/login", ctrl.Login)
	r.POST("/account", ctrl.CreateAccount)

	// Authenticated routes
	accountGroup := r.Group("/account")
	accountGroup.Use(middleware.AuthMiddleware())
	{
		accountGroup.GET("/:businessId", ctrl.GetAccounts)
		accountGroup.GET("/me", ctrl.GetMyAccount)
		accountGroup.DELETE("/:id", ctrl.DeleteAccount)
		accountGroup.GET("/role/:id", ctrl.GetRole)
		accountGroup.PUT("/role/:id", ctrl.UpdateRole)
		accountGroup.DELETE("/role/:id", ctrl.DeleteRole)
		accountGroup.POST("/:id/role", ctrl.AssignRoleToAccount)
		accountGroup.PATCH("/:id/role/:roleId", ctrl.UpdateAccountRoleStatus)
		accountGroup.POST("/role", ctrl.CreateAccountRole)
	}
}
