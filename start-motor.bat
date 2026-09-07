@echo off
:: =========================================================
:: AutoProd — Iniciador del Motor Local (Python / FastAPI)
:: Este script lanza el controlador desacoplado de la terminal.
:: Puedes cerrar esta ventana, el motor seguira corriendo.
:: =========================================================
setlocal

set PYTHON=python
set "WORKSPACE_PYTHON=%~dp0.autoprod\python\python.exe"
if exist "%WORKSPACE_PYTHON%" (
    set "PYTHON=%WORKSPACE_PYTHON%"
)

set "CONTROLADOR=%~dp0controlador"

echo.
echo  AutoProd Motor Local - Puerto 8000
echo  Motor de video, workspace y herramientas IA
echo.
echo  [INFO] Iniciando controlador en segundo plano...
echo  [INFO] Puedes cerrar esta ventana de forma segura.
echo.

start "" /B cmd /c "cd /d "%CONTROLADOR%" && "%PYTHON%" -m uvicorn main:app --host 127.0.0.1 --port 8000 >> "%CONTROLADOR%\motor.log" 2>&1"

ping 127.0.0.1 -n 3 >nul

powershell -Command "try { $r = Invoke-WebRequest -Uri 'http://127.0.0.1:8000/status' -TimeoutSec 3 -UseBasicParsing; Write-Host ' [OK] Motor iniciado correctamente en http://127.0.0.1:8000' } catch { Write-Host ' [WARN] Motor arrancando... revisa motor.log si no responde en 10s.' }"

echo.
echo  Log: %CONTROLADOR%\motor.log
echo.
endlocal
