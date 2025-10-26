package main

import (
	"encoding/json"
	"maps"
	"net/http"

	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

type EndpointMeta struct {
	Path        string
	Method      string
	Summary     string
	Description string
	Tags        []string
	Produces    []string
	Responses   map[string]map[string]interface{}
	Definitions map[string]map[string]interface{}
}

var endpoints []EndpointMeta
var globalDefinitions = map[string]map[string]interface{}{}

func RegisterEndpoint(e EndpointMeta) {
	endpoints = append(endpoints, e)
	maps.Copy(globalDefinitions, e.Definitions)
}

func buildSwaggerSpec() (map[string]interface{}, error) {
	paths := map[string]map[string]interface{}{}
	for _, e := range endpoints {
		methodObj := map[string]interface{}{
			"summary":     e.Summary,
			"description": e.Description,
			"tags":        e.Tags,
			"produces":    e.Produces,
			"responses":   e.Responses,
		}
		if _, ok := paths[e.Path]; !ok {
			paths[e.Path] = map[string]interface{}{}
		}
		paths[e.Path][e.Method] = methodObj
	}

	spec := map[string]any{
		"swagger": "2.0",
		"info": map[string]any{
			"title":       "POS API",
			"version":     "1.0",
			"description": "POS API (generated at runtime)",
		},
		"host":        "localhost:8080",
		"basePath":    "/",
		"schemes":     []string{"http"},
		"paths":       paths,
		"definitions": globalDefinitions,
	}

	return spec, nil
}

func registerSwagger(r *gin.Engine) {
	r.GET("/swagger/doc.json", func(c *gin.Context) {
		spec, err := buildSwaggerSpec()
		if err != nil {
			c.String(http.StatusInternalServerError, "failed to build swagger spec: %v", err)
			return
		}
		b, err := json.MarshalIndent(spec, "", "  ")
		if err != nil {
			c.String(http.StatusInternalServerError, "failed to marshal swagger spec: %v", err)
			return
		}
		c.Data(http.StatusOK, "application/json; charset=utf-8", b)
	})

	r.GET("/swagger", func(c *gin.Context) {
		c.Redirect(http.StatusMovedPermanently, "/swagger/ui/index.html")
	})
	r.GET("/swagger/ui/*any", ginSwagger.WrapHandler(swaggerFiles.Handler, ginSwagger.URL("/swagger/doc.json")))
}
