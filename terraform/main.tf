terraform {
  required_providers {
    supabase = {
      source  = "supabase/supabase"
      version = "~> 1.2"
    }
    vercel = {
      source  = "vercel/vercel"
      version = "~> 1.14"
    }
  }
}

# ----------------------------------------------------
# Proveedores (Autenticación con las APIs)
# ----------------------------------------------------
provider "supabase" {
  access_token = var.supabase_access_token
}

provider "vercel" {
  api_token = var.vercel_api_token
}

# ----------------------------------------------------
# 1. Proyectos en Supabase (DEV y PROD aislados)
# ----------------------------------------------------

# Entorno de Desarrollo y Pruebas
resource "supabase_project" "dev" {
  organization_id   = var.supabase_org_id
  name              = "autoprod-dev"
  database_password = var.db_password_dev
  region            = var.region
}

# Entorno de Producción (Usuarios Reales)
resource "supabase_project" "prod" {
  organization_id   = var.supabase_org_id
  name              = "autoprod-prod"
  database_password = var.db_password_prod
  region            = var.region
}

# ----------------------------------------------------
# 2. Proyecto en Vercel
# ----------------------------------------------------
data "vercel_project" "autoprod" {
  name = var.vercel_project_name
}

# ----------------------------------------------------
# 3. Inyección de Variables en Vercel: PRODUCCIÓN
# (Aplica cuando haces merge/commit en master/main)
# ----------------------------------------------------

resource "vercel_project_environment_variable" "prod_db_url" {
  project_id = data.vercel_project.autoprod.id
  key        = "DATABASE_URL"
  value      = "postgresql://postgres.${supabase_project.prod.id}:${var.db_password_prod}@aws-0-${supabase_project.prod.region}.pooler.supabase.com:6543/postgres?pgbouncer=true"
  target     = ["production"]
}

resource "vercel_project_environment_variable" "prod_direct_url" {
  project_id = data.vercel_project.autoprod.id
  key        = "DIRECT_URL"
  value      = "postgresql://postgres.${supabase_project.prod.id}:${var.db_password_prod}@aws-0-${supabase_project.prod.region}.pooler.supabase.com:5432/postgres"
  target     = ["production"]
}

resource "vercel_project_environment_variable" "prod_supabase_url" {
  project_id = data.vercel_project.autoprod.id
  key        = "NEXT_PUBLIC_SUPABASE_URL"
  value      = "https://${supabase_project.prod.id}.supabase.co"
  target     = ["production"]
}

resource "vercel_project_environment_variable" "prod_supabase_anon_key" {
  project_id = data.vercel_project.autoprod.id
  key        = "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  value      = supabase_project.prod.anon_key
  target     = ["production"]
}

resource "vercel_project_environment_variable" "prod_app_url" {
  project_id = data.vercel_project.autoprod.id
  key        = "NEXT_PUBLIC_APP_URL"
  value      = "https://${var.custom_domain}"
  target     = ["production"]
}

# ----------------------------------------------------
# 4. Inyección de Variables en Vercel: DESARROLLO Y PREVIEWS
# (Aplica en ramas secundarias, PRs y desarrollo local con vercel env pull)
# ----------------------------------------------------

resource "vercel_project_environment_variable" "dev_db_url" {
  project_id = data.vercel_project.autoprod.id
  key        = "DATABASE_URL"
  value      = "postgresql://postgres.${supabase_project.dev.id}:${var.db_password_dev}@aws-0-${supabase_project.dev.region}.pooler.supabase.com:6543/postgres?pgbouncer=true"
  target     = ["development", "preview"]
}

resource "vercel_project_environment_variable" "dev_direct_url" {
  project_id = data.vercel_project.autoprod.id
  key        = "DIRECT_URL"
  value      = "postgresql://postgres.${supabase_project.dev.id}:${var.db_password_dev}@aws-0-${supabase_project.dev.region}.pooler.supabase.com:5432/postgres"
  target     = ["development", "preview"]
}

resource "vercel_project_environment_variable" "dev_supabase_url" {
  project_id = data.vercel_project.autoprod.id
  key        = "NEXT_PUBLIC_SUPABASE_URL"
  value      = "https://${supabase_project.dev.id}.supabase.co"
  target     = ["development", "preview"]
}

resource "vercel_project_environment_variable" "dev_supabase_anon_key" {
  project_id = data.vercel_project.autoprod.id
  key        = "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  value      = supabase_project.dev.anon_key
  target     = ["development", "preview"]
}

resource "vercel_project_environment_variable" "dev_app_url" {
  project_id = data.vercel_project.autoprod.id
  key        = "NEXT_PUBLIC_APP_URL"
  value      = "https://dev.${var.custom_domain}"
  target     = ["development", "preview"]
}

# ----------------------------------------------------
# 5. Configuración del Dominio Personalizado en Vercel
# ----------------------------------------------------

# Dominio Apex (ej. autoprodai.com)
resource "vercel_project_domain" "production_domain" {
  project_id = data.vercel_project.autoprod.id
  domain     = var.custom_domain
}

# Redirección de www hacia el dominio principal con código 308 (Permanente)
resource "vercel_project_domain" "production_www" {
  project_id           = data.vercel_project.autoprod.id
  domain               = "www.${var.custom_domain}"
  redirect             = vercel_project_domain.production_domain.domain
  redirect_status_code = 308
}
