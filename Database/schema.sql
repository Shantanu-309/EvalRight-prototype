
-- Case-insensitive text type (used for emails, usernames, etc.)
CREATE EXTENSION IF NOT EXISTS citext;

-- =====================================================================
-- EvalRight BGV Platform - PostgreSQL Schema
-- Core entities: Auth, Clients, Candidates, Packages, Orders, IDA, Billing, Webhooks, Audit
-- =====================================================================

-- Recommended: enable UUIDs if you prefer uuid PKs instead of BIGSERIAL
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================================
-- 0. ENUM TYPES
-- =====================================================================

CREATE TYPE account_status_enum AS ENUM ('active', 'locked', 'pending_verification', 'disabled');

CREATE TYPE client_status_enum AS ENUM ('prospect', 'active', 'suspended', 'terminated');

CREATE TYPE billing_mode_enum AS ENUM ('prepaid_per_order', 'postpaid_monthly');

CREATE TYPE candidate_status_enum AS ENUM (
  'invited',
  'profile_pending',
  'awaiting_documents',
  'in_verification',
  'clear',
  'adverse',
  'withdrawn'
);

CREATE TYPE bgv_region_enum AS ENUM ('us', 'in', 'both');

CREATE TYPE bgv_order_status_enum AS ENUM (
  'draft',
  'awaiting_candidate',
  'awaiting_documents',
  'awaiting_payment',
  'payment_failed',
  'queued_for_vendor',
  'in_progress',
  'clear',
  'adverse',
  'closed',
  'cancelled'
);

CREATE TYPE component_status_enum AS ENUM (
  'not_started',
  'queued',
  'in_progress',
  'insufficient',
  'clear',
  'discrepancy',
  'unable_to_verify',
  'cancelled'
);

CREATE TYPE invoice_status_enum AS ENUM (
  'draft',
  'sent',
  'partially_paid',
  'paid',
  'overdue',
  'void'
);

CREATE TYPE webhook_processing_status_enum AS ENUM ('pending', 'processed', 'failed', 'ignored');

-- =====================================================================
-- 1. GENERIC UTILITIES: timestamp trigger
-- =====================================================================

CREATE OR REPLACE FUNCTION set_timestamp()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================================
-- 2. AUTH & ROLES
-- =====================================================================

CREATE TABLE accounts (
  id               BIGSERIAL PRIMARY KEY,
  email            CITEXT NOT NULL UNIQUE,
  password_hash    TEXT,
  status           account_status_enum NOT NULL DEFAULT 'pending_verification',
  is_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  last_login_at    TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE accounts IS 'Login identity: admin, client user, candidate, etc.';

CREATE INDEX idx_accounts_status ON accounts (status);

CREATE TRIGGER trg_accounts_set_timestamp
BEFORE UPDATE ON accounts
FOR EACH ROW EXECUTE FUNCTION set_timestamp();


CREATE TABLE user_profiles (
  account_id   BIGINT PRIMARY KEY REFERENCES accounts(id) ON DELETE CASCADE,
  first_name   TEXT NOT NULL,
  last_name    TEXT NOT NULL,
  phone        TEXT,
  timezone     TEXT,
  locale       TEXT,
  avatar_url   TEXT
);

COMMENT ON TABLE user_profiles IS 'Additional profile data for an account.';


CREATE TABLE roles (
  id          BIGSERIAL PRIMARY KEY,
  code        TEXT NOT NULL UNIQUE,  -- e.g. admin, client_admin, client_user, candidate
  description TEXT
);

COMMENT ON TABLE roles IS 'System roles controlling access.';


CREATE TABLE account_roles (
  account_id  BIGINT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  role_id     BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  scope_type  TEXT NOT NULL DEFAULT 'global', -- global, client, candidate
  scope_id    BIGINT,
  assigned_by BIGINT REFERENCES accounts(id),
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (account_id, role_id, scope_type, scope_id)
);

COMMENT ON TABLE account_roles IS 'Role assignments with optional scope (client/candidate).';


CREATE TABLE auth_sessions (
  id                  BIGSERIAL PRIMARY KEY,
  account_id          BIGINT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  refresh_token_hash  TEXT NOT NULL,
  user_agent          TEXT,
  ip_address          INET,
  expires_at          TIMESTAMPTZ NOT NULL,
  revoked_at          TIMESTAMPTZ,
  revoked_reason      TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE auth_sessions IS 'Refresh tokens used for session management.';

CREATE INDEX idx_auth_sessions_account_id ON auth_sessions (account_id);
CREATE INDEX idx_auth_sessions_expires_at ON auth_sessions (expires_at);

-- =====================================================================
-- 3. CLIENTS & ORG MANAGEMENT
-- =====================================================================

CREATE TABLE client_groups (
  id          BIGSERIAL PRIMARY KEY,
  code        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  description TEXT
);

COMMENT ON TABLE client_groups IS 'Segmentation of clients (enterprise, SMB, etc.).';


CREATE TABLE clients (
  id                  BIGSERIAL PRIMARY KEY,
  name                TEXT NOT NULL,
  display_name        TEXT,
  industry            TEXT,
  country             TEXT,
  client_group_id     BIGINT REFERENCES client_groups(id),
  tax_exempt          BOOLEAN NOT NULL DEFAULT FALSE,
  tax_exemption_details TEXT,
  status              client_status_enum NOT NULL DEFAULT 'prospect',
  billing_mode        billing_mode_enum NOT NULL DEFAULT 'prepaid_per_order',
  autopay_enabled     BOOLEAN NOT NULL DEFAULT FALSE,
  default_currency    TEXT NOT NULL DEFAULT 'USD',
  signup_date         TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE clients IS 'Client organizations requesting BGV services.';

CREATE INDEX idx_clients_status ON clients (status);

CREATE TRIGGER trg_clients_set_timestamp
BEFORE UPDATE ON clients
FOR EACH ROW EXECUTE FUNCTION set_timestamp();


CREATE TABLE client_branches (
  id           BIGSERIAL PRIMARY KEY,
  client_id    BIGINT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  address_line1 TEXT,
  address_line2 TEXT,
  city         TEXT,
  state        TEXT,
  postal_code  TEXT,
  country      TEXT,
  phone        TEXT,
  is_primary   BOOLEAN NOT NULL DEFAULT FALSE,
  status       TEXT NOT NULL DEFAULT 'active',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE client_branches IS 'Branch/office locations for a client.';

CREATE INDEX idx_client_branches_client_id ON client_branches (client_id);

CREATE TRIGGER trg_client_branches_set_timestamp
BEFORE UPDATE ON client_branches
FOR EACH ROW EXECUTE FUNCTION set_timestamp();


CREATE TABLE client_contacts (
  id                    BIGSERIAL PRIMARY KEY,
  client_id             BIGINT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  account_id            BIGINT REFERENCES accounts(id) ON DELETE SET NULL,
  name                  TEXT NOT NULL,
  email                 CITEXT NOT NULL,
  phone                 TEXT,
  role                  TEXT,
  is_primary_billing    BOOLEAN NOT NULL DEFAULT FALSE,
  is_primary_technical  BOOLEAN NOT NULL DEFAULT FALSE
);

COMMENT ON TABLE client_contacts IS 'Contacts at the client organization.';

CREATE INDEX idx_client_contacts_client_id ON client_contacts (client_id);


CREATE TABLE client_settings (
  id                        BIGSERIAL PRIMARY KEY,
  client_id                 BIGINT NOT NULL UNIQUE REFERENCES clients(id) ON DELETE CASCADE,
  default_region            bgv_region_enum NOT NULL DEFAULT 'in',
  invite_expiry_days        INTEGER NOT NULL DEFAULT 7,
  permissible_purpose       TEXT,
  business_type             TEXT,
  require_candidate_consent BOOLEAN NOT NULL DEFAULT TRUE,
  allow_a_la_carte_components BOOLEAN NOT NULL DEFAULT FALSE,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE client_settings IS 'Operational & compliance settings per client.';

CREATE TRIGGER trg_client_settings_set_timestamp
BEFORE UPDATE ON client_settings
FOR EACH ROW EXECUTE FUNCTION set_timestamp();


CREATE TABLE client_registration_forms (
  id                       BIGSERIAL PRIMARY KEY,
  client_id                BIGINT REFERENCES clients(id) ON DELETE SET NULL,
  submitted_by_account_id  BIGINT REFERENCES accounts(id),
  raw_payload_json         JSONB NOT NULL,
  status                   TEXT NOT NULL DEFAULT 'submitted', -- submitted, under_review, approved, rejected
  reviewed_by_admin_id     BIGINT REFERENCES accounts(id),
  review_notes             TEXT,
  agreed_tos_at            TIMESTAMPTZ,
  agreed_name              TEXT,
  agreed_title             TEXT,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE client_registration_forms IS 'Captured onboarding forms for clients.';

CREATE INDEX idx_client_registration_forms_status ON client_registration_forms (status);

CREATE TRIGGER trg_client_registration_forms_set_timestamp
BEFORE UPDATE ON client_registration_forms
FOR EACH ROW EXECUTE FUNCTION set_timestamp();


CREATE TABLE client_package_overrides (
  id                     BIGSERIAL PRIMARY KEY,
  client_id              BIGINT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  package_id             BIGINT NOT NULL,
  is_enabled             BOOLEAN NOT NULL DEFAULT TRUE,
  custom_display_name    TEXT,
  override_pricing_json  JSONB,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (client_id, package_id)
);

COMMENT ON TABLE client_package_overrides IS 'Client-specific package visibility & pricing overrides.';

CREATE INDEX idx_client_package_overrides_client ON client_package_overrides (client_id);

CREATE TRIGGER trg_client_package_overrides_set_timestamp
BEFORE UPDATE ON client_package_overrides
FOR EACH ROW EXECUTE FUNCTION set_timestamp();

-- =====================================================================
-- 4. CANDIDATES & TASKS
-- =====================================================================

CREATE TABLE candidates (
  id                   BIGSERIAL PRIMARY KEY,
  client_id            BIGINT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  account_id           BIGINT REFERENCES accounts(id) ON DELETE SET NULL,
  external_reference   TEXT, -- client internal ID
  first_name           TEXT NOT NULL,
  middle_name          TEXT,
  last_name            TEXT NOT NULL,
  email                CITEXT NOT NULL,
  phone                TEXT,
  dob                  DATE,
  country_of_residence TEXT,
  status               candidate_status_enum NOT NULL DEFAULT 'invited',
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE candidates IS 'Persons whose background is being verified.';

CREATE INDEX idx_candidates_client_email ON candidates (client_id, email);
CREATE INDEX idx_candidates_status ON candidates (status);

CREATE TRIGGER trg_candidates_set_timestamp
BEFORE UPDATE ON candidates
FOR EACH ROW EXECUTE FUNCTION set_timestamp();


CREATE TABLE candidate_invitations (
  id              BIGSERIAL PRIMARY KEY,
  client_id       BIGINT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  candidate_id    BIGINT REFERENCES candidates(id) ON DELETE SET NULL,
  bgv_order_id    BIGINT, -- FK later (bgv_orders)
  invited_email   CITEXT NOT NULL,
  invited_phone   TEXT,
  invitation_token TEXT NOT NULL UNIQUE,
  expires_at      TIMESTAMPTZ NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pending', -- pending, accepted, expired, cancelled
  sent_at         TIMESTAMPTZ,
  accepted_at     TIMESTAMPTZ,
  cancelled_at    TIMESTAMPTZ
);

COMMENT ON TABLE candidate_invitations IS 'Invitations for candidates to complete their details.';

CREATE INDEX idx_candidate_invitations_client ON candidate_invitations (client_id);
CREATE INDEX idx_candidate_invitations_token ON candidate_invitations (invitation_token);


CREATE TABLE candidate_task_status (
  id                     BIGSERIAL PRIMARY KEY,
  candidate_id           BIGINT NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  bgv_order_id           BIGINT, -- FK later
  task_code              TEXT NOT NULL, -- e.g. PERSONAL_INFO, ADDRESS_HISTORY
  status                 TEXT NOT NULL DEFAULT 'draft', -- draft, in_progress, completed, locked, error
  editable_by_candidate  BOOLEAN NOT NULL DEFAULT TRUE,
  editable_until         TIMESTAMPTZ,
  last_updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by_account_id  BIGINT REFERENCES accounts(id),
  UNIQUE (candidate_id, bgv_order_id, task_code)
);

COMMENT ON TABLE candidate_task_status IS 'Per-task progress & editability for candidate workflow.';

CREATE INDEX idx_candidate_task_status_candidate ON candidate_task_status (candidate_id);


CREATE TABLE candidate_profile_data (
  id             BIGSERIAL PRIMARY KEY,
  candidate_id   BIGINT NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  task_code      TEXT NOT NULL,
  data_json      JSONB NOT NULL,
  is_validated   BOOLEAN NOT NULL DEFAULT FALSE,
  validated_at   TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (candidate_id, task_code)
);

COMMENT ON TABLE candidate_profile_data IS 'JSON payload per task (personal, employment, etc.).';

CREATE TRIGGER trg_candidate_profile_data_set_timestamp
BEFORE UPDATE ON candidate_profile_data
FOR EACH ROW EXECUTE FUNCTION set_timestamp();


CREATE TABLE candidate_addresses (
  id             BIGSERIAL PRIMARY KEY,
  candidate_id   BIGINT NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  type           TEXT NOT NULL, -- current, previous, permanent
  address_line1  TEXT,
  address_line2  TEXT,
  city           TEXT,
  state          TEXT,
  postal_code    TEXT,
  country        TEXT,
  from_date      DATE,
  to_date        DATE
);

COMMENT ON TABLE candidate_addresses IS 'Address history for candidate.';

CREATE INDEX idx_candidate_addresses_candidate ON candidate_addresses (candidate_id);


CREATE TABLE candidate_employments (
  id             BIGSERIAL PRIMARY KEY,
  candidate_id   BIGINT NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  employer_name  TEXT NOT NULL,
  designation    TEXT,
  from_date      DATE,
  to_date        DATE,
  location       TEXT,
  contact_info   TEXT,
  is_current     BOOLEAN NOT NULL DEFAULT FALSE
);

COMMENT ON TABLE candidate_employments IS 'Employment history records.';

CREATE INDEX idx_candidate_employments_candidate ON candidate_employments (candidate_id);


CREATE TABLE candidate_educations (
  id               BIGSERIAL PRIMARY KEY,
  candidate_id     BIGINT NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  institution_name TEXT NOT NULL,
  degree           TEXT,
  major            TEXT,
  from_date        DATE,
  to_date          DATE,
  country          TEXT,
  certificate_number TEXT
);

COMMENT ON TABLE candidate_educations IS 'Education history records.';

CREATE INDEX idx_candidate_educations_candidate ON candidate_educations (candidate_id);

-- =====================================================================
-- 5. PACKAGES, COMPONENTS, DOCUMENT REQUIREMENTS
-- =====================================================================

CREATE TABLE bgv_components_catalog (
  id                        BIGSERIAL PRIMARY KEY,
  code                      TEXT NOT NULL UNIQUE, -- e.g. US_EMPLOYMENT, IN_CRIMINAL
  name                      TEXT NOT NULL,
  category                  TEXT NOT NULL, -- identity, criminal, etc.
  default_region            bgv_region_enum NOT NULL DEFAULT 'in',
  supports_multiple_instances BOOLEAN NOT NULL DEFAULT FALSE,
  default_turnaround_days   INTEGER,
  is_active                 BOOLEAN NOT NULL DEFAULT TRUE
);

COMMENT ON TABLE bgv_components_catalog IS 'Catalog of all check components supported.';


CREATE TABLE bgv_packages (
  id            BIGSERIAL PRIMARY KEY,
  client_id     BIGINT REFERENCES clients(id) ON DELETE SET NULL,
  code          TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  description   TEXT,
  region_scope  bgv_region_enum NOT NULL DEFAULT 'both',
  is_preset     BOOLEAN NOT NULL DEFAULT TRUE,
  is_public     BOOLEAN NOT NULL DEFAULT TRUE,
  status        TEXT NOT NULL DEFAULT 'active', -- active, deprecated
  created_by_admin_id BIGINT REFERENCES accounts(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE bgv_packages IS 'BGV packages offered (global or client-specific).';

CREATE TRIGGER trg_bgv_packages_set_timestamp
BEFORE UPDATE ON bgv_packages
FOR EACH ROW EXECUTE FUNCTION set_timestamp();


CREATE TABLE bgv_package_components (
  id             BIGSERIAL PRIMARY KEY,
  package_id     BIGINT NOT NULL REFERENCES bgv_packages(id) ON DELETE CASCADE,
  component_id   BIGINT NOT NULL REFERENCES bgv_components_catalog(id) ON DELETE RESTRICT,
  is_required    BOOLEAN NOT NULL DEFAULT TRUE,
  default_quantity INTEGER NOT NULL DEFAULT 1,
  sort_order     INTEGER NOT NULL DEFAULT 0,
  UNIQUE (package_id, component_id)
);

COMMENT ON TABLE bgv_package_components IS 'Mapping of components to packages.';


CREATE TABLE document_requirements (
  id              BIGSERIAL PRIMARY KEY,
  package_id      BIGINT REFERENCES bgv_packages(id) ON DELETE CASCADE,
  component_id    BIGINT REFERENCES bgv_components_catalog(id) ON DELETE SET NULL,
  document_type   TEXT NOT NULL, -- loa, id_proof, address_proof, etc.
  is_mandatory    BOOLEAN NOT NULL DEFAULT TRUE,
  instructions    TEXT,
  min_count       INTEGER NOT NULL DEFAULT 1,
  max_count       INTEGER
);

COMMENT ON TABLE document_requirements IS 'Document requirements per package/component.';


CREATE TABLE candidate_document_requirements (
  id                    BIGSERIAL PRIMARY KEY,
  candidate_id          BIGINT NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  bgv_order_id          BIGINT, -- FK later
  requirement_id        BIGINT NOT NULL REFERENCES document_requirements(id) ON DELETE CASCADE,
  status                TEXT NOT NULL DEFAULT 'pending', -- pending, partially_fulfilled, fulfilled, waived
  fulfilled_at          TIMESTAMPTZ,
  waived_by_admin_id    BIGINT REFERENCES accounts(id),
  waived_reason         TEXT,
  UNIQUE (candidate_id, bgv_order_id, requirement_id)
);

COMMENT ON TABLE candidate_document_requirements IS 'Per-order tracking of document requirement fulfillment.';

CREATE INDEX idx_cand_doc_reqs_candidate_order ON candidate_document_requirements (candidate_id, bgv_order_id);

-- =====================================================================
-- 6. ORDERS & COMPONENTS
-- =====================================================================

CREATE TABLE bgv_orders (
  id                       BIGSERIAL PRIMARY KEY,
  client_id                BIGINT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  candidate_id             BIGINT REFERENCES candidates(id) ON DELETE SET NULL,
  client_branch_id         BIGINT REFERENCES client_branches(id),
  initiated_by_account_id  BIGINT REFERENCES accounts(id),
  package_id               BIGINT REFERENCES bgv_packages(id),
  bgv_region               bgv_region_enum NOT NULL DEFAULT 'in',
  order_type               TEXT NOT NULL DEFAULT 'direct', -- direct, with_invitation
  overall_status           bgv_order_status_enum NOT NULL DEFAULT 'draft',
  vendor_code              TEXT NOT NULL DEFAULT 'IDA',
  pricing_snapshot_json    JSONB,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at             TIMESTAMPTZ
);

COMMENT ON TABLE bgv_orders IS 'BGV order per candidate for a client.';

CREATE INDEX idx_bgv_orders_client ON bgv_orders (client_id);
CREATE INDEX idx_bgv_orders_candidate ON bgv_orders (candidate_id);
CREATE INDEX idx_bgv_orders_status ON bgv_orders (overall_status);

CREATE TRIGGER trg_bgv_orders_set_timestamp
BEFORE UPDATE ON bgv_orders
FOR EACH ROW EXECUTE FUNCTION set_timestamp();


-- Now wire foreign keys that reference bgv_orders:

ALTER TABLE candidate_invitations
  ADD CONSTRAINT fk_candidate_invitations_bgv_order
  FOREIGN KEY (bgv_order_id) REFERENCES bgv_orders(id) ON DELETE SET NULL;

ALTER TABLE candidate_task_status
  ADD CONSTRAINT fk_candidate_task_status_bgv_order
  FOREIGN KEY (bgv_order_id) REFERENCES bgv_orders(id) ON DELETE CASCADE;

ALTER TABLE candidate_document_requirements
  ADD CONSTRAINT fk_cand_doc_reqs_bgv_order
  FOREIGN KEY (bgv_order_id) REFERENCES bgv_orders(id) ON DELETE CASCADE;


CREATE TABLE bgv_order_components (
  id                    BIGSERIAL PRIMARY KEY,
  bgv_order_id          BIGINT NOT NULL REFERENCES bgv_orders(id) ON DELETE CASCADE,
  component_id          BIGINT NOT NULL REFERENCES bgv_components_catalog(id),
  instance_index        INTEGER NOT NULL DEFAULT 0,
  status                component_status_enum NOT NULL DEFAULT 'not_started',
  raw_input_json        JSONB,
  raw_result_json       JSONB,
  last_status_change_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (bgv_order_id, component_id, instance_index)
);

COMMENT ON TABLE bgv_order_components IS 'Per-order component instances and statuses.';

CREATE INDEX idx_bgv_order_components_order ON bgv_order_components (bgv_order_id);
CREATE INDEX idx_bgv_order_components_status ON bgv_order_components (status);


CREATE TABLE bgv_order_events (
  id                    BIGSERIAL PRIMARY KEY,
  bgv_order_id          BIGINT NOT NULL REFERENCES bgv_orders(id) ON DELETE CASCADE,
  component_id          BIGINT REFERENCES bgv_components_catalog(id),
  event_type            TEXT NOT NULL,
  event_source          TEXT NOT NULL, -- system, candidate, admin, client_user, vendor_webhook
  description           TEXT,
  payload_json          JSONB,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by_account_id BIGINT REFERENCES accounts(id)
);

COMMENT ON TABLE bgv_order_events IS 'Timeline of events per order.';

CREATE INDEX idx_bgv_order_events_order ON bgv_order_events (bgv_order_id, created_at);

-- =====================================================================
-- 7. DOCUMENTS
-- =====================================================================

CREATE TABLE candidate_documents (
  id                     BIGSERIAL PRIMARY KEY,
  candidate_id           BIGINT NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  bgv_order_id           BIGINT REFERENCES bgv_orders(id) ON DELETE SET NULL,
  document_type          TEXT NOT NULL,
  file_path              TEXT NOT NULL,
  mime_type              TEXT,
  status                 TEXT NOT NULL DEFAULT 'uploaded', -- draft, uploaded, approved, rejected
  uploaded_by_account_id BIGINT REFERENCES accounts(id),
  approved_by_admin_id   BIGINT REFERENCES accounts(id),
  approved_at            TIMESTAMPTZ,
  rejection_reason       TEXT,
  uploaded_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE candidate_documents IS 'Uploaded documents for candidate/orders.';

CREATE INDEX idx_candidate_documents_candidate ON candidate_documents (candidate_id);
CREATE INDEX idx_candidate_documents_order ON candidate_documents (bgv_order_id);

-- =====================================================================
-- 8. IDA INTEGRATION
-- =====================================================================

CREATE TABLE ida_job_roles (
  id                BIGSERIAL PRIMARY KEY,
  package_id        BIGINT NOT NULL REFERENCES bgv_packages(id) ON DELETE CASCADE,
  ida_job_role_id   BIGINT NOT NULL,
  ida_job_role_name TEXT,
  region            bgv_region_enum NOT NULL DEFAULT 'in',
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE (package_id, ida_job_role_id)
);

COMMENT ON TABLE ida_job_roles IS 'Mapping of local packages to IDA jobRoleIds.';


CREATE TABLE ida_cases (
  id                 BIGSERIAL PRIMARY KEY,
  bgv_order_id       BIGINT NOT NULL UNIQUE REFERENCES bgv_orders(id) ON DELETE CASCADE,
  ida_candidate_id   TEXT,
  ida_case_reference TEXT,
  overall_status     TEXT,
  raw_last_payload   JSONB,
  last_webhook_at    TIMESTAMPTZ,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE ida_cases IS 'IDA case reference per order.';

CREATE TRIGGER trg_ida_cases_set_timestamp
BEFORE UPDATE ON ida_cases
FOR EACH ROW EXECUTE FUNCTION set_timestamp();


CREATE TABLE ida_case_components (
  id                 BIGSERIAL PRIMARY KEY,
  ida_case_id        BIGINT NOT NULL REFERENCES ida_cases(id) ON DELETE CASCADE,
  component_code     TEXT,
  ida_component_id   TEXT,
  status             TEXT,
  raw_payload_json   JSONB,
  last_status_change_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE ida_case_components IS 'Component-level statuses returned by IDA for a case.';

CREATE INDEX idx_ida_case_components_case ON ida_case_components (ida_case_id);

-- =====================================================================
-- 9. BILLING, INVOICES, STRIPE
-- =====================================================================

CREATE TABLE billing_customers (
  id                    BIGSERIAL PRIMARY KEY,
  client_id             BIGINT NOT NULL UNIQUE REFERENCES clients(id) ON DELETE CASCADE,
  stripe_customer_id    TEXT NOT NULL,
  default_payment_method_id BIGINT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE billing_customers IS 'Mapping client -> Stripe Customer.';


CREATE TABLE billing_payment_methods (
  id                       BIGSERIAL PRIMARY KEY,
  billing_customer_id      BIGINT NOT NULL REFERENCES billing_customers(id) ON DELETE CASCADE,
  stripe_payment_method_id TEXT NOT NULL,
  type                     TEXT NOT NULL, -- card, ach, etc.
  brand                    TEXT,
  last4                    TEXT,
  exp_month                INTEGER,
  exp_year                 INTEGER,
  is_default               BOOLEAN NOT NULL DEFAULT FALSE,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE billing_payment_methods IS 'Saved Stripe payment methods (cards, etc.).';

CREATE INDEX idx_billing_payment_methods_customer ON billing_payment_methods (billing_customer_id);

CREATE TRIGGER trg_billing_payment_methods_set_timestamp
BEFORE UPDATE ON billing_payment_methods
FOR EACH ROW EXECUTE FUNCTION set_timestamp();


CREATE TABLE billing_orders (
  id                    BIGSERIAL PRIMARY KEY,
  client_id             BIGINT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  bgv_order_id          BIGINT NOT NULL UNIQUE REFERENCES bgv_orders(id) ON DELETE CASCADE,
  total_amount          NUMERIC(12,2) NOT NULL,
  currency              TEXT NOT NULL,
  pricing_snapshot_json JSONB NOT NULL,
  status                TEXT NOT NULL DEFAULT 'payment_pending', -- payment_pending, payment_succeeded, payment_failed, written_off
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE billing_orders IS 'Financial order linked 1:1 with bgv_orders.';

CREATE INDEX idx_billing_orders_client ON billing_orders (client_id);

CREATE TRIGGER trg_billing_orders_set_timestamp
BEFORE UPDATE ON billing_orders
FOR EACH ROW EXECUTE FUNCTION set_timestamp();


CREATE TABLE invoices (
  id                     BIGSERIAL PRIMARY KEY,
  client_id              BIGINT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  invoice_number         TEXT NOT NULL UNIQUE,
  billing_period_start   DATE,
  billing_period_end     DATE,
  issue_date             DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date               DATE,
  subtotal_amount        NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax_amount             NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_amount           NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency               TEXT NOT NULL,
  status                 invoice_status_enum NOT NULL DEFAULT 'draft',
  stripe_invoice_id      TEXT,
  autopay_attempted_at   TIMESTAMPTZ,
  autopay_last_error     TEXT,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE invoices IS 'Invoices issued to clients.';

CREATE INDEX idx_invoices_client_status ON invoices (client_id, status);

CREATE TRIGGER trg_invoices_set_timestamp
BEFORE UPDATE ON invoices
FOR EACH ROW EXECUTE FUNCTION set_timestamp();


CREATE TABLE invoice_line_items (
  id               BIGSERIAL PRIMARY KEY,
  invoice_id       BIGINT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  billing_order_id BIGINT REFERENCES billing_orders(id) ON DELETE SET NULL,
  description      TEXT NOT NULL,
  quantity         NUMERIC(12,2) NOT NULL DEFAULT 1,
  unit_price       NUMERIC(12,2) NOT NULL DEFAULT 0,
  amount           NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax_rate         NUMERIC(5,2),
  metadata_json    JSONB
);

COMMENT ON TABLE invoice_line_items IS 'Line items within an invoice.';

CREATE INDEX idx_invoice_line_items_invoice ON invoice_line_items (invoice_id);


CREATE TABLE invoice_payments (
  id                       BIGSERIAL PRIMARY KEY,
  invoice_id               BIGINT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  amount                   NUMERIC(12,2) NOT NULL,
  currency                 TEXT NOT NULL,
  payment_date             DATE NOT NULL,
  source                   TEXT NOT NULL, -- stripe, bank_transfer, manual, etc.
  stripe_payment_intent_id TEXT,
  stripe_charge_id         TEXT,
  reference                TEXT,
  recorded_by_admin_id     BIGINT REFERENCES accounts(id),
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE invoice_payments IS 'Payments applied against invoices.';

CREATE INDEX idx_invoice_payments_invoice ON invoice_payments (invoice_id);


CREATE TABLE client_transactions (
  id                  BIGSERIAL PRIMARY KEY,
  client_id           BIGINT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  type                TEXT NOT NULL, -- invoice_payment, refund, credit_note, adjustment
  amount              NUMERIC(12,2) NOT NULL,
  currency            TEXT NOT NULL,
  transaction_date    DATE NOT NULL,
  reference_id        TEXT,
  notes               TEXT,
  created_by_admin_id BIGINT REFERENCES accounts(id),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE client_transactions IS 'Ledger-style financial entries per client.';

CREATE INDEX idx_client_transactions_client ON client_transactions (client_id, transaction_date);

-- =====================================================================
-- 10. WEBHOOKS, AUDIT, JOBS
-- =====================================================================

CREATE TABLE webhook_events (
  id                        BIGSERIAL PRIMARY KEY,
  source_system             TEXT NOT NULL, -- ida, stripe, etc.
  event_type                TEXT NOT NULL,
  request_path              TEXT,
  headers_json              JSONB,
  payload_raw               JSONB,
  external_reference_ids_json JSONB,
  related_order_id          BIGINT REFERENCES bgv_orders(id) ON DELETE SET NULL,
  related_candidate_id      BIGINT REFERENCES candidates(id) ON DELETE SET NULL,
  processing_status         webhook_processing_status_enum NOT NULL DEFAULT 'pending',
  processing_error          TEXT,
  received_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at              TIMESTAMPTZ
);

COMMENT ON TABLE webhook_events IS 'Raw incoming events from external systems (IDA, Stripe, etc.).';

CREATE INDEX idx_webhook_events_source_status ON webhook_events (source_system, processing_status);


CREATE TABLE audit_logs (
  id                 BIGSERIAL PRIMARY KEY,
  actor_account_id   BIGINT REFERENCES accounts(id),
  action             TEXT NOT NULL,
  entity_type        TEXT NOT NULL,
  entity_id          BIGINT NOT NULL,
  changes_json       JSONB,
  ip_address         INET,
  user_agent         TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE audit_logs IS 'Generic audit log for key entity changes.';

CREATE INDEX idx_audit_logs_entity ON audit_logs (entity_type, entity_id);


CREATE TABLE job_queue (
  id             BIGSERIAL PRIMARY KEY,
  job_type       TEXT NOT NULL, -- send_email, call_vendor, generate_invoice, etc.
  payload_json   JSONB NOT NULL,
  priority       INTEGER NOT NULL DEFAULT 0,
  run_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status         TEXT NOT NULL DEFAULT 'queued', -- queued, running, completed, failed
  attempts       INTEGER NOT NULL DEFAULT 0,
  last_error     TEXT,
  last_run_at    TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE job_queue IS 'Background jobs for async processing.';

CREATE INDEX idx_job_queue_status_run_at ON job_queue (status, run_at);

CREATE TRIGGER trg_job_queue_set_timestamp
BEFORE UPDATE ON job_queue
FOR EACH ROW EXECUTE FUNCTION set_timestamp();


CREATE TABLE candidate_timeline_events (
  id             BIGSERIAL PRIMARY KEY,
  candidate_id   BIGINT NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  bgv_order_id   BIGINT REFERENCES bgv_orders(id) ON DELETE SET NULL,
  event_type     TEXT NOT NULL,
  description    TEXT,
  metadata_json  JSONB,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by     BIGINT REFERENCES accounts(id)
);

COMMENT ON TABLE candidate_timeline_events IS 'Combined candidate + order timeline for UX & compliance.';

CREATE INDEX idx_candidate_timeline_candidate ON candidate_timeline_events (candidate_id, created_at);

-- =====================================================================
-- 11. SAMPLE BUSINESS TRIGGER:
--     Auto-update bgv_orders.overall_status when all components completed
-- =====================================================================

CREATE OR REPLACE FUNCTION update_bgv_order_status_from_components()
RETURNS trigger AS $$
DECLARE
  total_count INT;
  open_count  INT;
  adverse_count INT;
BEGIN
  SELECT COUNT(*),
         COUNT(*) FILTER (WHERE status IN ('in_progress','queued','not_started','insufficient','unable_to_verify','discrepancy'))
  INTO total_count, open_count
  FROM bgv_order_components
  WHERE bgv_order_id = NEW.bgv_order_id;

  -- If any component has discrepancy or unable_to_verify, consider adverse
  SELECT COUNT(*)
  INTO adverse_count
  FROM bgv_order_components
  WHERE bgv_order_id = NEW.bgv_order_id
    AND status IN ('discrepancy','unable_to_verify');

  IF total_count = 0 THEN
    RETURN NEW;
  END IF;

  IF open_count = 0 THEN
    -- All components terminal
    IF adverse_count > 0 THEN
      UPDATE bgv_orders
        SET overall_status = 'adverse',
            completed_at = COALESCE(completed_at, NOW())
        WHERE id = NEW.bgv_order_id;
    ELSE
      UPDATE bgv_orders
        SET overall_status = 'clear',
            completed_at = COALESCE(completed_at, NOW())
        WHERE id = NEW.bgv_order_id;
    END IF;
  ELSE
    -- Still in progress
    UPDATE bgv_orders
      SET overall_status = 'in_progress'
      WHERE id = NEW.bgv_order_id
        AND overall_status NOT IN ('clear','adverse','closed','cancelled');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_bgv_order_components_status_change
AFTER INSERT OR UPDATE OF status ON bgv_order_components
FOR EACH ROW EXECUTE FUNCTION update_bgv_order_status_from_components();

-- =====================================================================
-- END OF SCHEMA
-- =====================================================================
