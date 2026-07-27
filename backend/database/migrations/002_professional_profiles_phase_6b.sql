PRAGMA foreign_keys = OFF;

ALTER TABLE professional_profiles ADD COLUMN phone TEXT;
ALTER TABLE professional_profiles ADD COLUMN province TEXT;
ALTER TABLE professional_profiles ADD COLUMN municipality TEXT;
ALTER TABLE professional_profiles ADD COLUMN postal_code TEXT;
ALTER TABLE professional_profiles ADD COLUMN reference_address TEXT;
ALTER TABLE professional_profiles ADD COLUMN work_radius INTEGER;
ALTER TABLE professional_profiles ADD COLUMN availability TEXT;

CREATE TABLE IF NOT EXISTS professional_services (
  professional_id INTEGER NOT NULL,
  service_id INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(professional_id, service_id),
  FOREIGN KEY(professional_id) REFERENCES professional_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY(service_id) REFERENCES services(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_professional_services_service ON professional_services(service_id);

PRAGMA foreign_keys = ON;
