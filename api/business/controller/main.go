package controller

import (
	businessModels "VersatilePOS/business/models"
	"VersatilePOS/business/service"
	"VersatilePOS/generic/models"
	"VersatilePOS/middleware"
	"log"
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

// @Summary Create a business
// @Description Create a business with the provided details
// @Tags business
// @Accept  json
// @Produce  json
// @Param   business  body  models.CreateBusinessRequest  true  "Business to create"
// @Success 201 {object} models.BusinessDto
// @Failure 400 {object} models.HTTPError
// @Failure 401 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Security BearerAuth
// @Router /business [post]
// @Id createBusiness
func (ctrl *Controller) CreateBusiness(c *gin.Context) {
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

	business, err := ctrl.service.CreateBusiness(req, ownerID)
	if err != nil {
		log.Println("Failed to create business:", err)
		c.IndentedJSON(http.StatusInternalServerError, models.HTTPError{Error: "internal server error"})
		return
	}

	c.IndentedJSON(http.StatusCreated, business)
}

// @Summary Get all businesses for the current user
// @Description Get all businesses where the current user is an owner
// @Tags business
// @Produce  json
// @Success 200 {array} models.BusinessDto
// @Failure 401 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Security BearerAuth
// @Router /business [get]
// @Id getBusinesses
func (ctrl *Controller) GetBusinesses(c *gin.Context) {
	ownerID, err := middleware.GetUserIDFromContext(c)
	if err != nil {
		c.IndentedJSON(http.StatusUnauthorized, models.HTTPError{Error: err.Error()})
		return
	}

	businesses, err := ctrl.service.GetBusinesses(ownerID)
	if err != nil {
		log.Println("Failed to get businesses:", err)
		c.IndentedJSON(http.StatusInternalServerError, models.HTTPError{Error: "internal server error"})
		return
	}

	c.IndentedJSON(http.StatusOK, businesses)
}

// @Summary Get business information
// @Description Get business information
// @Tags business
// @Produce  json
// @Param   id   path      int  true  "Business ID"
// @Success 200 {object} models.BusinessDto
// @Failure 401 {object} models.HTTPError
// @Failure 403 {object} models.HTTPError
// @Failure 404 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Security BearerAuth
// @Router /business/{id} [get]
// @Id getBusinessById
func (ctrl *Controller) GetBusinessById(c *gin.Context) {
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

	business, err := ctrl.service.GetBusiness(uint(id), userID)
	if err != nil {
		switch err.Error() {
		case "business not found":
			c.IndentedJSON(http.StatusNotFound, models.HTTPError{Error: err.Error()})
		case "user not found":
			c.IndentedJSON(http.StatusNotFound, models.HTTPError{Error: err.Error()})
		case "user does not belong to this business":
			c.IndentedJSON(http.StatusForbidden, models.HTTPError{Error: err.Error()})
		default:
			log.Println("Failed to get business:", err)
			c.IndentedJSON(http.StatusInternalServerError, models.HTTPError{Error: "internal server error"})
		}
		return
	}

	c.IndentedJSON(http.StatusOK, business)
}

func (ctrl *Controller) RegisterRoutes(r *gin.Engine) {
	businessGroup := r.Group("/business")
	businessGroup.Use(middleware.AuthMiddleware())
	businessGroup.POST("", ctrl.CreateBusiness)
	businessGroup.GET("", ctrl.GetBusinesses)
	businessGroup.GET("/:id", ctrl.GetBusinessById)
	ctrl.RegisterRoleRoutes(businessGroup)
}
