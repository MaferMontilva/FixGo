# Diccionario de datos — FixGo v1

Base de datos: SQLite  |  Tablas: 43

Este modelo cubre autenticación, clientes, profesionales, ubicación, categorías, solicitudes, IA, presupuestos, contratación, mensajería, valoraciones, notificaciones, legal y auditoría.

## `addresses`

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `id` | INTEGER | No | PK | — |
| `user_id` | INTEGER | Sí | FK | — |
| `label` | TEXT | No |  | — |
| `address_line1` | TEXT | Sí |  | — |
| `address_line2` | TEXT | No |  | — |
| `postal_code` | TEXT | No |  | — |
| `city_id` | INTEGER | No | FK | — |
| `city_text` | TEXT | No |  | — |
| `region_text` | TEXT | No |  | — |
| `country_text` | TEXT | Sí |  | 'España' |
| `latitude` | REAL | No |  | — |
| `longitude` | REAL | No |  | — |
| `access_instructions` | TEXT | No |  | — |
| `is_default` | INTEGER | Sí |  | 0 |
| `created_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |
| `updated_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |

**Relaciones:**
- `city_id` → `cities.id`; al eliminar: **SET NULL**.
- `user_id` → `users.id`; al eliminar: **CASCADE**.

## `ai_analyses`

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `id` | INTEGER | No | PK | — |
| `service_request_id` | INTEGER | Sí | FK | — |
| `session_id` | INTEGER | No | FK | — |
| `provider` | TEXT | Sí |  | — |
| `model` | TEXT | Sí |  | — |
| `prompt_version` | TEXT | No |  | — |
| `input_text` | TEXT | Sí |  | — |
| `suggested_title` | TEXT | No |  | — |
| `suggested_description` | TEXT | No |  | — |
| `suggested_category_id` | INTEGER | No | FK | — |
| `suggested_service_id` | INTEGER | No | FK | — |
| `suggested_urgency` | TEXT | No |  | — |
| `suggested_difficulty` | TEXT | No |  | — |
| `suggested_tools_json` | TEXT | No |  | — |
| `suggested_materials_json` | TEXT | No |  | — |
| `safety_notes` | TEXT | No |  | — |
| `confidence_score` | REAL | No |  | — |
| `raw_request_json` | TEXT | No |  | — |
| `raw_response_json` | TEXT | No |  | — |
| `processing_time_ms` | INTEGER | No |  | — |
| `status` | TEXT | Sí |  | 'COMPLETED' |
| `error_message` | TEXT | No |  | — |
| `accepted_by_user` | INTEGER | Sí |  | 0 |
| `created_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |

**Relaciones:**
- `suggested_service_id` → `services.id`; al eliminar: **SET NULL**.
- `suggested_category_id` → `categories.id`; al eliminar: **SET NULL**.
- `session_id` → `ai_assistant_sessions.id`; al eliminar: **SET NULL**.
- `service_request_id` → `service_requests.id`; al eliminar: **CASCADE**.

## `ai_analysis_answers`

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `id` | INTEGER | No | PK | — |
| `question_id` | INTEGER | Sí | FK | — |
| `user_id` | INTEGER | Sí | FK | — |
| `answer_text` | TEXT | No |  | — |
| `answer_json` | TEXT | No |  | — |
| `created_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |
| `updated_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |

**Relaciones:**
- `user_id` → `users.id`; al eliminar: **CASCADE**.
- `question_id` → `ai_analysis_questions.id`; al eliminar: **CASCADE**.

## `ai_analysis_questions`

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `id` | INTEGER | No | PK | — |
| `analysis_id` | INTEGER | Sí | FK | — |
| `question_text` | TEXT | Sí |  | — |
| `answer_type` | TEXT | Sí |  | 'TEXT' |
| `options_json` | TEXT | No |  | — |
| `is_required` | INTEGER | Sí |  | 0 |
| `sort_order` | INTEGER | Sí |  | 0 |
| `created_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |

**Relaciones:**
- `analysis_id` → `ai_analyses.id`; al eliminar: **CASCADE**.

## `ai_assistant_messages`

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `id` | INTEGER | No | PK | — |
| `session_id` | INTEGER | Sí | FK | — |
| `role` | TEXT | Sí |  | — |
| `content` | TEXT | Sí |  | — |
| `metadata_json` | TEXT | No |  | — |
| `created_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |

**Relaciones:**
- `session_id` → `ai_assistant_sessions.id`; al eliminar: **CASCADE**.

## `ai_assistant_sessions`

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `id` | INTEGER | No | PK | — |
| `service_request_id` | INTEGER | Sí | FK | — |
| `user_id` | INTEGER | Sí | FK | — |
| `status` | TEXT | Sí |  | 'OPEN' |
| `started_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |
| `completed_at` | TEXT | No |  | — |

**Relaciones:**
- `user_id` → `users.id`; al eliminar: **CASCADE**.
- `service_request_id` → `service_requests.id`; al eliminar: **CASCADE**.

## `audit_logs`

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `id` | INTEGER | No | PK | — |
| `actor_user_id` | INTEGER | No | FK | — |
| `action` | TEXT | Sí |  | — |
| `entity_type` | TEXT | Sí |  | — |
| `entity_id` | TEXT | No |  | — |
| `old_values_json` | TEXT | No |  | — |
| `new_values_json` | TEXT | No |  | — |
| `ip_address` | TEXT | No |  | — |
| `created_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |

**Relaciones:**
- `actor_user_id` → `users.id`; al eliminar: **SET NULL**.

## `auth_sessions`

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `id` | INTEGER | No | PK | — |
| `user_id` | INTEGER | Sí | FK | — |
| `refresh_token_hash` | TEXT | Sí |  | — |
| `ip_address` | TEXT | No |  | — |
| `user_agent` | TEXT | No |  | — |
| `expires_at` | TEXT | Sí |  | — |
| `revoked_at` | TEXT | No |  | — |
| `created_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |

**Relaciones:**
- `user_id` → `users.id`; al eliminar: **CASCADE**.

## `budget_attachments`

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `id` | INTEGER | No | PK | — |
| `budget_id` | INTEGER | Sí | FK | — |
| `file_url` | TEXT | Sí |  | — |
| `original_filename` | TEXT | No |  | — |
| `mime_type` | TEXT | No |  | — |
| `created_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |

**Relaciones:**
- `budget_id` → `budgets.id`; al eliminar: **CASCADE**.

## `budget_items`

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `id` | INTEGER | No | PK | — |
| `budget_id` | INTEGER | Sí | FK | — |
| `item_type` | TEXT | Sí |  | 'SERVICE' |
| `description` | TEXT | Sí |  | — |
| `quantity` | REAL | Sí |  | 1 |
| `unit_price` | REAL | Sí |  | 0 |
| `total` | REAL | Sí |  | 0 |
| `sort_order` | INTEGER | Sí |  | 0 |
| `created_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |

**Relaciones:**
- `budget_id` → `budgets.id`; al eliminar: **CASCADE**.

## `budgets`

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `id` | INTEGER | No | PK | — |
| `service_request_id` | INTEGER | Sí | FK | — |
| `professional_id` | INTEGER | Sí | FK | — |
| `status` | TEXT | Sí |  | 'DRAFT' |
| `currency` | TEXT | Sí |  | 'EUR' |
| `subtotal` | REAL | Sí |  | 0 |
| `taxes` | REAL | Sí |  | 0 |
| `platform_fee` | REAL | Sí |  | 0 |
| `total_price` | REAL | Sí |  | — |
| `estimated_duration_value` | INTEGER | No |  | — |
| `estimated_duration_unit` | TEXT | No |  | — |
| `available_from` | TEXT | No |  | — |
| `valid_until` | TEXT | No |  | — |
| `observations` | TEXT | No |  | — |
| `sent_at` | TEXT | No |  | — |
| `viewed_at` | TEXT | No |  | — |
| `accepted_at` | TEXT | No |  | — |
| `rejected_at` | TEXT | No |  | — |
| `created_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |
| `updated_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |

**Relaciones:**
- `professional_id` → `professional_profiles.id`; al eliminar: **CASCADE**.
- `service_request_id` → `service_requests.id`; al eliminar: **CASCADE**.

## `categories`

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `id` | INTEGER | No | PK | — |
| `parent_id` | INTEGER | No | FK | — |
| `code` | TEXT | Sí |  | — |
| `name` | TEXT | Sí |  | — |
| `slug` | TEXT | Sí |  | — |
| `description` | TEXT | No |  | — |
| `icon_name` | TEXT | No |  | — |
| `image_url` | TEXT | No |  | — |
| `sort_order` | INTEGER | Sí |  | 0 |
| `is_active` | INTEGER | Sí |  | 1 |
| `created_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |
| `updated_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |

**Relaciones:**
- `parent_id` → `categories.id`; al eliminar: **SET NULL**.

## `cities`

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `id` | INTEGER | No | PK | — |
| `region_id` | INTEGER | Sí | FK | — |
| `name` | TEXT | Sí |  | — |
| `postal_code_prefix` | TEXT | No |  | — |

**Relaciones:**
- `region_id` → `regions.id`; al eliminar: **CASCADE**.

## `client_profiles`

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `id` | INTEGER | No | PK | — |
| `user_id` | INTEGER | Sí | FK | — |
| `display_name` | TEXT | No |  | — |
| `notes` | TEXT | No |  | — |
| `created_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |
| `updated_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |

**Relaciones:**
- `user_id` → `users.id`; al eliminar: **CASCADE**.

## `conversation_participants`

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `conversation_id` | INTEGER | Sí | PK / FK | — |
| `user_id` | INTEGER | Sí | PK / FK | — |
| `joined_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |
| `left_at` | TEXT | No |  | — |
| `last_read_at` | TEXT | No |  | — |

**Relaciones:**
- `user_id` → `users.id`; al eliminar: **CASCADE**.
- `conversation_id` → `conversations.id`; al eliminar: **CASCADE**.

## `conversations`

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `id` | INTEGER | No | PK | — |
| `service_request_id` | INTEGER | No | FK | — |
| `budget_id` | INTEGER | No | FK | — |
| `service_order_id` | INTEGER | No | FK | — |
| `type` | TEXT | Sí |  | 'REQUEST' |
| `created_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |
| `updated_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |

**Relaciones:**
- `service_order_id` → `service_orders.id`; al eliminar: **CASCADE**.
- `budget_id` → `budgets.id`; al eliminar: **CASCADE**.
- `service_request_id` → `service_requests.id`; al eliminar: **CASCADE**.

## `countries`

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `id` | INTEGER | No | PK | — |
| `iso2` | TEXT | Sí |  | — |
| `name` | TEXT | Sí |  | — |

## `favorite_professionals`

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `client_user_id` | INTEGER | Sí | PK / FK | — |
| `professional_id` | INTEGER | Sí | PK / FK | — |
| `created_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |

**Relaciones:**
- `professional_id` → `professional_profiles.id`; al eliminar: **CASCADE**.
- `client_user_id` → `users.id`; al eliminar: **CASCADE**.

## `legal_documents`

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `id` | INTEGER | No | PK | — |
| `document_type` | TEXT | Sí |  | — |
| `version` | TEXT | Sí |  | — |
| `title` | TEXT | Sí |  | — |
| `content` | TEXT | Sí |  | — |
| `published_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |
| `is_active` | INTEGER | Sí |  | 1 |

## `message_attachments`

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `id` | INTEGER | No | PK | — |
| `message_id` | INTEGER | Sí | FK | — |
| `file_url` | TEXT | Sí |  | — |
| `original_filename` | TEXT | No |  | — |
| `mime_type` | TEXT | No |  | — |
| `size_bytes` | INTEGER | No |  | — |
| `created_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |

**Relaciones:**
- `message_id` → `messages.id`; al eliminar: **CASCADE**.

## `messages`

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `id` | INTEGER | No | PK | — |
| `conversation_id` | INTEGER | Sí | FK | — |
| `sender_user_id` | INTEGER | Sí | FK | — |
| `message_type` | TEXT | Sí |  | 'TEXT' |
| `content` | TEXT | No |  | — |
| `sent_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |
| `edited_at` | TEXT | No |  | — |
| `deleted_at` | TEXT | No |  | — |

**Relaciones:**
- `sender_user_id` → `users.id`; al eliminar: **RESTRICT**.
- `conversation_id` → `conversations.id`; al eliminar: **CASCADE**.

## `notifications`

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `id` | INTEGER | No | PK | — |
| `user_id` | INTEGER | Sí | FK | — |
| `type` | TEXT | Sí |  | — |
| `title` | TEXT | Sí |  | — |
| `body` | TEXT | Sí |  | — |
| `data_json` | TEXT | No |  | — |
| `channel` | TEXT | Sí |  | 'IN_APP' |
| `status` | TEXT | Sí |  | 'PENDING' |
| `sent_at` | TEXT | No |  | — |
| `read_at` | TEXT | No |  | — |
| `created_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |

**Relaciones:**
- `user_id` → `users.id`; al eliminar: **CASCADE**.

## `otp_codes`

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `id` | INTEGER | No | PK | — |
| `user_id` | INTEGER | No | FK | — |
| `destination` | TEXT | Sí |  | — |
| `channel` | TEXT | Sí |  | — |
| `purpose` | TEXT | Sí |  | — |
| `code_hash` | TEXT | Sí |  | — |
| `expires_at` | TEXT | Sí |  | — |
| `used_at` | TEXT | No |  | — |
| `attempts` | INTEGER | Sí |  | 0 |
| `created_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |

**Relaciones:**
- `user_id` → `users.id`; al eliminar: **CASCADE**.

## `password_reset_tokens`

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `id` | INTEGER | No | PK | — |
| `user_id` | INTEGER | Sí | FK | — |
| `token_hash` | TEXT | Sí |  | — |
| `expires_at` | TEXT | Sí |  | — |
| `used_at` | TEXT | No |  | — |
| `created_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |

**Relaciones:**
- `user_id` → `users.id`; al eliminar: **CASCADE**.

## `professional_availability`

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `id` | INTEGER | No | PK | — |
| `professional_id` | INTEGER | Sí | FK | — |
| `weekday` | INTEGER | Sí |  | — |
| `start_time` | TEXT | Sí |  | — |
| `end_time` | TEXT | Sí |  | — |
| `is_available` | INTEGER | Sí |  | 1 |
| `created_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |

**Relaciones:**
- `professional_id` → `professional_profiles.id`; al eliminar: **CASCADE**.

## `professional_categories`

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `professional_id` | INTEGER | Sí | PK / FK | — |
| `category_id` | INTEGER | Sí | PK / FK | — |
| `is_primary` | INTEGER | Sí |  | 0 |
| `years_experience` | INTEGER | Sí |  | 0 |
| `created_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |

**Relaciones:**
- `category_id` → `categories.id`; al eliminar: **RESTRICT**.
- `professional_id` → `professional_profiles.id`; al eliminar: **CASCADE**.

## `professional_documents`

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `id` | INTEGER | No | PK | — |
| `professional_id` | INTEGER | Sí | FK | — |
| `document_type` | TEXT | Sí |  | — |
| `document_number` | TEXT | No |  | — |
| `file_url` | TEXT | Sí |  | — |
| `status` | TEXT | Sí |  | 'PENDING' |
| `expires_at` | TEXT | No |  | — |
| `reviewed_by_user_id` | INTEGER | No | FK | — |
| `reviewed_at` | TEXT | No |  | — |
| `rejection_reason` | TEXT | No |  | — |
| `created_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |

**Relaciones:**
- `reviewed_by_user_id` → `users.id`; al eliminar: **SET NULL**.
- `professional_id` → `professional_profiles.id`; al eliminar: **CASCADE**.

## `professional_profiles`

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `id` | INTEGER | No | PK | — |
| `user_id` | INTEGER | Sí | FK | — |
| `slug` | TEXT | Sí |  | — |
| `display_name` | TEXT | Sí |  | — |
| `business_name` | TEXT | No |  | — |
| `tax_id` | TEXT | No |  | — |
| `bio` | TEXT | No |  | — |
| `years_experience` | INTEGER | Sí |  | 0 |
| `profile_image_url` | TEXT | No |  | — |
| `cover_image_url` | TEXT | No |  | — |
| `website_url` | TEXT | No |  | — |
| `is_verified` | INTEGER | Sí |  | 0 |
| `is_homologated` | INTEGER | Sí |  | 0 |
| `verification_status` | TEXT | Sí |  | 'PENDING' |
| `profile_status` | TEXT | Sí |  | 'DRAFT' |
| `rating_average` | REAL | Sí |  | 0 |
| `ratings_count` | INTEGER | Sí |  | 0 |
| `response_time_minutes` | INTEGER | No |  | — |
| `completed_jobs_count` | INTEGER | Sí |  | 0 |
| `created_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |
| `updated_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |

**Relaciones:**
- `user_id` → `users.id`; al eliminar: **CASCADE**.

## `professional_service_areas`

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `id` | INTEGER | No | PK | — |
| `professional_id` | INTEGER | Sí | FK | — |
| `city_id` | INTEGER | No | FK | — |
| `postal_code` | TEXT | No |  | — |
| `radius_km` | REAL | No |  | — |
| `is_active` | INTEGER | Sí |  | 1 |
| `created_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |

**Relaciones:**
- `city_id` → `cities.id`; al eliminar: **CASCADE**.
- `professional_id` → `professional_profiles.id`; al eliminar: **CASCADE**.

## `regions`

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `id` | INTEGER | No | PK | — |
| `country_id` | INTEGER | Sí | FK | — |
| `name` | TEXT | Sí |  | — |
| `code` | TEXT | No |  | — |

**Relaciones:**
- `country_id` → `countries.id`; al eliminar: **CASCADE**.

## `request_professional_invitations`

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `id` | INTEGER | No | PK | — |
| `service_request_id` | INTEGER | Sí | FK | — |
| `professional_id` | INTEGER | Sí | FK | — |
| `invited_by_user_id` | INTEGER | Sí | FK | — |
| `status` | TEXT | Sí |  | 'PENDING' |
| `sent_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |
| `responded_at` | TEXT | No |  | — |

**Relaciones:**
- `invited_by_user_id` → `users.id`; al eliminar: **RESTRICT**.
- `professional_id` → `professional_profiles.id`; al eliminar: **CASCADE**.
- `service_request_id` → `service_requests.id`; al eliminar: **CASCADE**.

## `request_status_history`

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `id` | INTEGER | No | PK | — |
| `service_request_id` | INTEGER | Sí | FK | — |
| `previous_status` | TEXT | No |  | — |
| `new_status` | TEXT | Sí |  | — |
| `changed_by_user_id` | INTEGER | No | FK | — |
| `note` | TEXT | No |  | — |
| `created_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |

**Relaciones:**
- `changed_by_user_id` → `users.id`; al eliminar: **SET NULL**.
- `service_request_id` → `service_requests.id`; al eliminar: **CASCADE**.

## `reviews`

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `id` | INTEGER | No | PK | — |
| `service_order_id` | INTEGER | Sí | FK | — |
| `author_user_id` | INTEGER | Sí | FK | — |
| `professional_id` | INTEGER | Sí | FK | — |
| `rating` | INTEGER | Sí |  | — |
| `title` | TEXT | No |  | — |
| `comment` | TEXT | No |  | — |
| `professional_reply` | TEXT | No |  | — |
| `professional_replied_at` | TEXT | No |  | — |
| `status` | TEXT | Sí |  | 'PUBLISHED' |
| `created_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |
| `updated_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |

**Relaciones:**
- `professional_id` → `professional_profiles.id`; al eliminar: **CASCADE**.
- `author_user_id` → `users.id`; al eliminar: **RESTRICT**.
- `service_order_id` → `service_orders.id`; al eliminar: **CASCADE**.

## `roles`

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `id` | INTEGER | No | PK | — |
| `code` | TEXT | Sí |  | — |
| `name` | TEXT | Sí |  | — |
| `description` | TEXT | No |  | — |
| `created_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |

## `service_orders`

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `id` | INTEGER | No | PK | — |
| `service_request_id` | INTEGER | Sí | FK | — |
| `accepted_budget_id` | INTEGER | Sí | FK | — |
| `client_user_id` | INTEGER | Sí | FK | — |
| `professional_id` | INTEGER | Sí | FK | — |
| `status` | TEXT | Sí |  | 'PENDING_START' |
| `scheduled_start_at` | TEXT | No |  | — |
| `started_at` | TEXT | No |  | — |
| `completed_at` | TEXT | No |  | — |
| `client_confirmation_code_hash` | TEXT | No |  | — |
| `professional_confirmation_code_hash` | TEXT | No |  | — |
| `cancellation_reason` | TEXT | No |  | — |
| `created_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |
| `updated_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |

**Relaciones:**
- `professional_id` → `professional_profiles.id`; al eliminar: **RESTRICT**.
- `client_user_id` → `users.id`; al eliminar: **RESTRICT**.
- `accepted_budget_id` → `budgets.id`; al eliminar: **RESTRICT**.
- `service_request_id` → `service_requests.id`; al eliminar: **RESTRICT**.

## `service_request_images`

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `id` | INTEGER | No | PK | — |
| `service_request_id` | INTEGER | Sí | FK | — |
| `storage_path` | TEXT | Sí |  | — |
| `original_filename` | TEXT | No |  | — |
| `mime_type` | TEXT | No |  | — |
| `size_bytes` | INTEGER | No |  | — |
| `caption` | TEXT | No |  | — |
| `sort_order` | INTEGER | Sí |  | 0 |
| `visible_to_ai` | INTEGER | Sí |  | 1 |
| `created_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |

**Relaciones:**
- `service_request_id` → `service_requests.id`; al eliminar: **CASCADE**.

## `service_requests`

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `id` | INTEGER | No | PK | — |
| `client_user_id` | INTEGER | Sí | FK | — |
| `category_id` | INTEGER | No | FK | — |
| `service_id` | INTEGER | No | FK | — |
| `address_id` | INTEGER | No | FK | — |
| `title` | TEXT | No |  | — |
| `original_description` | TEXT | Sí |  | — |
| `final_description` | TEXT | No |  | — |
| `location_description` | TEXT | No |  | — |
| `urgency` | TEXT | Sí |  | 'NORMAL' |
| `status` | TEXT | Sí |  | 'DRAFT' |
| `preferred_date_from` | TEXT | No |  | — |
| `preferred_date_to` | TEXT | No |  | — |
| `flexible_schedule` | INTEGER | Sí |  | 1 |
| `budget_min` | REAL | No |  | — |
| `budget_max` | REAL | No |  | — |
| `ai_assisted` | INTEGER | Sí |  | 0 |
| `allow_professional_questions` | INTEGER | Sí |  | 1 |
| `published_at` | TEXT | No |  | — |
| `expires_at` | TEXT | No |  | — |
| `cancelled_at` | TEXT | No |  | — |
| `cancellation_reason` | TEXT | No |  | — |
| `created_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |
| `updated_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |
| `deleted_at` | TEXT | No |  | — |

**Relaciones:**
- `address_id` → `addresses.id`; al eliminar: **SET NULL**.
- `service_id` → `services.id`; al eliminar: **SET NULL**.
- `category_id` → `categories.id`; al eliminar: **SET NULL**.
- `client_user_id` → `users.id`; al eliminar: **RESTRICT**.

## `service_status_history`

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `id` | INTEGER | No | PK | — |
| `service_order_id` | INTEGER | Sí | FK | — |
| `previous_status` | TEXT | No |  | — |
| `new_status` | TEXT | Sí |  | — |
| `changed_by_user_id` | INTEGER | No | FK | — |
| `note` | TEXT | No |  | — |
| `created_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |

**Relaciones:**
- `changed_by_user_id` → `users.id`; al eliminar: **SET NULL**.
- `service_order_id` → `service_orders.id`; al eliminar: **CASCADE**.

## `services`

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `id` | INTEGER | No | PK | — |
| `category_id` | INTEGER | Sí | FK | — |
| `code` | TEXT | Sí |  | — |
| `name` | TEXT | Sí |  | — |
| `slug` | TEXT | Sí |  | — |
| `description` | TEXT | No |  | — |
| `base_unit` | TEXT | No |  | — |
| `sort_order` | INTEGER | Sí |  | 0 |
| `is_active` | INTEGER | Sí |  | 1 |
| `created_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |
| `updated_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |

**Relaciones:**
- `category_id` → `categories.id`; al eliminar: **RESTRICT**.

## `site_settings`

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `id` | INTEGER | No | PK | — |
| `setting_key` | TEXT | Sí |  | — |
| `setting_value` | TEXT | No |  | — |
| `value_type` | TEXT | Sí |  | 'STRING' |
| `is_public` | INTEGER | Sí |  | 0 |
| `description` | TEXT | No |  | — |
| `created_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |
| `updated_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |

## `user_legal_acceptances`

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `id` | INTEGER | No | PK | — |
| `user_id` | INTEGER | Sí | FK | — |
| `legal_document_id` | INTEGER | Sí | FK | — |
| `ip_address` | TEXT | No |  | — |
| `accepted_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |

**Relaciones:**
- `legal_document_id` → `legal_documents.id`; al eliminar: **RESTRICT**.
- `user_id` → `users.id`; al eliminar: **CASCADE**.

## `user_roles`

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `user_id` | INTEGER | Sí | PK / FK | — |
| `role_id` | INTEGER | Sí | PK / FK | — |
| `assigned_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |

**Relaciones:**
- `role_id` → `roles.id`; al eliminar: **RESTRICT**.
- `user_id` → `users.id`; al eliminar: **CASCADE**.

## `users`

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `id` | INTEGER | No | PK | — |
| `email` | TEXT | No |  | — |
| `phone_country_code` | TEXT | No |  | — |
| `phone_number` | TEXT | No |  | — |
| `password_hash` | TEXT | No |  | — |
| `first_name` | TEXT | Sí |  | — |
| `last_name` | TEXT | Sí |  | — |
| `avatar_url` | TEXT | No |  | — |
| `preferred_language` | TEXT | Sí |  | 'es' |
| `status` | TEXT | Sí |  | 'ACTIVE' |
| `email_verified_at` | TEXT | No |  | — |
| `phone_verified_at` | TEXT | No |  | — |
| `last_login_at` | TEXT | No |  | — |
| `created_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |
| `updated_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |
| `deleted_at` | TEXT | No |  | — |
