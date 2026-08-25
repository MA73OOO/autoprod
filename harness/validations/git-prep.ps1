# Validación de estado de Git antes de producción
Write-Host "Verificando estado del espacio de trabajo de Git..." -ForegroundColor Cyan

if (!(git rev-parse --is-inside-work-tree 2>$null)) {
    Write-Host "[ERROR] Este directorio no es un repositorio de Git activo." -ForegroundColor Red
    Exit 1
}

$status = git status --porcelain
if ($status) {
    Write-Host "[ADVERTENCIA] Tienes cambios sin confirmar (uncommitted changes) en tu repositorio:" -ForegroundColor Yellow
    Write-Host $status
} else {
    Write-Host "[OK] El espacio de trabajo de Git está limpio." -ForegroundColor Green
}

Exit 0
