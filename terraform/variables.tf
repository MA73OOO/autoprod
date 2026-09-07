# ----------------------------------------------------
# Variables Requeridas para Terraform (AutoProd)
# ----------------------------------------------------

variable "supabase_access_token" {
  description = "Token de acceso personal de Supabase (Generado en: supabase.com/dashboard/account/tokens)"
  type        = string
  sensitive   = true
}

variable "supabase_org_id" {
  description = "ID de la organización en Supabase donde se crearán los proyectos dev y prod"
  type        = string
}

variable "vercel_api_token" {
  description = "Token de acceso personal de Vercel (Generado en: vercel.com/account/tokens)"
  type        = string
  sensitive   = true
}

variable "vercel_project_name" {
  description = "Nombre del proyecto en Vercel"
  type        = string
  default     = "autoprod"
}

variable "custom_domain" {
  description = "Dominio principal comprado para producción (ej. autoprodai.com)"
  type        = string
  default     = "autoprodai.com"
}

variable "region" {
  description = "Región de AWS para desplegar las bases de datos de Supabase"
  type        = string
  default     = "us-east-1"
}

variable "db_password_dev" {
  description = "Contraseña fuerte para la base de datos de DESARROLLO (dev)"
  type        = string
  sensitive   = true
}

variable "db_password_prod" {
  description = "Contraseña fuerte para la base de datos de PRODUCCIÓN (prod)"
  type        = string
  sensitive   = true
}

variable "enable_vault_provisioner" {
  description = "Indica si se ejecuta el script local de vault vía psql automáticamente"
  type        = bool
  default     = false
}
