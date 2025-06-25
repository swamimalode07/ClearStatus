package models

import "time"

type Incident struct {
	ID             string    `json:"id"`
	Title          string    `json:"title"`
	Description    string    `json:"description"`
	Type           string    `json:"type"`
	Status         string    `json:"status"`
	IsResolved     bool      `json:"isResolved"`
	OrganizationID string    `json:"organizationId"`
	CreatedAt      time.Time `json:"createdAt"`
	UpdatedAt      time.Time `json:"updatedAt"`
	Services       []Service `json:"services,omitempty"`
	Updates        []IncidentUpdate `json:"updates,omitempty"`
}

type IncidentService struct {
	IncidentID string `json:"incidentId"`
	ServiceID  string `json:"serviceId"`
}

type IncidentUpdate struct {
	ID         string    `json:"id"`
	IncidentID string    `json:"incidentId"`
	Message    string    `json:"message"`
	CreatedAt  time.Time `json:"createdAt"`
}
