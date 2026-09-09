#!/bin/bash
# ==============================================================================
#                 ⚡ AUTOPROD AI - INSTALADOR DEL MOTOR LOCAL (macOS) ⚡
# ==============================================================================

echo "=============================================================================="
echo "                ⚡ AUTOPROD AI - INSTALADOR DEL MOTOR LOCAL (macOS) ⚡"
echo "=============================================================================="
echo ""
echo "Bienvenido al instalador del Motor Local de AutoProd para macOS."
echo ""

# 1. Seleccion de Carpeta Nativa de macOS con AppleScript
echo "[1/6] Selecciona la carpeta donde deseas instalar AutoProd..."
CHOSEN_DIR=$(osascript -e 'try
  POSIX path of (choose folder with prompt "Selecciona la carpeta donde deseas instalar AutoProd:")
on error
  return ""
end try' 2>/dev/null)

if [ -z "$CHOSEN_DIR" ]; then
    TARGET_DIR="$HOME/AutoProdAI"
    echo "No seleccionaste ninguna carpeta. Usando ruta por defecto: $TARGET_DIR"
else
    TARGET_DIR="$CHOSEN_DIR"
    echo "Carpeta seleccionada: $TARGET_DIR"
fi

# Asegurar subcarpeta AutoProdAI
if [[ "$TARGET_DIR" != *"AutoProdAI"* ]]; then
    INSTALL_DIR="$TARGET_DIR/AutoProdAI"
else
    INSTALL_DIR="$TARGET_DIR"
fi

echo ""
echo "[2/6] Creando estructura de directorios en: $INSTALL_DIR"
mkdir -p "$INSTALL_DIR/bin"
mkdir -p "$INSTALL_DIR/motor"
mkdir -p "$INSTALL_DIR/workspace"

# Copiar archivos del motor si existen localmente
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
if [ -d "$SCRIPT_DIR/../../controlador" ]; then
    echo "Copiando archivos del motor local..."
    cp -r "$SCRIPT_DIR/../../controlador/"* "$INSTALL_DIR/motor/"
elif [ -d "$SCRIPT_DIR/motor" ]; then
    cp -r "$SCRIPT_DIR/motor/"* "$INSTALL_DIR/motor/"
fi

# 3. Descarga de Binarios Portables para macOS
echo ""
echo "[3/6] Verificando binarios portables (FFmpeg y yt-dlp)..."

if [ ! -f "$INSTALL_DIR/bin/yt-dlp" ]; then
    echo "Descargando yt-dlp..."
    curl -sL "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_macos" -o "$INSTALL_DIR/bin/yt-dlp"
    chmod +x "$INSTALL_DIR/bin/yt-dlp"
fi

if [ ! -f "$INSTALL_DIR/bin/ffmpeg" ]; then
    echo "Descargando FFmpeg para macOS..."
    curl -sL "https://evermeet.cx/ffmpeg/ffmpeg-6.0.zip" -o "$INSTALL_DIR/bin/ffmpeg.zip"
    unzip -q -o "$INSTALL_DIR/bin/ffmpeg.zip" -d "$INSTALL_DIR/bin/"
    rm -f "$INSTALL_DIR/bin/ffmpeg.zip"
    chmod +x "$INSTALL_DIR/bin/ffmpeg" 2>/dev/null
fi

# 4. Configuracion de Python y Virtualenv
echo ""
echo "[4/6] Verificando entorno de Python..."
PYTHON_CMD="python3"
if ! command -v python3 &> /dev/null; then
    echo "⚠️ Python 3 no se encontró. Por favor instala Python o ejecuta 'xcode-select --install'"
    exit 1
fi

echo "Creando entorno virtual aislado (venv)..."
if [ ! -d "$INSTALL_DIR/venv" ]; then
    $PYTHON_CMD -m venv "$INSTALL_DIR/venv"
fi

echo "Instalando dependencias del motor local..."
source "$INSTALL_DIR/venv/bin/activate"
pip install --upgrade pip --quiet
if [ -f "$INSTALL_DIR/motor/requirements.txt" ]; then
    pip install -r "$INSTALL_DIR/motor/requirements.txt" --quiet
else
    pip install fastapi uvicorn pydantic requests --quiet
fi

# 5. Generacion de Archivo de Configuracion y Lanzador
echo ""
echo "[5/6] Generando configuracion y lanzador..."

cat <<EOF > "$INSTALL_DIR/.autoprod-config.json"
{
  "basePath": "$INSTALL_DIR/workspace",
  "binPath": "$INSTALL_DIR/bin",
  "version": "1.0.0"
}
EOF

cat <<'EOF' > "$INSTALL_DIR/start_motor.sh"
#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"
export PATH="$DIR/bin:$PATH"
source "$DIR/venv/bin/activate"
echo "==================================================="
echo "      ⚡ AUTOPROD MOTOR LOCAL EN EJECUCION ⚡"
echo "      Puerto: http://127.0.0.1:8000"
echo "==================================================="
cd motor
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
EOF

chmod +x "$INSTALL_DIR/start_motor.sh"

# 6. Iniciar el Motor Local y Abrir el Navegador
echo ""
echo "[6/6] ✅ Instalacion completada exitosamente!"
echo "Iniciando el Motor Local en segundo plano..."

nohup "$INSTALL_DIR/start_motor.sh" > "$INSTALL_DIR/motor.log" 2>&1 &

sleep 2

echo "Abriendo AutoProd en tu navegador..."
open "https://autoprod.io/dashboard" 2>/dev/null || open "http://localhost:3000/dashboard"

echo ""
echo "=============================================================================="
echo " ¡TODO LISTO! Tu Motor Local de AutoProd ya esta corriendo y conectado."
echo "=============================================================================="
