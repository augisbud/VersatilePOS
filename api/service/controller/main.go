package controller

import (
	"VersatilePOS/generic/models"
	"VersatilePOS/middleware"
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
// @Failure 401 {object} models.HTTPError
// @Failure 403 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Security BearerAuth
// @Router /service [post]
// @Id createService
func (ctrl *Controller) CreateService(c *gin.Context) {
	var req serviceModels.CreateServiceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: err.Error()})
		return
	}

	userID, err := middleware.GetUserIDFromContext(c)
	if err != nil {
		c.IndentedJSON(http.StatusUnauthorized, models.HTTPError{Error: err.Error()})
		return
	}

	service, err := ctrl.service.CreateService(req, userID)
	if err != nil {
		if err.Error() == "unauthorized" {
			c.IndentedJSON(http.StatusForbidden, models.HTTPError{Error: err.Error()})
		} else {
			c.IndentedJSON(http.StatusInternalServerError, models.HTTPError{Error: err.Error()})
		}
		return
	}

	c.IndentedJSON(http.StatusCreated, service)
}

// @Summary Get services
// @Description Get all services of current business
// @Tags service
// @Accept  json
// @Produce  json
// @Param   businessId query int true "Business ID"
// @Success 200 {array} models.ServiceDto
// @Failure 400 {object} models.HTTPError
// @Failure 401 {object} models.HTTPError
// @Failure 403 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Security BearerAuth
// @Router /service [get]
// @Id getServices
func (ctrl *Controller) GetServices(c *gin.Context) {
	userID, err := middleware.GetUserIDFromContext(c)
	if err != nil {
		c.IndentedJSON(http.StatusUnauthorized, models.HTTPError{Error: err.Error()})
		return
	}

	businessIDStr := c.Query("businessId")
	if businessIDStr == "" {
		c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: "businessId query parameter is required"})
		return
	}

	businessID, err := strconv.ParseUint(businessIDStr, 10, 32)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: "invalid businessId"})
		return
	}

	services, err := ctrl.service.GetServices(uint(businessID), userID)
	if err != nil {
		if err.Error() == "unauthorized to view services for this business" {
			c.IndentedJSON(http.StatusForbidden, models.HTTPError{Error: err.Error()})
		} else {
			c.IndentedJSON(http.StatusInternalServerError, models.HTTPError{Error: err.Error()})
		}
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
// @Failure 401 {object} models.HTTPError
// @Failure 403 {object} models.HTTPError
// @Failure 404 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Security BearerAuth
// @Router /service/{id} [get]
// @Id getServiceById
func (ctrl *Controller) GetServiceById(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: "Invalid service ID"})
		return
	}

	userID, err := middleware.GetUserIDFromContext(c)
	if err != nil {
		c.IndentedJSON(http.StatusUnauthorized, models.HTTPError{Error: err.Error()})
		return
	}

	service, err := ctrl.service.GetServiceByID(uint(id), userID)
	if err != nil {
		if err.Error() == "service not found" {
			c.IndentedJSON(http.StatusNotFound, models.HTTPError{Error: err.Error()})
		} else if err.Error() == "unauthorized" {
			c.IndentedJSON(http.StatusForbidden, models.HTTPError{Error: err.Error()})
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
// @Failure 401 {object} models.HTTPError
// @Failure 403 {object} models.HTTPError
// @Failure 404 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Security BearerAuth
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

	userID, err := middleware.GetUserIDFromContext(c)
	if err != nil {
		c.IndentedJSON(http.StatusUnauthorized, models.HTTPError{Error: err.Error()})
		return
	}

	service, err := ctrl.service.UpdateService(uint(id), req, userID)
	if err != nil {
		if err.Error() == "service not found" {
			c.IndentedJSON(http.StatusNotFound, models.HTTPError{Error: err.Error()})
		} else if err.Error() == "unauthorized" || err.Error() == "unauthorized to assign service to this business" {
			c.IndentedJSON(http.StatusForbidden, models.HTTPError{Error: err.Error()})
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
// @Failure 401 {object} models.HTTPError
// @Failure 403 {object} models.HTTPError
// @Failure 404 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Security BearerAuth
// @Router /service/{id} [delete]
// @Id deleteService
func (ctrl *Controller) DeleteService(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: "Invalid service ID"})
		return
	}

	userID, err := middleware.GetUserIDFromContext(c)
	if err != nil {
		c.IndentedJSON(http.StatusUnauthorized, models.HTTPError{Error: err.Error()})
		return
	}

	err = ctrl.service.DeleteService(uint(id), userID)
	if err != nil {
		if err.Error() == "service not found" {
			c.IndentedJSON(http.StatusNotFound, models.HTTPError{Error: err.Error()})
		} else if err.Error() == "unauthorized" {
			c.IndentedJSON(http.StatusForbidden, models.HTTPError{Error: err.Error()})
		} else {
			c.IndentedJSON(http.StatusInternalServerError, models.HTTPError{Error: err.Error()})
		}
		return
	}

	c.Status(http.StatusNoContent)
}

// @Summary Assign a service to an employee
// @Description Assign a service to an employee. The employee must belong to the same business as the service.
// @Tags service
// @Accept  json
// @Produce  json
// @Param   employeeId   path      int  true  "Employee ID"
// @Param   request  body  models.AssignServiceRequest  true  "Service assignment request"
// @Success 204 "No Content"
// @Failure 400 {object} models.HTTPError
// @Failure 401 {object} models.HTTPError
// @Failure 403 {object} models.HTTPError
// @Failure 404 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Security BearerAuth
// @Router /service/employee/{employeeId} [post]
// @Id assignServiceToEmployee
func (ctrl *Controller) AssignServiceToEmployee(c *gin.Context) {
	employeeIDStr := c.Param("employeeId")
	employeeID, err := strconv.ParseUint(employeeIDStr, 10, 32)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: "Invalid employee ID"})
		return
	}

	var req serviceModels.AssignServiceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: err.Error()})
		return
	}

	userID, err := middleware.GetUserIDFromContext(c)
	if err != nil {
		c.IndentedJSON(http.StatusUnauthorized, models.HTTPError{Error: err.Error()})
		return
	}

	err = ctrl.service.AssignServiceToEmployee(uint(employeeID), req, userID)
	if err != nil {
		switch err.Error() {
		case "service not found", "employee not found":
			c.IndentedJSON(http.StatusNotFound, models.HTTPError{Error: err.Error()})
		case "unauthorized", "employee does not belong to the service's business":
			c.IndentedJSON(http.StatusForbidden, models.HTTPError{Error: err.Error()})
		default:
			c.IndentedJSON(http.StatusInternalServerError, models.HTTPError{Error: err.Error()})
		}
		return
	}

	c.Status(http.StatusNoContent)
}

// @Summary Remove a service from an employee
// @Description Remove a service from an employee.
// @Tags service
// @Param   employeeId   path      int  true  "Employee ID"
// @Param   serviceId   path      int  true  "Service ID"
// @Success 204 "No Content"
// @Failure 400 {object} models.HTTPError
// @Failure 401 {object} models.HTTPError
// @Failure 403 {object} models.HTTPError
// @Failure 404 {object} models.HTTPError
// @Failure 500 {object} models.HTTPError
// @Security BearerAuth
// @Router /service/{serviceId}/employee/{employeeId} [delete]
// @Id removeServiceFromEmployee
func (ctrl *Controller) RemoveServiceFromEmployee(c *gin.Context) {
	employeeIDStr := c.Param("employeeId")
	employeeID, err := strconv.ParseUint(employeeIDStr, 10, 32)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: "Invalid employee ID"})
		return
	}

	serviceIDStr := c.Param("serviceId")
	serviceID, err := strconv.ParseUint(serviceIDStr, 10, 32)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, models.HTTPError{Error: "Invalid service ID"})
		return
	}

	userID, err := middleware.GetUserIDFromContext(c)
	if err != nil {
		c.IndentedJSON(http.StatusUnauthorized, models.HTTPError{Error: err.Error()})
		return
	}

	err = ctrl.service.RemoveServiceFromEmployee(uint(employeeID), uint(serviceID), userID)
	if err != nil {
		switch err.Error() {
		case "service not found", "employee not found":
			c.IndentedJSON(http.StatusNotFound, models.HTTPError{Error: err.Error()})
		case "unauthorized":
			c.IndentedJSON(http.StatusForbidden, models.HTTPError{Error: err.Error()})
		default:
			c.IndentedJSON(http.StatusInternalServerError, models.HTTPError{Error: err.Error()})
		}
		return
	}

	c.Status(http.StatusNoContent)
}

func (ctrl *Controller) RegisterRoutes(r *gin.Engine) {
	serviceGroup := r.Group("/service")
	serviceGroup.Use(middleware.AuthMiddleware())
	{
		serviceGroup.POST("", ctrl.CreateService)
		serviceGroup.GET("", ctrl.GetServices)
		serviceGroup.GET("/:id", ctrl.GetServiceById)
		serviceGroup.PUT("/:id", ctrl.UpdateService)
		serviceGroup.DELETE("/:id", ctrl.DeleteService)
		serviceGroup.POST("/employee/:employeeId", ctrl.AssignServiceToEmployee)
		serviceGroup.DELETE("/:serviceId/employee/:employeeId", ctrl.RemoveServiceFromEmployee)
	}
}

