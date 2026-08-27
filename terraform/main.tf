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
# 1. Creación del Proyecto en Supabase (Entorno DEV)
# ----------------------------------------------------
resource "supabase_project" "dev" {
  organization_id   = var.supabase_org_id
  name              = "autoprod-dev"
  database_password = var.db_password_dev
  region            = "us-east-1"
  
  # Opcional: Configuración del tamaño de instancia si tuvieras un plan Pro
  # instance_size = "micro"
}

# ----------------------------------------------------
# 2. Configuración del Proyecto en Vercel
# ----------------------------------------------------
# (Referenciamos un proyecto que ya existe o lo creamos)
data "vercel_project" "autoprod" {
  name = "autoprod"
}

# ----------------------------------------------------
# 3. Inyección de Variables de Entorno en Vercel (DEV/PREVIEW)
# ----------------------------------------------------
# Nota: Supabase Terraform Provider no expone las contraseñas ni ciertas URLs directamente 
# por seguridad, así que construimos la URL basados en la salida del proyecto.

resource "vercel_project_environment_variable" "dev_db_url" {
  project_id = data.vercel_project.autoprod.id
  key        = "DATABASE_URL"
  # URL construida con pgBouncer (puerto 6543)
  value      = "postgresql://postgres.${supabase_project.dev.id}:${var.db_password_dev}@aws-0-${supabase_project.dev.region}.pooler.supabase.com:6543/postgres?pgbouncer=true"
  target     = ["development", "preview"]
}

resource "vercel_project_environment_variable" "dev_direct_url" {
  project_id = data.vercel_project.autoprod.id
  key        = "DIRECT_URL"
  # URL directa (puerto 5432)
  value      = "postgresql://postgres.${supabase_project.dev.id}:${var.db_password_dev}@aws-0-${supabase_project.dev.region}.pooler.supabase.com:5432/postgres"
  target     = ["development", "preview"]
}

resource "vercel_project_environment_variable" "dev_supabase_url" {
  project_id = data.vercel_project.autoprod.id
  key        = "NEXT_PUBLIC_SUPABASE_URL"
  value      = "https://${supabase_project.dev.id}.supabase.co"
  target     = ["development", "preview"]
}

# La llave anónima se recupera a través de la API del proyecto
resource "vercel_project_environment_variable" "dev_supabase_anon_key" {
  project_id = data.vercel_project.autoprod.id
  key        = "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  value      = supabase_project.dev.anon_key
  target     = ["development", "preview"]
}
