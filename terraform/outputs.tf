output "supabase_dev_id" {
  description = "ID del proyecto Supabase DEV"
  value       = supabase_project.dev.id
}

output "supabase_prod_id" {
  description = "ID del proyecto Supabase PROD"
  value       = supabase_project.prod.id
}

output "supabase_dev_url" {
  description = "URL de la API de Supabase DEV"
  value       = "https://${supabase_project.dev.id}.supabase.co"
}

output "supabase_prod_url" {
  description = "URL de la API de Supabase PROD"
  value       = "https://${supabase_project.prod.id}.supabase.co"
}

output "production_domain" {
  description = "Dominio principal configurado en Vercel"
  value       = vercel_project_domain.production_domain.domain
}
