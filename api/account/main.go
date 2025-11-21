package account

import (
	accountModels "VersatilePOS/account/models"
	"VersatilePOS/database"
	"VersatilePOS/database/entities"
	"VersatilePOS/generic/models"
	"VersatilePOS/middleware"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	jwt "github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// @Summary Create account
// @Description Create a new account. If creating an account for a business, authentication is required and the user must be the business owner.
// @Tags account
// @Accept  json
// @Produce  json
// @Param   account  body  models.CreateAccountRequest  true  "Account to create"
// @Success 201 {object} entities.Account
// @Failure 400 {object} models.HTTPError
// @Failure 401 {object} models.HTTPError
// @Failure 403 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Security BearerAuth
// @Router /account [post]
// @Id createAccount
func createAccount(c *gin.Context) {
	var req accountModels.CreateAccountRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: err.Error()})
		return
	}

	if req.BusinessID != 0 {
		claims, err := middleware.AuthorizeAndGetClaims(c)
		if err != nil {
			c.IndentedJSON(http.StatusUnauthorized, models.HTTPError{Error: err.Error()})
			return
		}

		userID := uint(claims["id"].(float64))

		var business entities.Business
		if err := database.DB.First(&business, req.BusinessID).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: "business not found"})
			} else {
				c.IndentedJSON(http.StatusInternalServerError, models.HTTPError{Error: "failed to verify business ownership"})
			}
			return
		}

		if business.OwnerID != userID {
			c.IndentedJSON(http.StatusForbidden, models.HTTPError{Error: "only the business owner can add employees"})
			return
		}
	}

	passwordHash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.IndentedJSON(http.StatusInternalServerError, models.HTTPError{Error: "failed to hash password"})
		return
	}

	account := entities.Account{
		Name:         req.Name,
		Username:     req.Username,
		PasswordHash: string(passwordHash),
	}

	if req.BusinessID != 0 {
		var business entities.Business
		if err := database.DB.First(&business, req.BusinessID).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: "business not found"})
			} else {
				c.IndentedJSON(http.StatusInternalServerError, models.HTTPError{Error: "failed to get business"})
			}
			return
		}
		account.MemberOf = append(account.MemberOf, business)
	}

	if result := database.DB.Create(&account); result.Error != nil {
		log.Println("Failed to create account:", result.Error)
		c.IndentedJSON(http.StatusInternalServerError, models.HTTPError{Error: "internal server error"})
		return
	}

	c.IndentedJSON(http.StatusCreated, account)
}

// @Summary Get accounts
// @Description Get accounts based on user's role. A business owner or employee sees all accounts for their business. An individual user sees only their own account.
// @Tags account
// @Produce  json
// @Success 200 {array} entities.Account
// @Failure 401 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Security BearerAuth
// @Router /account [get]
// @Id getAccounts
func getAccounts(c *gin.Context) {
	userID, err := middleware.GetUserIDFromContext(c)
	if err != nil {
		c.IndentedJSON(http.StatusUnauthorized, models.HTTPError{Error: err.Error()})
		return
	}

	var user entities.Account
	if err := database.DB.Preload("OwnedBusinesses").Preload("MemberOf").First(&user, userID).Error; err != nil {
		c.IndentedJSON(http.StatusInternalServerError, models.HTTPError{Error: "failed to get user"})
		return
	}

	var accounts []entities.Account
	if len(user.OwnedBusinesses) > 0 {
		// User is an owner, get all accounts for their business
		business := user.OwnedBusinesses[0]
		var employees []entities.Account
		database.DB.Model(&business).Association("Employees").Find(&employees)
		accounts = append(accounts, user) // Add owner to the list
		accounts = append(accounts, employees...)
	} else if len(user.MemberOf) > 0 {
		// User is an employee, get all accounts for their business
		business := user.MemberOf[0]
		database.DB.Model(&business).Association("Employees").Find(&accounts)
		var owner entities.Account
		database.DB.First(&owner, business.OwnerID)
		accounts = append(accounts, owner)
	} else {
		// User is an individual
		accounts = append(accounts, user)
	}

	c.IndentedJSON(http.StatusOK, accounts)
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
func login(c *gin.Context) {
	var req accountModels.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: err.Error()})
		return
	}

	var account entities.Account
	if result := database.DB.Where("username = ?", req.Username).First(&account); result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			c.IndentedJSON(http.StatusUnauthorized, models.HTTPError{Error: "invalid credentials"})
		} else {
			log.Println("Failed to find account for login:", result.Error)
			c.IndentedJSON(http.StatusInternalServerError, models.HTTPError{Error: "internal server error"})
		}
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(account.PasswordHash), []byte(req.Password)); err != nil {
		c.IndentedJSON(http.StatusUnauthorized, models.HTTPError{Error: "invalid credentials"})
		return
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": account.Username,
		"id":  account.ID,
		"exp": time.Now().Add(time.Hour * 24).Unix(),
	})

	tokenString, err := token.SignedString([]byte(os.Getenv("JWT_SECRET")))
	if err != nil {
		c.IndentedJSON(http.StatusInternalServerError, models.HTTPError{Error: "failed to generate token"})
		return
	}

	c.IndentedJSON(http.StatusOK, gin.H{"token": tokenString})
}

// @Summary Get account information
// @Description Get account information. Users can get their own account, or any account within their business if they are an owner or employee.
// @Tags account
// @Produce  json
// @Param   id   path      int  true  "Account ID"
// @Success 200 {object} entities.Account
// @Failure 401 {object} models.HTTPError
// @Failure 403 {object} models.HTTPError
// @Failure 404 {object} models.HTTPError
// @Security BearerAuth
// @Router /account/{id} [get]
// @Id getAccountById
func getAccount(c *gin.Context) {
	id := c.Param("id")

	requestingUserID, err := middleware.GetUserIDFromContext(c)
	if err != nil {
		c.IndentedJSON(http.StatusUnauthorized, models.HTTPError{Error: err.Error()})
		return
	}

	var targetAccount entities.Account
	if result := database.DB.First(&targetAccount, id); result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			c.IndentedJSON(http.StatusNotFound, models.HTTPError{Error: "account not found"})
		} else {
			c.IndentedJSON(http.StatusInternalServerError, models.HTTPError{Error: "internal server error"})
		}
		return
	}

	// A user can get their own account
	if targetAccount.ID == requestingUserID {
		c.IndentedJSON(http.StatusOK, targetAccount)
		return
	}

	// Rule 2 & 3: Check business relationship
	var requestingUserAccount entities.Account
	if err := database.DB.Preload("OwnedBusinesses").Preload("MemberOf.Owner").First(&requestingUserAccount, requestingUserID).Error; err != nil {
		c.IndentedJSON(http.StatusInternalServerError, models.HTTPError{Error: "could not retrieve requesting user's account"})
		return
	}

	// Check if requesting user is the owner of a business that the target account belongs to
	for _, business := range requestingUserAccount.OwnedBusinesses {
		var employees []entities.Account
		database.DB.Model(&business).Association("Employees").Find(&employees)
		for _, emp := range employees {
			if emp.ID == targetAccount.ID {
				c.IndentedJSON(http.StatusOK, targetAccount)
				return
			}
		}
	}

	// Check if requesting user is an employee of a business that the target account belongs to
	for _, business := range requestingUserAccount.MemberOf {
		if business.Owner.ID == targetAccount.ID {
			c.IndentedJSON(http.StatusOK, targetAccount)
			return
		}
		var employees []entities.Account
		database.DB.Model(&business).Association("Employees").Find(&employees)
		for _, emp := range employees {
			if emp.ID == targetAccount.ID {
				c.IndentedJSON(http.StatusOK, targetAccount)
				return
			}
		}
	}

	c.IndentedJSON(http.StatusForbidden, models.HTTPError{Error: "access denied"})
}

// @Summary Delete an account
// @Description Delete an account. Users can delete their own account. Business owners can delete employee accounts.
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
func deleteAccount(c *gin.Context) {
	id := c.Param("id")
	requestingUserID, err := middleware.GetUserIDFromContext(c)
	if err != nil {
		c.IndentedJSON(http.StatusUnauthorized, models.HTTPError{Error: err.Error()})
		return
	}

	var targetAccount entities.Account
	if result := database.DB.Preload("MemberOf").Where("id = ?", id).First(&targetAccount); result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			c.IndentedJSON(http.StatusNotFound, models.HTTPError{Error: "account not found"})
		} else {
			c.IndentedJSON(http.StatusInternalServerError, models.HTTPError{Error: "internal server error"})
		}
		return
	}

	// A user cannot delete the business owner's account, even their own if they are the owner.
	var business entities.Business
	isTargetOwner := database.DB.Where("account_id = ?", targetAccount.ID).First(&business).Error == nil
	if isTargetOwner {
		c.IndentedJSON(http.StatusForbidden, models.HTTPError{Error: "business owner account cannot be deleted"})
		return
	}

	// User can delete their own account (if they are not an owner)
	if targetAccount.ID == requestingUserID {
		if result := database.DB.Delete(&targetAccount); result.Error != nil {
			c.IndentedJSON(http.StatusInternalServerError, models.HTTPError{Error: "failed to delete account"})
		} else {
			c.Status(http.StatusNoContent)
		}
		return
	}

	// Business owner can delete employee accounts
	var requestingUserAccount entities.Account
	if err := database.DB.Preload("OwnedBusinesses").First(&requestingUserAccount, requestingUserID).Error; err != nil {
		c.IndentedJSON(http.StatusInternalServerError, models.HTTPError{Error: "could not retrieve requesting user's account"})
		return
	}

	if len(requestingUserAccount.OwnedBusinesses) > 0 {
		ownedBusinessID := requestingUserAccount.OwnedBusinesses[0].ID
		for _, business := range targetAccount.MemberOf {
			if business.ID == ownedBusinessID {
				// Dissociate the employee from the business
				database.DB.Model(&targetAccount).Association("MemberOf").Delete(&business)
				// Delete the account
				if result := database.DB.Delete(&targetAccount); result.Error != nil {
					c.IndentedJSON(http.StatusInternalServerError, models.HTTPError{Error: "failed to delete account"})
				} else {
					c.Status(http.StatusNoContent)
				}
				return
			}
		}
	}

	c.IndentedJSON(http.StatusForbidden, models.HTTPError{Error: "access denied"})
}

func RegisterHandlers(r *gin.Engine) {
	// Public routes
	r.POST("/account/login", login)
	r.POST("/account", createAccount)

	// Authenticated routes
	accountGroup := r.Group("/account")
	accountGroup.Use(middleware.AuthMiddleware())
	{
		accountGroup.GET("", getAccounts)
		accountGroup.GET("/:id", getAccount)
		accountGroup.DELETE("/:id", deleteAccount)
	}
}
