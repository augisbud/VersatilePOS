package account

import (
	accountModels "VersatilePOS/internal/account/models"
	"VersatilePOS/internal/database"
	"VersatilePOS/internal/database/entities"
	"VersatilePOS/internal/generic/models"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	jwt "github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// @Summary Create worker account
// @Description Create worker account
// @Accept  json
// @Produce  json
// @Param   account  body  models.CreateAccountRequest  true  "Account to create"
// @Success 201 {object} entities.Account
// @Failure 400 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Router /account [post]
func createAccount(c *gin.Context) {
	var req accountModels.CreateAccountRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: err.Error()})
		return
	}

	passwordHash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.IndentedJSON(http.StatusInternalServerError, models.HTTPError{Error: "failed to hash password"})
		return
	}

	account := entities.Account{
		Name:          req.Name,
		IdentBusiness: req.IdentBusiness,
		Username:      req.Username,
		PasswordHash:  string(passwordHash),
	}

	if result := database.DB.Create(&account); result.Error != nil {
		log.Println("Failed to create account:", result.Error)
		c.IndentedJSON(http.StatusInternalServerError, models.HTTPError{Error: "internal server error"})
		return
	}

	c.IndentedJSON(http.StatusCreated, account)
}

// @Summary Get all accounts
// @Description Get all accounts
// @Produce  json
// @Success 200 {array} entities.Account
// @Failure 500 {object} models.HTTPError
// @Router /account [get]
func getAccounts(c *gin.Context) {
	var accounts []entities.Account
	if result := database.DB.Find(&accounts); result.Error != nil {
		log.Println("Failed to get accounts:", result.Error)
		c.IndentedJSON(http.StatusInternalServerError, models.HTTPError{Error: "internal server error"})
		return
	}
	c.IndentedJSON(http.StatusOK, accounts)
}

// @Summary Log in to account
// @Description Log in to account
// @Accept  json
// @Produce  json
// @Param   credentials  body  models.LoginRequest  true  "Login credentials"
// @Success 200 {object} map[string]string
// @Failure 400 {object} models.HTTPError
// @Failure 401 {object} models.HTTPError
// @Router /account/login [post]
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
		"sub": account.IdentAccount,
		"exp": time.Now().Add(time.Hour * 24).Unix(),
	})

	// Sign and get the complete encoded token as a string using the secret
	tokenString, err := token.SignedString([]byte(os.Getenv("JWT_SECRET")))
	if err != nil {
		c.IndentedJSON(http.StatusInternalServerError, models.HTTPError{Error: "failed to generate token"})
		return
	}

	c.IndentedJSON(http.StatusOK, gin.H{"token": tokenString})
}

// @Summary Get account information
// @Description Get account information
// @Produce  json
// @Param   id   path      int  true  "Account ID"
// @Success 200 {object} entities.Account
// @Failure 404 {object} models.HTTPError
// @Router /account/{id} [get]
func getAccount(c *gin.Context) {
	id := c.Param("id")
	var account entities.Account
	if result := database.DB.Where("ident_account = ?", id).First(&account); result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			c.IndentedJSON(http.StatusNotFound, models.HTTPError{Error: "account not found"})
		} else {
			log.Println("Failed to get account:", result.Error)
			c.IndentedJSON(http.StatusInternalServerError, models.HTTPError{Error: "internal server error"})
		}
		return
	}
	c.IndentedJSON(http.StatusOK, account)
}

// @Summary Delete an account
// @Description Delete an account
// @Param   id   path      int  true  "Account ID"
// @Success 204
// @Failure 404 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Router /account/{id} [delete]
func deleteAccount(c *gin.Context) {
	id := c.Param("id")
	if result := database.DB.Where("ident_account = ?", id).Delete(&entities.Account{}); result.Error != nil {
		log.Println("Failed to delete account:", result.Error)
		c.IndentedJSON(http.StatusInternalServerError, models.HTTPError{Error: "internal server error"})
		return
	} else if result.RowsAffected == 0 {
		c.IndentedJSON(http.StatusNotFound, models.HTTPError{Error: "account not found"})
		return
	}
	c.Status(http.StatusNoContent)
}

func RegisterHandlers(r *gin.Engine) {
	r.POST("/account", createAccount)
	r.GET("/account", getAccounts)
	r.POST("/account/login", login)
	r.GET("/account/:id", getAccount)
	r.DELETE("/account/:id", deleteAccount)
}
