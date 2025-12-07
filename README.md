# VersatilePOS

## Backend Setup (MacOS)

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew install postgresql

brew services start postgresql
createuser postgres
createdb VersatilePOS

psql -U postgres

alter user postgres with encrypted password 'SuperSecretPassword';
grant all privileges on database "VersatilePOS" to postgres;
\q

cd api/

go install github.com/swaggo/swag/cmd/swag@latest
export PATH=$PATH:$(go env GOPATH)/bin

swag init -g server/main.go
go run ./server/main.go
```

## Backend Setup (Windows)

```powershell
winget install -e --id GoLang.Go
winget install -e --id PostgreSQL.PostgreSQL.18

createdb -U postgres VersatilePOS

psql -U postgres -h localhost

alter user postgres with encrypted password 'SuperSecretPassword';
grant all privileges on database "VersatilePOS" to postgres;
\q

cd api\

go install github.com/swaggo/swag/cmd/swag@latest
$env:Path += ";$(go env GOPATH)\bin"

swag init -g server\main.go
go run .\server\main.go
```