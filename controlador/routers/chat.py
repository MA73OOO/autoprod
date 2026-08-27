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
        }
    ]
    
    detected = []
    for cli in known_clis:
        if shutil.which(cli["bin"]):
            is_auth = True
            if cli["ping_cmd"]:
                try:
                    # Ping rápido invisible
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
    
    detected = []
    for cli in known_clis:
        if shutil.which(cli["bin"]):
            is_auth = True
            if cli["ping_cmd"]:
                try:
                    # Ping rápido invisible
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

