package db

import (
	"database/sql"
	"log"
	"os"

	_ "github.com/lib/pq"
)

var DB *sql.DB

func ConnectDB() {
	connStr := os.Getenv("DATABASE_URL")
	var err error
	DB, err = sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal("❌ Failed to connect to DB:", err)
	}

	err = DB.Ping()
	if err != nil {
		log.Fatal("❌ DB not reachable:", err)
	}

	log.Println("✅ Connected to Railway PostgreSQL")
}
