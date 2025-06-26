package utils

import (
	"fmt"
	"net/smtp"
	"os"
)

// SendEmail sends an email using SMTP credentials from environment variables
func SendEmail(to []string, subject, body string) error {
	smtpHost := os.Getenv("SMTP_HOST")
	smtpPort := os.Getenv("SMTP_PORT")
	smtpUser := os.Getenv("SMTP_USER")
	smtpPass := os.Getenv("SMTP_PASS")
	sender := os.Getenv("SMTP_SENDER")

	if smtpHost == "" || smtpPort == "" || smtpUser == "" || smtpPass == "" || sender == "" {
		return fmt.Errorf("SMTP environment variables not set")
	}

	header := make(map[string]string)
	header["From"] = sender
	header["To"] = to[0] // Only first recipient in header
	header["Subject"] = subject
	header["MIME-Version"] = "1.0"
	header["Content-Type"] = "text/plain; charset=\"utf-8\""

	msg := ""
	for k, v := range header {
		msg += fmt.Sprintf("%s: %s\r\n", k, v)
	}
	msg += "\r\n" + body

	auth := smtp.PlainAuth("", smtpUser, smtpPass, smtpHost)
	addr := smtpHost + ":" + smtpPort
	return smtp.SendMail(addr, auth, sender, to, []byte(msg))
} 