# Validación de Variables de Entorno
Write-Host "Verificando variables de entorno necesarias para la aplicación..." -ForegroundColor Cyan

$requiredVars = @(
    "DATABASE_URL", 
    "DIRECT_URL", 
    "NEXT_PUBLIC_SUPABASE_URL", 
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
)
$missingVars = @()

foreach ($var in $requiredVars) {
    if ([string]::IsNullOrEmpty([System.Environment]::GetEnvironmentVariable($var)) -and [string]::IsNullOrEmpty($env:$var)) {
        $missingVars += $var
    }
}

if ($missingVars.Count -gt 0) {
    Write-Host "[ERROR] Faltan las siguientes variables de entorno requeridas:" -ForegroundColor Red
    foreach ($var in $missingVars) {
        Write-Host "  - $var" -ForegroundColor Yellow
    }
    Exit 1
} else {
    Write-Host "[OK] Todas las variables de entorno están correctamente configuradas." -ForegroundColor Green
    Exit 0
}
