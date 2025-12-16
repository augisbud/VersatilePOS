package database

import (
	"VersatilePOS/database/entities"
	"VersatilePOS/generic/constants"
	"fmt"
	"log"
	"os"

	"golang.org/x/crypto/bcrypt"
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

	err = DB.AutoMigrate(
		&entities.Account{},
		&entities.Business{},
		&entities.BusinessEmployees{},
		&entities.AccountRole{},
		&entities.AccountRoleLink{},
		&entities.AccountRoleFunctionLink{},
		&entities.Function{},
		&entities.Payment{},
		&entities.PriceModifier{},
		&entities.PriceModifierOrderLink{},
		&entities.PriceModifierReservationLink{},
		&entities.Reservation{},
		&entities.ReservationPaymentLink{},
		&entities.Order{},
		&entities.OrderItem{},
		&entities.OrderPaymentLink{},
		&entities.Item{},
		&entities.ItemInventory{},
		&entities.ItemOption{},
		&entities.ItemOptionInventory{},
		&entities.ItemOptionLink{},
		&entities.Service{},
		&entities.AccountServices{},
		&entities.Tag{},
		&entities.ItemTagLink{},
		&entities.ItemOptionTagLink{},
		&entities.ServiceTagLink{},
	)
	if err != nil {
		log.Fatal("Failed to migrate database: ", err)
	}

	log.Println("Database migrated.")

	seedFunctions(DB)
	seedSuperAdmin(DB)
}

func seedFunctions(db *gorm.DB) {
	functions := []entities.Function{
		{Name: "Manage Accounts", Action: constants.Accounts, Description: "Create, update, and delete accounts."},
		{Name: "Manage Businesses", Action: constants.Businesses, Description: "Create, update, and delete businesses."},
		{Name: "Manage Roles", Action: constants.Roles, Description: "Manage account roles and permissions."},
		{Name: "Manage Reservations", Action: constants.Reservations, Description: "Manage account roles and permissions."},
		{Name: "Manage Price Modifiers", Action: constants.PriceModifiers, Description: "Create, update, and delete price modifiers (discounts, taxes, etc.)."},
		{Name: "Manage Services", Action: constants.Services, Description: "Create, update, and delete services."},
		{Name: "Manage Items", Action: constants.Items, Description: "Create, update, and delete items."},
		{Name: "Manage Item Options", Action: constants.ItemOptions, Description: "Create, update, and delete item options."},
		{Name: "Manage Orders", Action: constants.Orders, Description: "Create, update, and manage orders."},
		{Name: "Manage Tags", Action: constants.Tags, Description: "Create, update, and delete tags for categorizing items, item options, and services."},
		{Name: "Superadmin", Action: constants.Superadmin, Description: "Full access to everything."},
	}

	for _, function := range functions {
		var existingFunction entities.Function
		if err := db.Where("name = ? AND action = ?", function.Name, function.Action).First(&existingFunction).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				if err := db.Create(&function).Error; err != nil {
					log.Printf("failed to seed function %s:%s: %v\n", function.Name, function.Action, err)
				} else {
					log.Printf("Seeded function: %s:%s\n", function.Name, function.Action)
				}
			} else {
				log.Printf("failed to check for existing function %s:%s: %v\n", function.Name, function.Action, err)
			}
		}
	}
}

func seedSuperAdmin(db *gorm.DB) {
	var admin entities.Account
	if err := db.Where("username = ?", "admin").First(&admin).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			passwordHash, _ := bcrypt.GenerateFromPassword([]byte("SuperSecretAdmin123"), bcrypt.DefaultCost)
			admin = entities.Account{
				Name:         "Super Admin",
				Username:     "admin",
				PasswordHash: string(passwordHash),
			}
			if err := db.Create(&admin).Error; err != nil {
				log.Printf("failed to create superadmin: %v\n", err)
				return
			}
			log.Println("Seeded superadmin user")
		} else {
			log.Printf("failed to check for superadmin: %v\n", err)
			return
		}
	}

	var superAdminRole entities.AccountRole
	if err := db.Where("name = ?", "Superadmin").First(&superAdminRole).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			superAdminRole = entities.AccountRole{
				Name: "Superadmin",
			}
			if err := db.Create(&superAdminRole).Error; err != nil {
				log.Printf("failed to create superadmin role: %v\n", err)
				return
			}
			log.Println("Seeded superadmin role")
		} else {
			log.Printf("failed to check for superadmin role: %v\n", err)
			return
		}
	}

	var link entities.AccountRoleLink
	if err := db.Where("account_id = ? AND account_role_id = ?", admin.ID, superAdminRole.ID).First(&link).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			link = entities.AccountRoleLink{
				AccountID:     admin.ID,
				AccountRoleID: superAdminRole.ID,
				Status:        constants.Active,
			}
			if err := db.Create(&link).Error; err != nil {
				log.Printf("failed to assign superadmin role: %v\n", err)
			} else {
				log.Println("Assigned superadmin role to admin")
			}
		}

		// Assign Superadmin function to Superadmin role
		var superAdminFunction entities.Function
		if err := db.Where("action = ?", constants.Superadmin).First(&superAdminFunction).Error; err != nil {
			log.Printf("failed to find superadmin function: %v\n", err)
			return
		}

		var funcLink entities.AccountRoleFunctionLink
		if err := db.Where("account_role_id = ? AND function_id = ?", superAdminRole.ID, superAdminFunction.ID).First(&funcLink).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				funcLink = entities.AccountRoleFunctionLink{
					AccountRoleID: superAdminRole.ID,
					FunctionID:    superAdminFunction.ID,
					AccessLevels:  []string{string(constants.Read), string(constants.Write)},
				}
				if err := db.Create(&funcLink).Error; err != nil {
					log.Printf("failed to assign superadmin function to role: %v\n", err)
				} else {
					log.Println("Assigned superadmin function to superadmin role")
				}
			}
		}
	}
}
