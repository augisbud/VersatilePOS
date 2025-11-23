package database

import (
	"VersatilePOS/database/entities"
	"fmt"
	"log"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Connect() {
	var err error

	host := os.Getenv("DB_HOST")
	if host == "" {
		host = "localhost"
	}

	user := os.Getenv("DB_USER")
	if user == "" {
		user = "postgres"
	}

	password := os.Getenv("DB_PASSWORD")
	if password == "" {
		password = "SuperSecretPassword"
	}

	dbname := os.Getenv("DB_NAME")
	if dbname == "" {
		dbname = "VersatilePOS"
	}

	port := os.Getenv("DB_PORT")
	if port == "" {
		port = "5432"
	}

	sslmode := os.Getenv("DB_SSLMODE")
	if sslmode == "" {
		sslmode = "disable"
	}

	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=%s", host, user, password, dbname, port, sslmode)

	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database: ", err)
	}

	log.Println("Database connection established.")

	err = DB.AutoMigrate(&entities.Account{}, &entities.Business{}, &entities.BusinessEmployees{}, &entities.AccountRole{}, &entities.AccountRoleLink{}, &entities.AccountRoleFunctionLink{}, &entities.Function{})
	if err != nil {
		log.Fatal("Failed to migrate database: ", err)
	}

	log.Println("Database migrated.")

	seedFunctions(DB)
}

func seedFunctions(db *gorm.DB) {
	functions := []entities.Function{
		{Name: "Manage Accounts", Description: "Create, update, and delete accounts."},
		{Name: "Manage Businesses", Description: "Create, update, and delete businesses."},
		{Name: "Manage Roles", Description: "Manage account roles and permissions."},
	}

	for _, function := range functions {
		var existingFunction entities.Function
		if err := db.Where("name = ?", function.Name).First(&existingFunction).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				if err := db.Create(&function).Error; err != nil {
					log.Printf("failed to seed function %s: %v\n", function.Name, err)
				} else {
					log.Printf("Seeded function: %s\n", function.Name)
				}
			} else {
				log.Printf("failed to check for existing function %s: %v\n", function.Name, err)
			}
		}
	}
}
