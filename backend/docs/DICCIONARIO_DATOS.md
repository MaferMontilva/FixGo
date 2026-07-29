# Diccionario de datos — FixGo IA

Base de datos: **SQLite** (`backend/database/fixgo.db`), gestionada con Prisma. Generado a partir del esquema real de la base.

Total de tablas: **45** (44 del esquema Prisma + 1 auxiliar `opportunity_dismissals` creada por SQL para la función de descartar oportunidades).

Los estados y tipos se modelan como columnas `TEXT`/`INTEGER` (no hay enums nativos); los booleanos se representan como `INTEGER` (0/1) y las fechas como `TEXT` en formato ISO.

## `addresses`

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `id` | INTEGER | Sí | PK | — |
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

**Relaciones y restricciones:**
- `city_id` → `cities.id` (ON DELETE SET NULL).
- `user_id` → `users.id` (ON DELETE CASCADE).

## `ai_analyses`

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `id` | INTEGER | Sí | PK | — |
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

**Relaciones y restricciones:**
- `suggested_service_id` → `services.id` (ON DELETE SET NULL).
- `suggested_category_id` → `categories.id` (ON DELETE SET NULL).
- `session_id` → `ai_assistant_sessions.id` (ON DELETE SET NULL).
- `service_request_id` → `service_requests.id` (ON DELETE CASCADE).

## `ai_analysis_answers`

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `id` | INTEGER | Sí | PK | — |
| `question_id` | INTEGER | Sí | FK | — |
| `user_id` | INTEGER | Sí | FK | — |
| `answer_text` | TEXT | No |  | — |
| `answer_json` | TEXT | No |  | — |
| `created_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |
| `updated_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |

**Relaciones y restricciones:**
- `user_id` → `users.id` (ON DELETE CASCADE).
- `question_id` → `ai_analysis_questions.id` (ON DELETE CASCADE).
- Único compuesto: (`question_id`, `user_id`).

## `ai_analysis_questions`

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `id` | INTEGER | Sí | PK | — |
| `analysis_id` | INTEGER | Sí | FK | — |
| `question_text` | TEXT | Sí |  | — |
| `answer_type` | TEXT | Sí |  | 'TEXT' |
| `options_json` | TEXT | No |  | — |
| `is_required` | INTEGER | Sí |  | 0 |
| `sort_order` | INTEGER | Sí |  | 0 |
| `created_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |

**Relaciones y restricciones:**
- `analysis_id` → `ai_analyses.id` (ON DELETE CASCADE).

## `ai_assistant_messages`

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `id` | INTEGER | Sí | PK | — |
| `session_id` | INTEGER | Sí | FK | — |
| `role` | TEXT | Sí |  | — |
| `content` | TEXT | Sí |  | — |
| `metadata_json` | TEXT | No |  | — |
| `created_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |

**Relaciones y restricciones:**
- `session_id` → `ai_assistant_sessions.id` (ON DELETE CASCADE).

## `ai_assistant_sessions`

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `id` | INTEGER | Sí | PK | — |
| `service_request_id` | INTEGER | Sí | FK | — |
| `user_id` | INTEGER | Sí | FK | — |
| `status` | TEXT | Sí |  | 'OPEN' |
| `started_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |
| `completed_at` | TEXT | No |  | — |

**Relaciones y restricciones:**
- `user_id` → `users.id` (ON DELETE CASCADE).
- `service_request_id` → `service_requests.id` (ON DELETE CASCADE).

## `audit_logs`

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `id` | INTEGER | Sí | PK | — |
| `actor_user_id` | INTEGER | No | FK | — |
| `action` | TEXT | Sí |  | — |
| `entity_type` | TEXT | Sí |  | — |
| `entity_id` | TEXT | No |  | — |
| `old_values_json` | TEXT | No |  | — |
| `new_values_json` | TEXT | No |  | — |
| `ip_address` | TEXT | No |  | — |
| `created_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |

**Relaciones y restricciones:**
- `actor_user_id` → `users.id` (ON DELETE SET NULL).

## `auth_sessions`

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `id` | INTEGER | Sí | PK | — |
| `user_id` | INTEGER | Sí | FK | — |
| `refresh_token_hash` | TEXT | Sí | UNIQUE | — |
| `ip_address` | TEXT | No |  | — |
| `user_agent` | TEXT | No |  | — |
| `expires_at` | TEXT | Sí |  | — |
| `revoked_at` | TEXT | No |  | — |
| `created_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |

**Relaciones y restricciones:**
- `user_id` → `users.id` (ON DELETE CASCADE).

## `budget_attachments`

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `id` | INTEGER | Sí | PK | — |
| `budget_id` | INTEGER | Sí | FK | — |
| `file_url` | TEXT | Sí |  | — |
| `original_filename` | TEXT | No |  | — |
| `mime_type` | TEXT | No |  | — |
| `created_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |

**Relaciones y restricciones:**
- `budget_id` → `budgets.id` (ON DELETE CASCADE).

## `budget_items`

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `id` | INTEGER | Sí | PK | — |
| `budget_id` | INTEGER | Sí | FK | — |
| `item_type` | TEXT | Sí |  | 'SERVICE' |
| `description` | TEXT | Sí |  | — |
| `quantity` | REAL | Sí |  | 1 |
| `unit_price` | REAL | Sí |  | 0 |
| `total` | REAL | Sí |  | 0 |
| `sort_order` | INTEGER | Sí |  | 0 |
| `created_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |

**Relaciones y restricciones:**
- `budget_id` → `budgets.id` (ON DELETE CASCADE).

## `budgets`

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `id` | INTEGER | Sí | PK | — |
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

**Relaciones y restricciones:**
- `professional_id` → `professional_profiles.id` (ON DELETE CASCADE).
- `service_request_id` → `service_requests.id` (ON DELETE CASCADE).
- Único compuesto: (`service_request_id`, `professional_id`).

## `categories`

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `id` | INTEGER | Sí | PK | — |
| `parent_id` | INTEGER | No | FK | — |
| `code` | TEXT | Sí | UNIQUE | — |
| `name` | TEXT | Sí |  | — |
| `slug` | TEXT | Sí | UNIQUE | — |
| `description` | TEXT | No |  | — |
| `icon_name` | TEXT | No |  | — |
| `image_url` | TEXT | No |  | — |
| `sort_order` | INTEGER | Sí |  | 0 |
| `is_active` | INTEGER | Sí |  | 1 |
| `created_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |
| `updated_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |

**Relaciones y restricciones:**
- `parent_id` → `categories.id` (ON DELETE SET NULL).

## `cities`

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `id` | INTEGER | Sí | PK | — |
| `region_id` | INTEGER | Sí | FK | — |
| `name` | TEXT | Sí |  | — |
| `postal_code_prefix` | TEXT | No |  | — |

**Relaciones y restricciones:**
- `region_id` → `regions.id` (ON DELETE CASCADE).
- Único compuesto: (`region_id`, `name`).

## `client_profiles`

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `id` | INTEGER | Sí | PK | — |
| `user_id` | INTEGER | Sí | FK / UNIQUE | — |
| `display_name` | TEXT | No |  | — |
| `notes` | TEXT | No |  | — |
| `created_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |
| `updated_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |

**Relaciones y restricciones:**
- `user_id` → `users.id` (ON DELETE CASCADE).

## `conversation_participants`

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `conversation_id` | INTEGER | Sí | PK / FK | — |
| `user_id` | INTEGER | Sí | PK / FK | — |
| `joined_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |
| `left_at` | TEXT | No |  | — |
| `last_read_at` | TEXT | No |  | — |

**Relaciones y restricciones:**
- `user_id` → `users.id` (ON DELETE CASCADE).
- `conversation_id` → `conversations.id` (ON DELETE CASCADE).
- Único compuesto: (`conversation_id`, `user_id`).

## `conversations`

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `id` | INTEGER | Sí | PK | — |
| `service_request_id` | INTEGER | No | FK | — |
| `budget_id` | INTEGER | No | FK | — |
| `service_order_id` | INTEGER | No | FK | — |
| `type` | TEXT | Sí |  | 'REQUEST' |
| `created_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |
| `updated_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |

**Relaciones y restricciones:**
- `service_order_id` → `service_orders.id` (ON DELETE CASCADE).
- `budget_id` → `budgets.id` (ON DELETE CASCADE).
- `service_request_id` → `service_requests.id` (ON DELETE CASCADE).

## `countries`

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `id` | INTEGER | Sí | PK | — |
| `iso2` | TEXT | Sí | UNIQUE | — |
| `name` | TEXT | Sí | UNIQUE | — |

## `favorite_professionals`

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `client_user_id` | INTEGER | Sí | PK / FK | — |
| `professional_id` | INTEGER | Sí | PK / FK | — |
| `created_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |

**Relaciones y restricciones:**
- `professional_id` → `professional_profiles.id` (ON DELETE CASCADE).
- `client_user_id` → `users.id` (ON DELETE CASCADE).
- Único compuesto: (`client_user_id`, `professional_id`).

## `legal_documents`

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `id` | INTEGER | Sí | PK | — |
| `document_type` | TEXT | Sí |  | — |
| `version` | TEXT | Sí |  | — |
| `title` | TEXT | Sí |  | — |
| `content` | TEXT | Sí |  | — |
| `published_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |
| `is_active` | INTEGER | Sí |  | 1 |

**Relaciones y restricciones:**
- Único compuesto: (`document_type`, `version`).

## `message_attachments`

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `id` | INTEGER | Sí | PK | — |
| `message_id` | INTEGER | Sí | FK | — |
| `file_url` | TEXT | Sí |  | — |
| `original_filename` | TEXT | No |  | — |
| `mime_type` | TEXT | No |  | — |
| `size_bytes` | INTEGER | No |  | — |
| `created_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |

**Relaciones y restricciones:**
- `message_id` → `messages.id` (ON DELETE CASCADE).

## `messages`

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `id` | INTEGER | Sí | PK | — |
| `conversation_id` | INTEGER | Sí | FK | — |
| `sender_user_id` | INTEGER | Sí | FK | — |
| `message_type` | TEXT | Sí |  | 'TEXT' |
| `content` | TEXT | No |  | — |
| `sent_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |
| `edited_at` | TEXT | No |  | — |
| `deleted_at` | TEXT | No |  | — |

**Relaciones y restricciones:**
- `sender_user_id` → `users.id` (ON DELETE RESTRICT).
- `conversation_id` → `conversations.id` (ON DELETE CASCADE).

## `notifications`

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `id` | INTEGER | Sí | PK | — |
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

**Relaciones y restricciones:**
- `user_id` → `users.id` (ON DELETE CASCADE).

## `opportunity_dismissals` *(tabla auxiliar, fuera de `schema.prisma`)*

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `id` | INTEGER | Sí | PK | — |
| `service_request_id` | INTEGER | Sí |  | — |
| `professional_id` | INTEGER | Sí |  | — |
| `reason` | TEXT | Sí |  | — |
| `created_at` | TEXT | Sí |  | — |

**Relaciones y restricciones:**
- Único compuesto: (`service_request_id`, `professional_id`).

## `otp_codes`

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `id` | INTEGER | Sí | PK | — |
| `user_id` | INTEGER | No | FK | — |
| `destination` | TEXT | Sí |  | — |
| `channel` | TEXT | Sí |  | — |
| `purpose` | TEXT | Sí |  | — |
| `code_hash` | TEXT | Sí |  | — |
| `expires_at` | TEXT | Sí |  | — |
| `used_at` | TEXT | No |  | — |
| `attempts` | INTEGER | Sí |  | 0 |
| `created_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |

**Relaciones y restricciones:**
- `user_id` → `users.id` (ON DELETE CASCADE).

## `password_reset_tokens`

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `id` | INTEGER | Sí | PK | — |
| `user_id` | INTEGER | Sí | FK | — |
| `token_hash` | TEXT | Sí | UNIQUE | — |
| `expires_at` | TEXT | Sí |  | — |
| `used_at` | TEXT | No |  | — |
| `created_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |

**Relaciones y restricciones:**
- `user_id` → `users.id` (ON DELETE CASCADE).

## `professional_availability`

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `id` | INTEGER | Sí | PK | — |
| `professional_id` | INTEGER | Sí | FK | — |
| `weekday` | INTEGER | Sí |  | — |
| `start_time` | TEXT | Sí |  | — |
| `end_time` | TEXT | Sí |  | — |
| `is_available` | INTEGER | Sí |  | 1 |
| `created_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |

**Relaciones y restricciones:**
- `professional_id` → `professional_profiles.id` (ON DELETE CASCADE).
- Único compuesto: (`professional_id`, `weekday`, `start_time`, `end_time`).

## `professional_categories`

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `professional_id` | INTEGER | Sí | PK / FK | — |
| `category_id` | INTEGER | Sí | PK / FK | — |
| `is_primary` | INTEGER | Sí |  | 0 |
| `years_experience` | INTEGER | Sí |  | 0 |
| `created_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |

**Relaciones y restricciones:**
- `category_id` → `categories.id` (ON DELETE RESTRICT).
- `professional_id` → `professional_profiles.id` (ON DELETE CASCADE).
- Único compuesto: (`professional_id`, `category_id`).

## `professional_documents`

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `id` | INTEGER | Sí | PK | — |
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

**Relaciones y restricciones:**
- `reviewed_by_user_id` → `users.id` (ON DELETE SET NULL).
- `professional_id` → `professional_profiles.id` (ON DELETE CASCADE).

## `professional_profiles`

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `id` | INTEGER | Sí | PK | — |
| `user_id` | INTEGER | Sí | FK / UNIQUE | — |
| `slug` | TEXT | Sí | UNIQUE | — |
| `display_name` | TEXT | Sí |  | — |
| `business_name` | TEXT | No |  | — |
| `phone` | TEXT | No |  | — |
| `tax_id` | TEXT | No |  | — |
| `bio` | TEXT | No |  | — |
| `years_experience` | INTEGER | Sí |  | 0 |
| `province` | TEXT | No |  | — |
| `municipality` | TEXT | No |  | — |
| `postal_code` | TEXT | No |  | — |
| `reference_address` | TEXT | No |  | — |
| `work_radius` | INTEGER | No |  | — |
| `availability` | TEXT | No |  | — |
| `profile_image_url` | TEXT | No |  | — |
| `cover_image_url` | TEXT | No |  | — |
| `website_url` | TEXT | No |  | — |
| `is_verified` | INTEGER | Sí |  | 0 |
| `is_homologated` | INTEGER | Sí |  | 0 |
| `verification_status` | TEXT | Sí |  | 'PENDING' |
| `profile_status` | TEXT | Sí |  | 'INCOMPLETE' |
| `rating_average` | REAL | Sí |  | 0 |
| `ratings_count` | INTEGER | Sí |  | 0 |
| `response_time_minutes` | INTEGER | No |  | — |
| `completed_jobs_count` | INTEGER | Sí |  | 0 |
| `created_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |
| `updated_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |

**Relaciones y restricciones:**
- `user_id` → `users.id` (ON DELETE CASCADE).

## `professional_service_areas`

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `id` | INTEGER | Sí | PK | — |
| `professional_id` | INTEGER | Sí | FK | — |
| `city_id` | INTEGER | No | FK | — |
| `postal_code` | TEXT | No |  | — |
| `radius_km` | REAL | No |  | — |
| `is_active` | INTEGER | Sí |  | 1 |
| `created_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |

**Relaciones y restricciones:**
- `city_id` → `cities.id` (ON DELETE CASCADE).
- `professional_id` → `professional_profiles.id` (ON DELETE CASCADE).

## `professional_services`

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `professional_id` | INTEGER | Sí | PK / FK | — |
| `service_id` | INTEGER | Sí | PK / FK | — |
| `created_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |

**Relaciones y restricciones:**
- `service_id` → `services.id` (ON DELETE RESTRICT).
- `professional_id` → `professional_profiles.id` (ON DELETE CASCADE).
- Único compuesto: (`professional_id`, `service_id`).

## `regions`

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `id` | INTEGER | Sí | PK | — |
| `country_id` | INTEGER | Sí | FK | — |
| `name` | TEXT | Sí |  | — |
| `code` | TEXT | No |  | — |

**Relaciones y restricciones:**
- `country_id` → `countries.id` (ON DELETE CASCADE).
- Único compuesto: (`country_id`, `name`).

## `request_professional_invitations`

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `id` | INTEGER | Sí | PK | — |
| `service_request_id` | INTEGER | Sí | FK | — |
| `professional_id` | INTEGER | Sí | FK | — |
| `invited_by_user_id` | INTEGER | Sí | FK | — |
| `status` | TEXT | Sí |  | 'PENDING' |
| `sent_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |
| `responded_at` | TEXT | No |  | — |

**Relaciones y restricciones:**
- `invited_by_user_id` → `users.id` (ON DELETE RESTRICT).
- `professional_id` → `professional_profiles.id` (ON DELETE CASCADE).
- `service_request_id` → `service_requests.id` (ON DELETE CASCADE).
- Único compuesto: (`service_request_id`, `professional_id`).

## `request_status_history`

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `id` | INTEGER | Sí | PK | — |
| `service_request_id` | INTEGER | Sí | FK | — |
| `previous_status` | TEXT | No |  | — |
| `new_status` | TEXT | Sí |  | — |
| `changed_by_user_id` | INTEGER | No | FK | — |
| `note` | TEXT | No |  | — |
| `created_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |

**Relaciones y restricciones:**
- `changed_by_user_id` → `users.id` (ON DELETE SET NULL).
- `service_request_id` → `service_requests.id` (ON DELETE CASCADE).

## `reviews`

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `id` | INTEGER | Sí | PK | — |
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

**Relaciones y restricciones:**
- `professional_id` → `professional_profiles.id` (ON DELETE CASCADE).
- `author_user_id` → `users.id` (ON DELETE RESTRICT).
- `service_order_id` → `service_orders.id` (ON DELETE CASCADE).
- Único compuesto: (`service_order_id`, `author_user_id`).

## `roles`

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `id` | INTEGER | Sí | PK | — |
| `code` | TEXT | Sí | UNIQUE | — |
| `name` | TEXT | Sí |  | — |
| `description` | TEXT | No |  | — |
| `created_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |

## `service_orders`

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `id` | INTEGER | Sí | PK | — |
| `service_request_id` | INTEGER | Sí | FK / UNIQUE | — |
| `accepted_budget_id` | INTEGER | Sí | FK / UNIQUE | — |
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

**Relaciones y restricciones:**
- `professional_id` → `professional_profiles.id` (ON DELETE RESTRICT).
- `client_user_id` → `users.id` (ON DELETE RESTRICT).
- `accepted_budget_id` → `budgets.id` (ON DELETE RESTRICT).
- `service_request_id` → `service_requests.id` (ON DELETE RESTRICT).

## `service_request_images`

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `id` | INTEGER | Sí | PK | — |
| `service_request_id` | INTEGER | Sí | FK | — |
| `storage_path` | TEXT | Sí |  | — |
| `original_filename` | TEXT | No |  | — |
| `mime_type` | TEXT | No |  | — |
| `size_bytes` | INTEGER | No |  | — |
| `caption` | TEXT | No |  | — |
| `sort_order` | INTEGER | Sí |  | 0 |
| `visible_to_ai` | INTEGER | Sí |  | 1 |
| `created_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |

**Relaciones y restricciones:**
- `service_request_id` → `service_requests.id` (ON DELETE CASCADE).

## `service_requests`

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `id` | INTEGER | Sí | PK | — |
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

**Relaciones y restricciones:**
- `address_id` → `addresses.id` (ON DELETE SET NULL).
- `service_id` → `services.id` (ON DELETE SET NULL).
- `category_id` → `categories.id` (ON DELETE SET NULL).
- `client_user_id` → `users.id` (ON DELETE RESTRICT).

## `service_status_history`

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `id` | INTEGER | Sí | PK | — |
| `service_order_id` | INTEGER | Sí | FK | — |
| `previous_status` | TEXT | No |  | — |
| `new_status` | TEXT | Sí |  | — |
| `changed_by_user_id` | INTEGER | No | FK | — |
| `note` | TEXT | No |  | — |
| `created_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |

**Relaciones y restricciones:**
- `changed_by_user_id` → `users.id` (ON DELETE SET NULL).
- `service_order_id` → `service_orders.id` (ON DELETE CASCADE).

## `services`

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `id` | INTEGER | Sí | PK | — |
| `category_id` | INTEGER | Sí | FK | — |
| `code` | TEXT | Sí | UNIQUE | — |
| `name` | TEXT | Sí |  | — |
| `slug` | TEXT | Sí | UNIQUE | — |
| `description` | TEXT | No |  | — |
| `base_unit` | TEXT | No |  | — |
| `sort_order` | INTEGER | Sí |  | 0 |
| `is_active` | INTEGER | Sí |  | 1 |
| `created_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |
| `updated_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |

**Relaciones y restricciones:**
- `category_id` → `categories.id` (ON DELETE RESTRICT).

## `site_settings`

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `id` | INTEGER | Sí | PK | — |
| `setting_key` | TEXT | Sí | UNIQUE | — |
| `setting_value` | TEXT | No |  | — |
| `value_type` | TEXT | Sí |  | 'STRING' |
| `is_public` | INTEGER | Sí |  | 0 |
| `description` | TEXT | No |  | — |
| `created_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |
| `updated_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |

## `user_legal_acceptances`

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `id` | INTEGER | Sí | PK | — |
| `user_id` | INTEGER | Sí | FK | — |
| `legal_document_id` | INTEGER | Sí | FK | — |
| `ip_address` | TEXT | No |  | — |
| `accepted_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |

**Relaciones y restricciones:**
- `legal_document_id` → `legal_documents.id` (ON DELETE RESTRICT).
- `user_id` → `users.id` (ON DELETE CASCADE).
- Único compuesto: (`user_id`, `legal_document_id`).

## `user_roles`

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `user_id` | INTEGER | Sí | PK / FK | — |
| `role_id` | INTEGER | Sí | PK / FK | — |
| `assigned_at` | TEXT | Sí |  | CURRENT_TIMESTAMP |

**Relaciones y restricciones:**
- `role_id` → `roles.id` (ON DELETE RESTRICT).
- `user_id` → `users.id` (ON DELETE CASCADE).
- Único compuesto: (`user_id`, `role_id`).

## `users`

| Campo | Tipo | Obligatorio | Clave | Valor predeterminado |
|---|---|---:|---|---|
| `id` | INTEGER | Sí | PK | — |
| `email` | TEXT | No | UNIQUE | — |
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
| `must_change_password` | INTEGER | Sí |  | 0 |

**Relaciones y restricciones:**
- Único compuesto: (`phone_country_code`, `phone_number`).
