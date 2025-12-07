package controller

import (
	"VersatilePOS/generic/models"
	"VersatilePOS/middleware"
	reservationModels "VersatilePOS/reservation/models"
	"VersatilePOS/reservation/service"
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

// @Summary Create reservation
// @Description Create a new reservation
// @Tags reservation
// @Accept  json
// @Produce  json
// @Param   reservation  body  models.CreateReservationRequest  true  "Reservation to create"
// @Success 201 {object} models.ReservationDto
// @Failure 400 {object} models.HTTPError
// @Failure 401 {object} models.HTTPError
// @Failure 403 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Security BearerAuth
// @Router /reservation [post]
// @Id createReservation
func (ctrl *Controller) CreateReservation(c *gin.Context) {
	var req reservationModels.CreateReservationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: err.Error()})
		return
	}

	userID, err := middleware.GetUserIDFromContext(c)
	if err != nil {
		c.IndentedJSON(http.StatusUnauthorized, models.HTTPError{Error: err.Error()})
		return
	}

	reservation, err := ctrl.service.CreateReservation(req, userID)
	if err != nil {
		if err.Error() == "unauthorized" {
			c.IndentedJSON(http.StatusForbidden, models.HTTPError{Error: err.Error()})
		} else {
			c.IndentedJSON(http.StatusInternalServerError, models.HTTPError{Error: err.Error()})
		}
		return
	}

	c.IndentedJSON(http.StatusCreated, reservation)
}

// @Summary Get reservations
// @Description Get all reservations
// @Tags reservation
// @Produce  json
// @Success 200 {array} models.ReservationDto
// @Failure 401 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Security BearerAuth
// @Router /reservation [get]
// @Id getReservations
func (ctrl *Controller) GetReservations(c *gin.Context) {
	userID, err := middleware.GetUserIDFromContext(c)
	if err != nil {
		c.IndentedJSON(http.StatusUnauthorized, models.HTTPError{Error: err.Error()})
		return
	}

	reservations, err := ctrl.service.GetReservations(userID)
	if err != nil {
		c.IndentedJSON(http.StatusInternalServerError, models.HTTPError{Error: err.Error()})
		return
	}

	c.IndentedJSON(http.StatusOK, reservations)
}

// @Summary Get reservation by id
// @Description Get a reservation by its ID
// @Tags reservation
// @Produce  json
// @Param   id   path      int  true  "Reservation ID"
// @Success 200 {object} models.ReservationDto
// @Failure 400 {object} models.HTTPError
// @Failure 401 {object} models.HTTPError
// @Failure 403 {object} models.HTTPError
// @Failure 404 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Security BearerAuth
// @Router /reservation/{id} [get]
// @Id getReservationById
func (ctrl *Controller) GetReservationById(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: "Invalid reservation ID"})
		return
	}

	userID, err := middleware.GetUserIDFromContext(c)
	if err != nil {
		c.IndentedJSON(http.StatusUnauthorized, models.HTTPError{Error: err.Error()})
		return
	}

	reservation, err := ctrl.service.GetReservationByID(uint(id), userID)
	if err != nil {
		if err.Error() == "reservation not found" {
			c.IndentedJSON(http.StatusNotFound, models.HTTPError{Error: err.Error()})
		} else if err.Error() == "unauthorized" {
			c.IndentedJSON(http.StatusForbidden, models.HTTPError{Error: err.Error()})
		} else {
			c.IndentedJSON(http.StatusInternalServerError, models.HTTPError{Error: err.Error()})
		}
		return
	}

	c.IndentedJSON(http.StatusOK, reservation)
}

// @Summary Update reservation details
// @Description Update reservation details
// @Tags reservation
// @Accept  json
// @Produce  json
// @Param   id   path      int  true  "Reservation ID"
// @Param   reservation  body  models.UpdateReservationRequest  true  "Reservation updates"
// @Success 200 {object} models.ReservationDto
// @Failure 400 {object} models.HTTPError
// @Failure 401 {object} models.HTTPError
// @Failure 403 {object} models.HTTPError
// @Failure 404 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Security BearerAuth
// @Router /reservation/{id} [put]
// @Id updateReservation
func (ctrl *Controller) UpdateReservation(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: "Invalid reservation ID"})
		return
	}

	var req reservationModels.UpdateReservationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: err.Error()})
		return
	}

	userID, err := middleware.GetUserIDFromContext(c)
	if err != nil {
		c.IndentedJSON(http.StatusUnauthorized, models.HTTPError{Error: err.Error()})
		return
	}

	reservation, err := ctrl.service.UpdateReservation(uint(id), req, userID)
	if err != nil {
		if err.Error() == "reservation not found" {
			c.IndentedJSON(http.StatusNotFound, models.HTTPError{Error: err.Error()})
		} else if err.Error() == "unauthorized" || err.Error() == "unauthorized to assign reservation to this account" {
			c.IndentedJSON(http.StatusForbidden, models.HTTPError{Error: err.Error()})
		} else {
			c.IndentedJSON(http.StatusInternalServerError, models.HTTPError{Error: err.Error()})
		}
		return
	}

	c.IndentedJSON(http.StatusOK, reservation)
}

func (ctrl *Controller) RegisterRoutes(r *gin.Engine) {
	reservationGroup := r.Group("/reservation")
	reservationGroup.Use(middleware.AuthMiddleware())
	{
		reservationGroup.POST("", ctrl.CreateReservation)
		reservationGroup.GET("", ctrl.GetReservations)
		reservationGroup.GET("/:id", ctrl.GetReservationById)
		reservationGroup.PUT("/:id", ctrl.UpdateReservation)
	}
}

