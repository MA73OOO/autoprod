@echo off
setlocal enabledelayedexpansion

title AutoProd - Compilador del Motor Local con PyInstaller

echo ==============================================================================
echo                 AUTOPROD - COMPILADOR A EJECUTABLE (.EXE)
echo ==============================================================================
echo.

set "SCRIPT_DIR=%~dp0"
set "REPO_ROOT=%SCRIPT_DIR%.."
set "CONTROLADOR_DIR=%REPO_ROOT%\controlador"

echo [1/3] Verificando entorno de Python y PyInstaller...
python -m pip install --upgrade pip
python -m pip install pyinstaller -r "%CONTROLADOR_DIR%\requirements.txt"

echo.
echo [2/3] Compilando motor local con PyInstaller...
cd /d "%CONTROLADOR_DIR%"

python -m PyInstaller --noconfirm --clean --onefile ^
  --name "autoprod-motor" ^
  --collect-all uvicorn ^
  --collect-all fastapi ^
  --collect-all pydantic ^
  --collect-all requests ^
  --hidden-import "routers.workspace" ^
  --hidden-import "routers.chat" ^
  --hidden-import "routers.ollama_manager" ^
  --hidden-import "routers.video_looper" ^
  --hidden-import "routers.subtitles" ^
  --hidden-import "hardware.governor" ^
  main.py

if errorlevel 1 (
    echo.
    echo [ERROR] La compilacion ha fallado. Revisa los mensajes anteriores.
    pause
    exit /b 1
)

echo.
echo [3/3] Copiando binario final a la carpeta dist principal...
if not exist "%REPO_ROOT%\dist" mkdir "%REPO_ROOT%\dist"
copy /y "%CONTROLADOR_DIR%\dist\autoprod-motor.exe" "%REPO_ROOT%\dist\autoprod-motor.exe" >nul

echo.
echo ==============================================================================
echo  COMPILACION EXITOSA!
echo  Ejecutable generado en: %REPO_ROOT%\dist\autoprod-motor.exe
echo ==============================================================================
echo.
pause
