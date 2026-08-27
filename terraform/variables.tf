# ----------------------------------------------------
# Variables Requeridas para Terraform
# (Estas NO se suben a Git con sus valores reales, se definen en un terraform.tfvars o CLI)
# ----------------------------------------------------

variable "supabase_access_token" {
  description = "Token de acceso personal de Supabase (Generado en la web de Supabase)"
  type        = string
  sensitive   = true
}

variable "vercel_api_token" {
  description = "Token de acceso personal de Vercel"
  type        = string
  sensitive   = true
}

variable "supabase_org_id" {
  description = "ID de la organización en Supabase donde se creará el proyecto"
  type        = string
}

variable "db_password_dev" {
  description = "Contraseña fuerte para la base de datos DEV"
  type        = string
  sensitive   = true
}
