-- ==============================================================================
-- AutoProd: Configuración Inicial de Supabase Vault & Helper Functions
-- ==============================================================================

-- 1. Habilitar extensiones necesarias
create extension if not exists supabase_vault cascade;
create extension if not exists pgcrypto;

-- 2. Función RPC para almacenar una API Key cifrada en Vault y asociarla al usuario
create or replace function public.save_api_key(
    p_user_id text,
    p_provider text,
    p_api_key text
)
returns uuid
language plpgsql
security definer
as $$
declare
    v_secret_id uuid;
    v_secret_name text;
begin
    v_secret_name := p_provider || '_' || p_user_id;

    -- Guardar o actualizar en Vault
    v_secret_id := vault.create_secret(
        secret => p_api_key,
        name => v_secret_name,
        description => 'API Key de ' || p_provider || ' para usuario ' || p_user_id
    );

    -- Actualizar el ID del secreto en la tabla public.user
    if lower(p_provider) = 'openai' or lower(p_provider) = 'chatgpt' then
        update public."user" set "openaiVaultId" = v_secret_id::text where id = p_user_id;
    elsif lower(p_provider) = 'gemini' or lower(p_provider) = 'google' then
        update public."user" set "geminiVaultId" = v_secret_id::text where id = p_user_id;
    elsif lower(p_provider) = 'anthropic' or lower(p_provider) = 'claude' then
        update public."user" set "anthropicVaultId" = v_secret_id::text where id = p_user_id;
    end if;

    return v_secret_id;
end;
$$;

-- 3. Función RPC para obtener el secreto desencriptado dado su ID
create or replace function public.get_decrypted_secret(
    p_secret_id uuid
)
returns text
language plpgsql
security definer
as $$
declare
    v_decrypted text;
begin
    select decrypted_secret into v_decrypted
    from vault.decrypted_secrets
    where id = p_secret_id
    limit 1;

    return v_decrypted;
end;
$$;
