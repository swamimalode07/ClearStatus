package main

import (
    "fmt"
    "log"
    "net/smtp"
    "os"
    "strings"
)

func main() {
    smtpHost := os.Getenv("SMTP_HOST")
    smtpPort := os.Getenv("SMTP_PORT")
    smtpUser := os.Getenv("SMTP_USER")
    smtpPass := os.Getenv("SMTP_PASS")
    sender := os.Getenv("SMTP_SENDER")
    notifyTo := os.Getenv("SMTP_NOTIFY_TO")
    to := strings.Split(notifyTo, ",")

    subject := "Test Email from Go"
    body := "This is a test email from your Go backend."
    msg := "From: " + sender + "\n" +
        "To: " + to[0] + "\n" +
        "Subject: " + subject + "\n\n" +
        body

    // Print SMTP values before sending
    fmt.Println("SMTP_HOST:", smtpHost)
    fmt.Println("SMTP_PORT:", smtpPort)
    fmt.Println("SMTP_USER:", smtpUser)
    fmt.Println("SMTP_PASS:", smtpPass)
    fmt.Println("SMTP_SENDER:", sender)
    fmt.Println("SMTP_NOTIFY_TO:", to)

    auth := smtp.PlainAuth("", smtpUser, smtpPass, smtpHost)
    addr := smtpHost + ":" + smtpPort
    err := smtp.SendMail(addr, auth, sender, to, []byte(msg))
    if err != nil {
        log.Fatal("❌ Failed to send email:", err)
    } else {
        log.Println("✅ Test email sent!")
    }
}