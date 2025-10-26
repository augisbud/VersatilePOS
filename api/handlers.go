package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type album struct {
	ID     string  `json:"id"`
	Title  string  `json:"title"`
	Artist string  `json:"artist"`
	Price  float64 `json:"price"`
}

var albums = []album{
	{ID: "1", Title: "Blue Train", Artist: "John Coltrane", Price: 56.99},
	{ID: "2", Title: "Jeru", Artist: "Gerry Mulligan", Price: 17.99},
	{ID: "3", Title: "Sarah Vaughan and Clifford Brown", Artist: "Sarah Vaughan", Price: 39.99},
}

func getAlbums(c *gin.Context) {
	c.IndentedJSON(http.StatusOK, albums)
}

func registerHandlers(r *gin.Engine) {
	r.GET("/albums", getAlbums)

	RegisterEndpoint(EndpointMeta{
		Path:        "/albums",
		Method:      "get",
		Summary:     "List albums",
		Description: "Get list of albums",
		Tags:        []string{"albums"},
		Produces:    []string{"application/json"},
		Responses: map[string]map[string]any{
			"200": {
				"description": "OK",
				"schema": map[string]any{
					"type":  "array",
					"items": map[string]any{"$ref": "#/definitions/album"},
				},
			},
		},
		Definitions: map[string]map[string]any{
			"album": {
				"type": "object",
				"properties": map[string]any{
					"id":     map[string]any{"type": "string"},
					"title":  map[string]any{"type": "string"},
					"artist": map[string]any{"type": "string"},
					"price":  map[string]any{"type": "number", "format": "float"},
				},
			},
		},
	})
}
