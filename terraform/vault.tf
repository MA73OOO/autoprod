# ----------------------------------------------------
# Aprovisionamiento Opcional de Supabase Vault
# (Requiere 'psql' en PATH si enable_vault_provisioner = true)
# Alternativamente, puedes copiar supabase_vault_setup.sql 
# y pegarlo en el SQL Editor del dashboard de Supabase (dev y prod).
# ----------------------------------------------------

resource "null_resource" "setup_supabase_vault_dev" {
  count      = var.enable_vault_provisioner ? 1 : 0
  depends_on = [supabase_project.dev]

  triggers = {
    script_hash = filemd5("${path.module}/../supabase_vault_setup.sql")
  }

  provisioner "local-exec" {
    command = "psql \"postgresql://postgres.${supabase_project.dev.id}:${var.db_password_dev}@aws-0-${supabase_project.dev.region}.pooler.supabase.com:5432/postgres\" -f ${path.module}/../supabase_vault_setup.sql"
  }
}

resource "null_resource" "setup_supabase_vault_prod" {
  count      = var.enable_vault_provisioner ? 1 : 0
  depends_on = [supabase_project.prod]

  triggers = {
    script_hash = filemd5("${path.module}/../supabase_vault_setup.sql")
  }

  provisioner "local-exec" {
    command = "psql \"postgresql://postgres.${supabase_project.prod.id}:${var.db_password_prod}@aws-0-${supabase_project.prod.region}.pooler.supabase.com:5432/postgres\" -f ${path.module}/../supabase_vault_setup.sql"
  }
}
