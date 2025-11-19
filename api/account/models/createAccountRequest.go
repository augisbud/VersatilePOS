package models

import (
	"errors"

	"github.com/go-playground/validator/v10"
)

type CreateAccountRequest struct {
	Name          string `json:"name" validate:"required"`
	IdentBusiness *uint64 `json:"identBusiness,omitempty" validate:"omitempty,gt=0"`
	Username      string `json:"username" validate:"required,alphanum,min=4,max=32"`
	Password      string `json:"password" validate:"required,min=8,password"`
}

type BusinessExistsFunc func(identBusiness uint64) bool

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

func (r *CreateAccountRequest) Validate(businessExists BusinessExistsFunc) error {
	validate := validator.New()
	_ = validate.RegisterValidation("password", passwordValidator)
	if err := validate.Struct(r); err != nil {
		return err
	}
	if r.IdentBusiness != nil {
		if !businessExists(*r.IdentBusiness) {
			return errors.New("identBusiness does not exist")
		}
	}
	return nil
}
