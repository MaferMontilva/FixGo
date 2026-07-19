PRAGMA foreign_keys = ON;

-- FIXGO - ESQUEMA SQLITE V1
-- Proyecto nuevo: cliente, profesional, administración, IA, presupuestos y persistencia.

-- ============================================================
-- 1. SEGURIDAD, USUARIOS Y ACCESO
-- ============================================================
CREATE TABLE roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE,
  phone_country_code TEXT,
  phone_number TEXT,
  password_hash TEXT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  avatar_url TEXT,
  preferred_language TEXT NOT NULL DEFAULT 'es',
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('PENDING','ACTIVE','SUSPENDED','BLOCKED','DELETED')),
  email_verified_at TEXT,
  phone_verified_at TEXT,
  last_login_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TEXT,
  CHECK(email IS NOT NULL OR phone_number IS NOT NULL)
);
CREATE UNIQUE INDEX idx_users_phone_unique ON users(phone_country_code, phone_number) WHERE phone_number IS NOT NULL;

CREATE TABLE user_roles (
  user_id INTEGER NOT NULL,
  role_id INTEGER NOT NULL,
  assigned_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(user_id, role_id),
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(role_id) REFERENCES roles(id) ON DELETE RESTRICT
);

CREATE TABLE auth_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  refresh_token_hash TEXT NOT NULL UNIQUE,
  ip_address TEXT,
  user_agent TEXT,
  expires_at TEXT NOT NULL,
  revoked_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX idx_auth_sessions_user ON auth_sessions(user_id);
CREATE INDEX idx_auth_sessions_expires ON auth_sessions(expires_at);

CREATE TABLE otp_codes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  destination TEXT NOT NULL,
  channel TEXT NOT NULL CHECK(channel IN ('SMS','EMAIL')),
  purpose TEXT NOT NULL CHECK(purpose IN ('LOGIN','REGISTER','VERIFY_PHONE','VERIFY_EMAIL','PASSWORD_RESET')),
  code_hash TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  used_at TEXT,
  attempts INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX idx_otp_destination_purpose ON otp_codes(destination, purpose);

CREATE TABLE password_reset_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  used_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- 2. PERFILES
-- ============================================================
CREATE TABLE client_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  display_name TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE professional_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  business_name TEXT,
  tax_id TEXT,
  bio TEXT,
  years_experience INTEGER NOT NULL DEFAULT 0 CHECK(years_experience >= 0),
  profile_image_url TEXT,
  cover_image_url TEXT,
  website_url TEXT,
  is_verified INTEGER NOT NULL DEFAULT 0 CHECK(is_verified IN (0,1)),
  is_homologated INTEGER NOT NULL DEFAULT 0 CHECK(is_homologated IN (0,1)),
  verification_status TEXT NOT NULL DEFAULT 'PENDING' CHECK(verification_status IN ('PENDING','IN_REVIEW','APPROVED','REJECTED','SUSPENDED')),
  profile_status TEXT NOT NULL DEFAULT 'DRAFT' CHECK(profile_status IN ('DRAFT','ACTIVE','INACTIVE','SUSPENDED')),
  rating_average REAL NOT NULL DEFAULT 0 CHECK(rating_average BETWEEN 0 AND 5),
  ratings_count INTEGER NOT NULL DEFAULT 0 CHECK(ratings_count >= 0),
  response_time_minutes INTEGER,
  completed_jobs_count INTEGER NOT NULL DEFAULT 0 CHECK(completed_jobs_count >= 0),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE professional_documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  professional_id INTEGER NOT NULL,
  document_type TEXT NOT NULL CHECK(document_type IN ('IDENTITY','TAX','INSURANCE','CERTIFICATION','LICENSE','BACKGROUND','OTHER')),
  document_number TEXT,
  file_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING','APPROVED','REJECTED','EXPIRED')),
  expires_at TEXT,
  reviewed_by_user_id INTEGER,
  reviewed_at TEXT,
  rejection_reason TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(professional_id) REFERENCES professional_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY(reviewed_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX idx_prof_documents_prof ON professional_documents(professional_id);

CREATE TABLE professional_availability (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  professional_id INTEGER NOT NULL,
  weekday INTEGER NOT NULL CHECK(weekday BETWEEN 0 AND 6),
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  is_available INTEGER NOT NULL DEFAULT 1 CHECK(is_available IN (0,1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(professional_id, weekday, start_time, end_time),
  FOREIGN KEY(professional_id) REFERENCES professional_profiles(id) ON DELETE CASCADE
);

-- ============================================================
-- 3. UBICACIÓN
-- ============================================================
CREATE TABLE countries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  iso2 TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE regions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  country_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  code TEXT,
  UNIQUE(country_id, name),
  FOREIGN KEY(country_id) REFERENCES countries(id) ON DELETE CASCADE
);

CREATE TABLE cities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  region_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  postal_code_prefix TEXT,
  UNIQUE(region_id, name),
  FOREIGN KEY(region_id) REFERENCES regions(id) ON DELETE CASCADE
);

CREATE TABLE addresses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  label TEXT,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  postal_code TEXT,
  city_id INTEGER,
  city_text TEXT,
  region_text TEXT,
  country_text TEXT NOT NULL DEFAULT 'España',
  latitude REAL,
  longitude REAL,
  access_instructions TEXT,
  is_default INTEGER NOT NULL DEFAULT 0 CHECK(is_default IN (0,1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(city_id) REFERENCES cities(id) ON DELETE SET NULL
);
CREATE INDEX idx_addresses_user ON addresses(user_id);
CREATE INDEX idx_addresses_city ON addresses(city_id);

-- ============================================================
-- 4. CATÁLOGO DE CATEGORÍAS Y SERVICIOS
-- ============================================================
CREATE TABLE categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  parent_id INTEGER,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon_name TEXT,
  image_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1 CHECK(is_active IN (0,1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(parent_id) REFERENCES categories(id) ON DELETE SET NULL
);

CREATE TABLE services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  base_unit TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1 CHECK(is_active IN (0,1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE RESTRICT
);
CREATE INDEX idx_services_category ON services(category_id);

CREATE TABLE professional_categories (
  professional_id INTEGER NOT NULL,
  category_id INTEGER NOT NULL,
  is_primary INTEGER NOT NULL DEFAULT 0 CHECK(is_primary IN (0,1)),
  years_experience INTEGER NOT NULL DEFAULT 0 CHECK(years_experience >= 0),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(professional_id, category_id),
  FOREIGN KEY(professional_id) REFERENCES professional_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE RESTRICT
);

CREATE TABLE professional_service_areas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  professional_id INTEGER NOT NULL,
  city_id INTEGER,
  postal_code TEXT,
  radius_km REAL,
  is_active INTEGER NOT NULL DEFAULT 1 CHECK(is_active IN (0,1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK(city_id IS NOT NULL OR postal_code IS NOT NULL),
  FOREIGN KEY(professional_id) REFERENCES professional_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY(city_id) REFERENCES cities(id) ON DELETE CASCADE
);
CREATE INDEX idx_prof_service_area_prof ON professional_service_areas(professional_id);
CREATE INDEX idx_prof_service_area_city ON professional_service_areas(city_id);

CREATE TABLE favorite_professionals (
  client_user_id INTEGER NOT NULL,
  professional_id INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(client_user_id, professional_id),
  FOREIGN KEY(client_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(professional_id) REFERENCES professional_profiles(id) ON DELETE CASCADE
);

-- ============================================================
-- 5. SOLICITUDES DE SERVICIO
-- ============================================================
CREATE TABLE service_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_user_id INTEGER NOT NULL,
  category_id INTEGER,
  service_id INTEGER,
  address_id INTEGER,
  title TEXT,
  original_description TEXT NOT NULL,
  final_description TEXT,
  location_description TEXT,
  urgency TEXT NOT NULL DEFAULT 'NORMAL' CHECK(urgency IN ('LOW','NORMAL','HIGH','EMERGENCY')),
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK(status IN ('DRAFT','AI_PROCESSING','READY_TO_PUBLISH','PUBLISHED','RECEIVING_BUDGETS','PROFESSIONAL_SELECTED','IN_PROGRESS','COMPLETED','CANCELLED','EXPIRED')),
  preferred_date_from TEXT,
  preferred_date_to TEXT,
  flexible_schedule INTEGER NOT NULL DEFAULT 1 CHECK(flexible_schedule IN (0,1)),
  budget_min REAL CHECK(budget_min IS NULL OR budget_min >= 0),
  budget_max REAL CHECK(budget_max IS NULL OR budget_max >= 0),
  ai_assisted INTEGER NOT NULL DEFAULT 0 CHECK(ai_assisted IN (0,1)),
  allow_professional_questions INTEGER NOT NULL DEFAULT 1 CHECK(allow_professional_questions IN (0,1)),
  published_at TEXT,
  expires_at TEXT,
  cancelled_at TEXT,
  cancellation_reason TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TEXT,
  CHECK(budget_max IS NULL OR budget_min IS NULL OR budget_max >= budget_min),
  FOREIGN KEY(client_user_id) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE SET NULL,
  FOREIGN KEY(service_id) REFERENCES services(id) ON DELETE SET NULL,
  FOREIGN KEY(address_id) REFERENCES addresses(id) ON DELETE SET NULL
);
CREATE INDEX idx_requests_client ON service_requests(client_user_id);
CREATE INDEX idx_requests_status ON service_requests(status);
CREATE INDEX idx_requests_category ON service_requests(category_id);
CREATE INDEX idx_requests_published ON service_requests(published_at);

CREATE TABLE service_request_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  service_request_id INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  original_filename TEXT,
  mime_type TEXT,
  size_bytes INTEGER CHECK(size_bytes IS NULL OR size_bytes >= 0),
  caption TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  visible_to_ai INTEGER NOT NULL DEFAULT 1 CHECK(visible_to_ai IN (0,1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(service_request_id) REFERENCES service_requests(id) ON DELETE CASCADE
);
CREATE INDEX idx_request_images_request ON service_request_images(service_request_id);

CREATE TABLE request_status_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  service_request_id INTEGER NOT NULL,
  previous_status TEXT,
  new_status TEXT NOT NULL,
  changed_by_user_id INTEGER,
  note TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(service_request_id) REFERENCES service_requests(id) ON DELETE CASCADE,
  FOREIGN KEY(changed_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE request_professional_invitations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  service_request_id INTEGER NOT NULL,
  professional_id INTEGER NOT NULL,
  invited_by_user_id INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING','VIEWED','ACCEPTED','DECLINED','EXPIRED')),
  sent_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  responded_at TEXT,
  UNIQUE(service_request_id, professional_id),
  FOREIGN KEY(service_request_id) REFERENCES service_requests(id) ON DELETE CASCADE,
  FOREIGN KEY(professional_id) REFERENCES professional_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY(invited_by_user_id) REFERENCES users(id) ON DELETE RESTRICT
);

-- ============================================================
-- 6. INTELIGENCIA ARTIFICIAL
-- ============================================================
CREATE TABLE ai_assistant_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  service_request_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'OPEN' CHECK(status IN ('OPEN','COMPLETED','CANCELLED','ERROR')),
  started_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at TEXT,
  FOREIGN KEY(service_request_id) REFERENCES service_requests(id) ON DELETE CASCADE,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE ai_assistant_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('SYSTEM','USER','ASSISTANT')),
  content TEXT NOT NULL,
  metadata_json TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(session_id) REFERENCES ai_assistant_sessions(id) ON DELETE CASCADE
);
CREATE INDEX idx_ai_messages_session ON ai_assistant_messages(session_id);

CREATE TABLE ai_analyses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  service_request_id INTEGER NOT NULL,
  session_id INTEGER,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  prompt_version TEXT,
  input_text TEXT NOT NULL,
  suggested_title TEXT,
  suggested_description TEXT,
  suggested_category_id INTEGER,
  suggested_service_id INTEGER,
  suggested_urgency TEXT CHECK(suggested_urgency IS NULL OR suggested_urgency IN ('LOW','NORMAL','HIGH','EMERGENCY')),
  suggested_difficulty TEXT CHECK(suggested_difficulty IS NULL OR suggested_difficulty IN ('LOW','MEDIUM','HIGH','SPECIALIST')),
  suggested_tools_json TEXT,
  suggested_materials_json TEXT,
  safety_notes TEXT,
  confidence_score REAL CHECK(confidence_score IS NULL OR confidence_score BETWEEN 0 AND 1),
  raw_request_json TEXT,
  raw_response_json TEXT,
  processing_time_ms INTEGER CHECK(processing_time_ms IS NULL OR processing_time_ms >= 0),
  status TEXT NOT NULL DEFAULT 'COMPLETED' CHECK(status IN ('PENDING','COMPLETED','FAILED','PARTIAL')),
  error_message TEXT,
  accepted_by_user INTEGER NOT NULL DEFAULT 0 CHECK(accepted_by_user IN (0,1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(service_request_id) REFERENCES service_requests(id) ON DELETE CASCADE,
  FOREIGN KEY(session_id) REFERENCES ai_assistant_sessions(id) ON DELETE SET NULL,
  FOREIGN KEY(suggested_category_id) REFERENCES categories(id) ON DELETE SET NULL,
  FOREIGN KEY(suggested_service_id) REFERENCES services(id) ON DELETE SET NULL
);
CREATE INDEX idx_ai_analyses_request ON ai_analyses(service_request_id);

CREATE TABLE ai_analysis_questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  analysis_id INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  answer_type TEXT NOT NULL DEFAULT 'TEXT' CHECK(answer_type IN ('TEXT','NUMBER','BOOLEAN','SINGLE_CHOICE','MULTIPLE_CHOICE','DATE','IMAGE')),
  options_json TEXT,
  is_required INTEGER NOT NULL DEFAULT 0 CHECK(is_required IN (0,1)),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(analysis_id) REFERENCES ai_analyses(id) ON DELETE CASCADE
);

CREATE TABLE ai_analysis_answers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  answer_text TEXT,
  answer_json TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(question_id, user_id),
  FOREIGN KEY(question_id) REFERENCES ai_analysis_questions(id) ON DELETE CASCADE,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- 7. PRESUPUESTOS Y CONTRATACIÓN
-- ============================================================
CREATE TABLE budgets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  service_request_id INTEGER NOT NULL,
  professional_id INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK(status IN ('DRAFT','SENT','VIEWED','ACCEPTED','REJECTED','WITHDRAWN','EXPIRED')),
  currency TEXT NOT NULL DEFAULT 'EUR',
  subtotal REAL NOT NULL DEFAULT 0 CHECK(subtotal >= 0),
  taxes REAL NOT NULL DEFAULT 0 CHECK(taxes >= 0),
  platform_fee REAL NOT NULL DEFAULT 0 CHECK(platform_fee >= 0),
  total_price REAL NOT NULL CHECK(total_price >= 0),
  estimated_duration_value INTEGER CHECK(estimated_duration_value IS NULL OR estimated_duration_value >= 0),
  estimated_duration_unit TEXT CHECK(estimated_duration_unit IS NULL OR estimated_duration_unit IN ('HOURS','DAYS','WEEKS')),
  available_from TEXT,
  valid_until TEXT,
  observations TEXT,
  sent_at TEXT,
  viewed_at TEXT,
  accepted_at TEXT,
  rejected_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(service_request_id, professional_id),
  FOREIGN KEY(service_request_id) REFERENCES service_requests(id) ON DELETE CASCADE,
  FOREIGN KEY(professional_id) REFERENCES professional_profiles(id) ON DELETE CASCADE
);
CREATE INDEX idx_budgets_request ON budgets(service_request_id);
CREATE INDEX idx_budgets_professional ON budgets(professional_id);
CREATE INDEX idx_budgets_status ON budgets(status);

CREATE TABLE budget_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  budget_id INTEGER NOT NULL,
  item_type TEXT NOT NULL DEFAULT 'SERVICE' CHECK(item_type IN ('LABOR','MATERIAL','TRANSPORT','SERVICE','DISCOUNT','OTHER')),
  description TEXT NOT NULL,
  quantity REAL NOT NULL DEFAULT 1 CHECK(quantity > 0),
  unit_price REAL NOT NULL DEFAULT 0,
  total REAL NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(budget_id) REFERENCES budgets(id) ON DELETE CASCADE
);

CREATE TABLE budget_attachments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  budget_id INTEGER NOT NULL,
  file_url TEXT NOT NULL,
  original_filename TEXT,
  mime_type TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(budget_id) REFERENCES budgets(id) ON DELETE CASCADE
);

CREATE TABLE service_orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  service_request_id INTEGER NOT NULL UNIQUE,
  accepted_budget_id INTEGER NOT NULL UNIQUE,
  client_user_id INTEGER NOT NULL,
  professional_id INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING_START' CHECK(status IN ('PENDING_START','SCHEDULED','PROFESSIONAL_EN_ROUTE','IN_PROGRESS','PAUSED','AWAITING_CLIENT_CONFIRMATION','COMPLETED','CANCELLED')),
  scheduled_start_at TEXT,
  started_at TEXT,
  completed_at TEXT,
  client_confirmation_code_hash TEXT,
  professional_confirmation_code_hash TEXT,
  cancellation_reason TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(service_request_id) REFERENCES service_requests(id) ON DELETE RESTRICT,
  FOREIGN KEY(accepted_budget_id) REFERENCES budgets(id) ON DELETE RESTRICT,
  FOREIGN KEY(client_user_id) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY(professional_id) REFERENCES professional_profiles(id) ON DELETE RESTRICT
);
CREATE INDEX idx_orders_status ON service_orders(status);
CREATE INDEX idx_orders_professional ON service_orders(professional_id);

CREATE TABLE service_status_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  service_order_id INTEGER NOT NULL,
  previous_status TEXT,
  new_status TEXT NOT NULL,
  changed_by_user_id INTEGER,
  note TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(service_order_id) REFERENCES service_orders(id) ON DELETE CASCADE,
  FOREIGN KEY(changed_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================
-- 8. COMUNICACIÓN
-- ============================================================
CREATE TABLE conversations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  service_request_id INTEGER,
  budget_id INTEGER,
  service_order_id INTEGER,
  type TEXT NOT NULL DEFAULT 'REQUEST' CHECK(type IN ('REQUEST','BUDGET','SERVICE','SUPPORT')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(service_request_id) REFERENCES service_requests(id) ON DELETE CASCADE,
  FOREIGN KEY(budget_id) REFERENCES budgets(id) ON DELETE CASCADE,
  FOREIGN KEY(service_order_id) REFERENCES service_orders(id) ON DELETE CASCADE
);

CREATE TABLE conversation_participants (
  conversation_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  joined_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  left_at TEXT,
  last_read_at TEXT,
  PRIMARY KEY(conversation_id, user_id),
  FOREIGN KEY(conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id INTEGER NOT NULL,
  sender_user_id INTEGER NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'TEXT' CHECK(message_type IN ('TEXT','IMAGE','FILE','SYSTEM')),
  content TEXT,
  sent_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  edited_at TEXT,
  deleted_at TEXT,
  FOREIGN KEY(conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  FOREIGN KEY(sender_user_id) REFERENCES users(id) ON DELETE RESTRICT
);
CREATE INDEX idx_messages_conversation_sent ON messages(conversation_id, sent_at);

CREATE TABLE message_attachments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  message_id INTEGER NOT NULL,
  file_url TEXT NOT NULL,
  original_filename TEXT,
  mime_type TEXT,
  size_bytes INTEGER,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(message_id) REFERENCES messages(id) ON DELETE CASCADE
);

-- ============================================================
-- 9. VALORACIONES, NOTIFICACIONES, LEGAL Y ADMINISTRACIÓN
-- ============================================================
CREATE TABLE reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  service_order_id INTEGER NOT NULL,
  author_user_id INTEGER NOT NULL,
  professional_id INTEGER NOT NULL,
  rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
  title TEXT,
  comment TEXT,
  professional_reply TEXT,
  professional_replied_at TEXT,
  status TEXT NOT NULL DEFAULT 'PUBLISHED' CHECK(status IN ('PENDING','PUBLISHED','HIDDEN','REPORTED')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(service_order_id, author_user_id),
  FOREIGN KEY(service_order_id) REFERENCES service_orders(id) ON DELETE CASCADE,
  FOREIGN KEY(author_user_id) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY(professional_id) REFERENCES professional_profiles(id) ON DELETE CASCADE
);
CREATE INDEX idx_reviews_professional ON reviews(professional_id);

CREATE TABLE notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data_json TEXT,
  channel TEXT NOT NULL DEFAULT 'IN_APP' CHECK(channel IN ('IN_APP','EMAIL','SMS')),
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING','SENT','READ','FAILED')),
  sent_at TEXT,
  read_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX idx_notifications_user_status ON notifications(user_id, status);

CREATE TABLE legal_documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  document_type TEXT NOT NULL CHECK(document_type IN ('TERMS','PRIVACY','COOKIES')),
  version TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  published_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_active INTEGER NOT NULL DEFAULT 1 CHECK(is_active IN (0,1)),
  UNIQUE(document_type, version)
);

CREATE TABLE user_legal_acceptances (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  legal_document_id INTEGER NOT NULL,
  ip_address TEXT,
  accepted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, legal_document_id),
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(legal_document_id) REFERENCES legal_documents(id) ON DELETE RESTRICT
);

CREATE TABLE audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  actor_user_id INTEGER,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  old_values_json TEXT,
  new_values_json TEXT,
  ip_address TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(actor_user_id) REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_actor ON audit_logs(actor_user_id);

CREATE TABLE site_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT,
  value_type TEXT NOT NULL DEFAULT 'STRING' CHECK(value_type IN ('STRING','NUMBER','BOOLEAN','JSON')),
  is_public INTEGER NOT NULL DEFAULT 0 CHECK(is_public IN (0,1)),
  description TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 10. TRIGGERS DE FECHA DE ACTUALIZACIÓN
-- ============================================================
CREATE TRIGGER trg_users_updated_at AFTER UPDATE ON users FOR EACH ROW WHEN NEW.updated_at = OLD.updated_at BEGIN UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id; END;
CREATE TRIGGER trg_clients_updated_at AFTER UPDATE ON client_profiles FOR EACH ROW WHEN NEW.updated_at = OLD.updated_at BEGIN UPDATE client_profiles SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id; END;
CREATE TRIGGER trg_professionals_updated_at AFTER UPDATE ON professional_profiles FOR EACH ROW WHEN NEW.updated_at = OLD.updated_at BEGIN UPDATE professional_profiles SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id; END;
CREATE TRIGGER trg_addresses_updated_at AFTER UPDATE ON addresses FOR EACH ROW WHEN NEW.updated_at = OLD.updated_at BEGIN UPDATE addresses SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id; END;
CREATE TRIGGER trg_categories_updated_at AFTER UPDATE ON categories FOR EACH ROW WHEN NEW.updated_at = OLD.updated_at BEGIN UPDATE categories SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id; END;
CREATE TRIGGER trg_services_updated_at AFTER UPDATE ON services FOR EACH ROW WHEN NEW.updated_at = OLD.updated_at BEGIN UPDATE services SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id; END;
CREATE TRIGGER trg_requests_updated_at AFTER UPDATE ON service_requests FOR EACH ROW WHEN NEW.updated_at = OLD.updated_at BEGIN UPDATE service_requests SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id; END;
CREATE TRIGGER trg_ai_answers_updated_at AFTER UPDATE ON ai_analysis_answers FOR EACH ROW WHEN NEW.updated_at = OLD.updated_at BEGIN UPDATE ai_analysis_answers SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id; END;
CREATE TRIGGER trg_budgets_updated_at AFTER UPDATE ON budgets FOR EACH ROW WHEN NEW.updated_at = OLD.updated_at BEGIN UPDATE budgets SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id; END;
CREATE TRIGGER trg_orders_updated_at AFTER UPDATE ON service_orders FOR EACH ROW WHEN NEW.updated_at = OLD.updated_at BEGIN UPDATE service_orders SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id; END;
CREATE TRIGGER trg_conversations_updated_at AFTER UPDATE ON conversations FOR EACH ROW WHEN NEW.updated_at = OLD.updated_at BEGIN UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id; END;
CREATE TRIGGER trg_reviews_updated_at AFTER UPDATE ON reviews FOR EACH ROW WHEN NEW.updated_at = OLD.updated_at BEGIN UPDATE reviews SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id; END;
CREATE TRIGGER trg_settings_updated_at AFTER UPDATE ON site_settings FOR EACH ROW WHEN NEW.updated_at = OLD.updated_at BEGIN UPDATE site_settings SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id; END;
