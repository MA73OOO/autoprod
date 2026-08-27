import subprocess
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import shlex

router = APIRouter(
    prefix="/chat",
    tags=["Chat"],
)

class ChatRequest(BaseModel):
    prompt: str
    command_template: str

@router.post("/ask")
def ask_console_ai(request: ChatRequest):
    """
    Toma un bloque de texto y lo inyecta en el comando de consola especificado.
    Ejecuta el comando de manera sincrónica y devuelve lo que la consola imprime (stdout).
    """
    if "{prompt}" not in request.command_template:
        raise HTTPException(
            status_code=400, 
            detail="El comando debe contener la variable {prompt}"
        )
    
    # Preparar el comando escapando de manera segura el prompt
    # Si el usuario tiene comillas en su plantilla rodeando {prompt}, shlex.quote ya las pone,
    # así que la forma correcta es reemplazar {prompt} directo.
    # Para evitar dobles comillas, recomendamos que el template sea: gemini-cli ask {prompt}
    
    # En Windows, shlex.quote a veces no escapa perfectamente para cmd, 
    # pero para comandos simples o shells cruzados es el estándar.
    safe_prompt = shlex.quote(request.prompt)
    
    command = request.command_template.replace("{prompt}", safe_prompt)
    
    try:
        # Ejecutar el comando en una shell
        # shell=True permite usar comandos como 'echo' nativos en Windows/Mac
        # capture_output=True captura stdout y stderr
        result = subprocess.run(
            command, 
            shell=True, 
            capture_output=True, 
            text=True, 
            timeout=120 # Timeout de 2 minutos para que no se cuelgue infinito
        )
        
        if result.returncode != 0:
            error_msg = result.stderr.strip() or result.stdout.strip()
            raise HTTPException(
                status_code=500, 
                detail=f"Error en la consola: {error_msg}"
            )
            
        return {"response": result.stdout.strip()}
        
    except subprocess.TimeoutExpired:
        raise HTTPException(
            status_code=504, 
            detail="El comando tardó demasiado tiempo en responder (Timeout)."
        )
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error ejecutando consola: {str(e)}"
        )


@router.get("/detect_clis")
def detect_clis():
    """
    Escanea el sistema (PATH) en busca de herramientas CLI conocidas.
    Hace un 'ping' rápido para ver si están autenticadas.
    """
    import shutil
    import subprocess
    
    known_clis = [
        {
            "id": "ollama",
            "name": "Ollama (Local)", 
            "bin": "ollama", 
            "template": 'ollama run llama3 "{prompt}"',
            "ping_cmd": "ollama list",
            "auth_cmd": None
        },
        {
            "id": "gemini",
            "name": "Google Gemini", 
            "bin": "gemini", 
            "template": 'gemini ask "{prompt}"',
            "ping_cmd": 'gemini ask "hola"',
            "auth_cmd": "gemini auth"
        },
        {
            "id": "gemini-node",
            "name": "Google Gemini (Node)", 
            "bin": "gemini-cli", 
            "template": 'gemini-cli ask "{prompt}"',
            "ping_cmd": 'gemini-cli ask "ping"',
            "auth_cmd": "gemini-cli auth"
        },
        {
            "id": "chatgpt",
            "name": "OpenAI ChatGPT", 
            "bin": "chatgpt", 
            "template": 'chatgpt -p "{prompt}"',
            "ping_cmd": 'chatgpt -p "hi"',
            "auth_cmd": "chatgpt auth"
        }
    ]
    
    import os
    import platform
    import urllib.request
    
    detected = []
    for cli in known_clis:
        bin_path = shutil.which(cli["bin"])
        
        # Fallback para Ollama en Windows si no está en el PATH
        if not bin_path and cli["id"] == "ollama" and platform.system() == "Windows":
            fallback_path = os.path.expanduser('~\\AppData\\Local\\Programs\\Ollama\\ollama.exe')
            if os.path.exists(fallback_path):
                bin_path = fallback_path
                cli["ping_cmd"] = f'"{fallback_path}" list'
                cli["template"] = cli["template"].replace('ollama run', f'"{fallback_path}" run')

        # Si seguimos sin binario pero es ollama, intentemos ver si el servicio web está corriendo
        ollama_running_http = False
        if cli["id"] == "ollama":
            def check_http():
                import urllib.error
                try:
                    response = urllib.request.urlopen("http://127.0.0.1:11434/", timeout=1)
                    return response.status == 200
                except urllib.error.HTTPError:
                    return True
                except Exception:
                    return False
            
            ollama_running_http = check_http()
            
            # Intento de despertar automático (Versión 2)
            if not ollama_running_http and bin_path:
                try:
                    # Lanzar 'ollama serve' en segundo plano de manera silenciosa
                    import time
                    subprocess.Popen([bin_path, "serve"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                    time.sleep(2.0) # Darle tiempo al servidor local para levantar
                    ollama_running_http = check_http()
                except Exception as e:
                    pass

        if bin_path or ollama_running_http:
            is_auth = True
            if not ollama_running_http and cli["ping_cmd"]:
                try:
                    res = subprocess.run(
                        cli["ping_cmd"], 
                        shell=True, 
                        capture_output=True, 
                        text=True, 
                        timeout=5
                    )
                    output = (res.stdout + res.stderr).lower()
                    if res.returncode != 0 or "unauthorized" in output or "login" in output:
                        is_auth = False
                except:
                    is_auth = False
                    
            cli["is_authenticated"] = is_auth
            detected.append(cli)
            
    return {"detected": detected}

@router.post("/auth/{provider_id}")
def auth_cli(provider_id: str):
    """
    Abre una terminal externa para que el usuario inicie sesión interactivamente.
    """
    import subprocess
    import platform

    auth_cmds = {
        "gemini": "gemini auth",
        "gemini-node": "gemini-cli auth",
        "chatgpt": "chatgpt auth"
    }

    cmd = auth_cmds.get(provider_id)
    if not cmd:
        raise HTTPException(status_code=400, detail="Comando de auth no definido para este proveedor")

    try:
        if platform.system() == "Windows":
            subprocess.Popen(f'start cmd /k "echo ============================== && echo INICIO DE SESION IA && echo ============================== && echo. && {cmd} && echo. && echo Puedes cerrar esta ventana cuando termines. && pause > nul"', shell=True)
        elif platform.system() == "Darwin":
            subprocess.Popen(f'osascript -e \'tell app "Terminal" to do script "{cmd}"\'', shell=True)
        else:
            subprocess.Popen(f'x-terminal-emulator -e "{cmd}"', shell=True)
            
        return {"status": "success", "message": "Ventana de autenticación abierta"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

