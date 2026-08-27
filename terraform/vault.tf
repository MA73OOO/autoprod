resource "null_resource" "setup_supabase_vault" {
  depends_on = [supabase_project.dev]

  # Se volverá a ejecutar solo si cambias el archivo SQL
  triggers = {
    script_hash = filemd5("${path.module}/../supabase_vault_setup.sql")
  }

  provisioner "local-exec" {
    # Usamos la URL directa (puerto 5432) para correr comandos administrativos/DDL
    command = "psql \"postgresql://postgres.${supabase_project.dev.id}:${var.db_password_dev}@aws-0-${supabase_project.dev.region}.pooler.supabase.com:5432/postgres\" -f ${path.module}/../supabase_vault_setup.sql"
  }
}
