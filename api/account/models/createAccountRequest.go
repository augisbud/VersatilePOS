package models

import (
	"github.com/go-playground/validator/v10"
)

type CreateAccountRequest struct {
	Name     string `json:"name" validate:"required"`
	Username string `json:"username" validate:"required,alphanum,min=4,max=32"`
	Password string `json:"password" validate:"required,min=8,password"`

	BusinessID uint `json:"businessId,omitempty" validate:"omitempty,gt=0"`
}

func passwordValidator(fl validator.FieldLevel) bool {
	password := fl.Field().String()
	var hasLetter, hasNumber bool
	for _, c := range password {
		switch {
		case 'a' <= c && c <= 'z', 'A' <= c && c <= 'Z':
			hasLetter = true
		case '0' <= c && c <= '9':
			hasNumber = true
		}
	}
	return hasLetter && hasNumber
}

func (r *CreateAccountRequest) Validate() error {
	validate := validator.New()
	_ = validate.RegisterValidation("password", passwordValidator)
	if err := validate.Struct(r); err != nil {
		return err
	}
	return nil
}
