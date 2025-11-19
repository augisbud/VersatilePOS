package business

import (
	businessModels "VersatilePOS/business/models"
	"VersatilePOS/database"
	"VersatilePOS/database/entities"
	"VersatilePOS/generic/models"
	"VersatilePOS/middleware"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// @Summary Create a business
// @Description Create a business with the provided details
// @Tags business
// @Accept  json
// @Produce  json
// @Param   business  body  models.CreateBusinessRequest  true  "Business to create"
// @Success 201 {object} models.BusinessResponse
// @Failure 400 {object} models.HTTPError
// @Failure 401 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Security BearerAuth
// @Router /business [post]
// @Id createBusiness
func createBusiness(c *gin.Context) {
	var req businessModels.CreateBusinessRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: err.Error()})
		return
	}

	ownerID, err := middleware.GetUserIDFromContext(c)
	if err != nil {
		c.IndentedJSON(http.StatusUnauthorized, models.HTTPError{Error: err.Error()})
		return
	}

	business := entities.Business{
		Name:              req.Name,
		IdentOwnerAccount: ownerID,
		Address:           req.Address,
		Phone:             req.Phone,
		Email:             req.Email,
	}

	if result := database.DB.Create(&business); result.Error != nil {
		log.Println("Failed to create business:", result.Error)
		c.IndentedJSON(http.StatusInternalServerError, models.HTTPError{Error: "internal server error"})
		return
	}

	var createdBusiness entities.Business
	if result := database.DB.Preload("OwnerAccount").First(&createdBusiness, business.IdentBusiness); result.Error != nil {
		log.Println("Failed to fetch created business:", result.Error)
		c.IndentedJSON(http.StatusInternalServerError, models.HTTPError{Error: "internal server error"})
		return
	}

	response := businessModels.BusinessResponse{
		IdentBusiness: createdBusiness.IdentBusiness,
		Name:          createdBusiness.Name,
		Address:       createdBusiness.Address,
		Phone:         createdBusiness.Phone,
		Email:         createdBusiness.Email,
		OwnerAccount: businessModels.OwnerAccountResponse{
			IdentAccount: createdBusiness.OwnerAccount.IdentAccount,
			Name:         createdBusiness.OwnerAccount.Name,
			Username:     createdBusiness.OwnerAccount.Username,
		},
	}

	c.IndentedJSON(http.StatusCreated, response)
}

// @Summary Get business information
// @Description Get business information
// @Tags business
// @Produce  json
// @Param   id   path      int  true  "Business ID"
// @Success 200 {object} models.BusinessResponse
// @Failure 401 {object} models.HTTPError
// @Failure 403 {object} models.HTTPError
// @Failure 404 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Security BearerAuth
// @Router /business/{id} [get]
// @Id getBusinessById
func getBusiness(c *gin.Context) {
	id := c.Param("id")

	userID, err := middleware.GetUserIDFromContext(c)
	if err != nil {
		c.IndentedJSON(http.StatusUnauthorized, models.HTTPError{Error: err.Error()})
		return
	}

	var business entities.Business
	if result := database.DB.Preload("OwnerAccount").First(&business, id); result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			c.IndentedJSON(http.StatusNotFound, models.HTTPError{Error: "business not found"})
		} else {
			log.Println("Failed to get business:", result.Error)
			c.IndentedJSON(http.StatusInternalServerError, models.HTTPError{Error: "internal server error"})
		}
		return
	}

	// Check if user is the owner
	if business.IdentOwnerAccount != userID {
		// If not owner, check if user is an employee of the business
		var userAccount entities.Account
		if err := database.DB.First(&userAccount, userID).Error; err != nil {
			c.IndentedJSON(http.StatusNotFound, models.HTTPError{Error: "user not found"})
			return
		}
		if userAccount.IdentBusiness == nil {
			c.IndentedJSON(http.StatusForbidden, models.HTTPError{Error: "user is not associated with any business"})
			return
		}
		if *userAccount.IdentBusiness != business.IdentBusiness {
			c.IndentedJSON(http.StatusForbidden, models.HTTPError{Error: "user does not belong to this business"})
			return
		}
	}

	response := businessModels.BusinessResponse{
		IdentBusiness: business.IdentBusiness,
		Name:          business.Name,
		Address:       business.Address,
		Phone:         business.Phone,
		Email:         business.Email,
		OwnerAccount: businessModels.OwnerAccountResponse{
			IdentAccount: business.OwnerAccount.IdentAccount,
			Name:         business.OwnerAccount.Name,
			Username:     business.OwnerAccount.Username,
		},
	}

	c.IndentedJSON(http.StatusOK, response)
}

func RegisterHandlers(r *gin.Engine) {
	businessGroup := r.Group("/business")
	businessGroup.Use(middleware.AuthMiddleware())
	businessGroup.POST("", createBusiness)
	businessGroup.GET("/:id", getBusiness)
}
