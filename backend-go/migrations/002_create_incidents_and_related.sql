-- 002_create_incidents_and_related.sql

CREATE TABLE IF NOT EXISTS incidents (
    id UUID PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('incident', 'maintenance')),
    status TEXT NOT NULL CHECK (status IN ('Investigating', 'Identified', 'Monitoring', 'Resolved', 'Scheduled', 'In Progress', 'Completed')),
    is_resolved BOOLEAN NOT NULL DEFAULT false,
    organization_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS incident_services (
    incident_id UUID REFERENCES incidents(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    PRIMARY KEY (incident_id, service_id)
);

CREATE TABLE IF NOT EXISTS incident_updates (
    id UUID PRIMARY KEY,
    incident_id UUID REFERENCES incidents(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_incidents_org ON incidents (organization_id);
CREATE INDEX IF NOT EXISTS idx_incident_services_incident ON incident_services (incident_id);
CREATE INDEX IF NOT EXISTS idx_incident_services_service ON incident_services (service_id);

     ALTER TABLE incidents ADD COLUMN IF NOT EXISTS is_resolved BOOLEAN NOT NULL DEFAULT FALSE;