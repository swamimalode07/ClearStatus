CREATE TABLE IF NOT EXISTS service_status_history (
    id UUID PRIMARY KEY,
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    changed_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_service_status_history_service ON service_status_history (service_id);
CREATE INDEX IF NOT EXISTS idx_service_status_history_changed_at ON service_status_history (changed_at); 