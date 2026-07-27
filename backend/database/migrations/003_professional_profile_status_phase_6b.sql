PRAGMA foreign_keys = OFF;

DROP TRIGGER IF EXISTS trg_professionals_updated_at;

ALTER TABLE professional_profiles RENAME TO professional_profiles_old_phase_6b;

CREATE TABLE professional_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  business_name TEXT,
  phone TEXT,
  tax_id TEXT,
  bio TEXT,
  years_experience INTEGER NOT NULL DEFAULT 0 CHECK(years_experience >= 0),
  province TEXT,
  municipality TEXT,
  postal_code TEXT,
  reference_address TEXT,
  work_radius INTEGER,
  availability TEXT,
  profile_image_url TEXT,
  cover_image_url TEXT,
  website_url TEXT,
  is_verified INTEGER NOT NULL DEFAULT 0 CHECK(is_verified IN (0,1)),
  is_homologated INTEGER NOT NULL DEFAULT 0 CHECK(is_homologated IN (0,1)),
  verification_status TEXT NOT NULL DEFAULT 'PENDING' CHECK(verification_status IN ('PENDING','IN_REVIEW','APPROVED','REJECTED','SUSPENDED')),
  profile_status TEXT NOT NULL DEFAULT 'INCOMPLETE' CHECK(profile_status IN ('INCOMPLETE','ACTIVE','SUSPENDED')),
  rating_average REAL NOT NULL DEFAULT 0 CHECK(rating_average BETWEEN 0 AND 5),
  ratings_count INTEGER NOT NULL DEFAULT 0 CHECK(ratings_count >= 0),
  response_time_minutes INTEGER,
  completed_jobs_count INTEGER NOT NULL DEFAULT 0 CHECK(completed_jobs_count >= 0),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT INTO professional_profiles (
  id,
  user_id,
  slug,
  display_name,
  business_name,
  phone,
  tax_id,
  bio,
  years_experience,
  province,
  municipality,
  postal_code,
  reference_address,
  work_radius,
  availability,
  profile_image_url,
  cover_image_url,
  website_url,
  is_verified,
  is_homologated,
  verification_status,
  profile_status,
  rating_average,
  ratings_count,
  response_time_minutes,
  completed_jobs_count,
  created_at,
  updated_at
)
SELECT
  id,
  user_id,
  slug,
  display_name,
  business_name,
  phone,
  tax_id,
  bio,
  years_experience,
  province,
  municipality,
  postal_code,
  reference_address,
  work_radius,
  availability,
  profile_image_url,
  cover_image_url,
  website_url,
  is_verified,
  is_homologated,
  verification_status,
  CASE
    WHEN profile_status = 'ACTIVE' THEN 'ACTIVE'
    WHEN profile_status = 'SUSPENDED' THEN 'SUSPENDED'
    ELSE 'INCOMPLETE'
  END,
  rating_average,
  ratings_count,
  response_time_minutes,
  completed_jobs_count,
  created_at,
  updated_at
FROM professional_profiles_old_phase_6b;

DROP TABLE professional_profiles_old_phase_6b;

CREATE TRIGGER trg_professionals_updated_at AFTER UPDATE ON professional_profiles FOR EACH ROW WHEN NEW.updated_at = OLD.updated_at BEGIN UPDATE professional_profiles SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id; END;

PRAGMA foreign_keys = ON;
