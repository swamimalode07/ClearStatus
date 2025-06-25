package models

import "time"

type Incident struct {
	ID             string    `json:"id"`
	Title          string    `json:"title"`
	Status         string    `json:"status"`
	Time           time.Time `json:"time"`
	OrganizationID string    `json:"organizationId"`
}
