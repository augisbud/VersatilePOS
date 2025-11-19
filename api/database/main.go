package database

import (
	"VersatilePOS/database/entities"
	"log"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Connect() {
	var err error

	// TODO: Use environment variables or a config file for these settings in production
	DB, err = gorm.Open(postgres.Open("host=localhost user=postgres password=SuperSecretPassword dbname=VersatilePOS port=5432 sslmode=disable"), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database: ", err)
	}

	log.Println("Database connection established.")

	err = DB.AutoMigrate(&entities.Account{}, &entities.Business{})
	if err != nil {
		log.Fatal("Failed to migrate database: ", err)
	}
	log.Println("Database migrated.")
}
