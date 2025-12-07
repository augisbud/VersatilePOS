package controller

import (
	"VersatilePOS/generic/models"
	serviceModels "VersatilePOS/service/models"
	"VersatilePOS/service/service"
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

// @Summary Create service
// @Description Create a service with the provided details
// @Tags service
// @Accept  json
// @Produce  json
// @Param   service  body  models.CreateServiceRequest  true  "Service to create"
// @Success 201 {object} models.ServiceDto
// @Failure 400 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Router /service [post]
// @Id createService
func (ctrl *Controller) CreateService(c *gin.Context) {
	var req serviceModels.CreateServiceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: err.Error()})
		return
	}

	service, err := ctrl.service.CreateService(req)
	if err != nil {
		c.IndentedJSON(http.StatusInternalServerError, models.HTTPError{Error: err.Error()})
		return
	}

	c.IndentedJSON(http.StatusCreated, service)
}

// @Summary Get services
// @Description Get all services
// @Tags service
// @Produce  json
// @Success 200 {array} models.ServiceDto
// @Failure 500 {object} models.HTTPError
// @Router /service [get]
// @Id getServices
func (ctrl *Controller) GetServices(c *gin.Context) {
	services, err := ctrl.service.GetServices()
	if err != nil {
		c.IndentedJSON(http.StatusInternalServerError, models.HTTPError{Error: err.Error()})
		return
	}

	c.IndentedJSON(http.StatusOK, services)
}

// @Summary Get service by id
// @Description Get a service by its ID
// @Tags service
// @Produce  json
// @Param   id   path      int  true  "Service ID"
// @Success 200 {object} models.ServiceDto
// @Failure 400 {object} models.HTTPError
// @Failure 404 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Router /service/{id} [get]
// @Id getServiceById
func (ctrl *Controller) GetServiceById(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: "Invalid service ID"})
		return
	}

	service, err := ctrl.service.GetServiceByID(uint(id))
	if err != nil {
		if err.Error() == "service not found" {
			c.IndentedJSON(http.StatusNotFound, models.HTTPError{Error: err.Error()})
		} else {
			c.IndentedJSON(http.StatusInternalServerError, models.HTTPError{Error: err.Error()})
		}
		return
	}

	c.IndentedJSON(http.StatusOK, service)
}

// @Summary Update service details
// @Description Update service details
// @Tags service
// @Accept  json
// @Produce  json
// @Param   id   path      int  true  "Service ID"
// @Param   service  body  models.UpdateServiceRequest  true  "Service updates"
// @Success 200 {object} models.ServiceDto
// @Failure 400 {object} models.HTTPError
// @Failure 404 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Router /service/{id} [put]
// @Id updateService
func (ctrl *Controller) UpdateService(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: "Invalid service ID"})
		return
	}

	var req serviceModels.UpdateServiceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: err.Error()})
		return
	}

	service, err := ctrl.service.UpdateService(uint(id), req)
	if err != nil {
		if err.Error() == "service not found" {
			c.IndentedJSON(http.StatusNotFound, models.HTTPError{Error: err.Error()})
		} else {
			c.IndentedJSON(http.StatusInternalServerError, models.HTTPError{Error: err.Error()})
		}
		return
	}

	c.IndentedJSON(http.StatusOK, service)
}

// @Summary Delete service
// @Description Delete a service
// @Tags service
// @Param   id   path      int  true  "Service ID"
// @Success 204 "No Content"
// @Failure 400 {object} models.HTTPError
// @Failure 404 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Router /service/{id} [delete]
// @Id deleteService
func (ctrl *Controller) DeleteService(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: "Invalid service ID"})
		return
	}

	err = ctrl.service.DeleteService(uint(id))
	if err != nil {
		if err.Error() == "service not found" {
			c.IndentedJSON(http.StatusNotFound, models.HTTPError{Error: err.Error()})
		} else {
			c.IndentedJSON(http.StatusInternalServerError, models.HTTPError{Error: err.Error()})
		}
		return
	}

	c.Status(http.StatusNoContent)
}

func (ctrl *Controller) RegisterRoutes(r *gin.Engine) {
	serviceGroup := r.Group("/service")
	serviceGroup.POST("", ctrl.CreateService)
	serviceGroup.GET("", ctrl.GetServices)
	serviceGroup.GET("/:id", ctrl.GetServiceById)
	serviceGroup.PUT("/:id", ctrl.UpdateService)
	serviceGroup.DELETE("/:id", ctrl.DeleteService)
}

