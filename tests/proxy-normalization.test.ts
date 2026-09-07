import 'dotenv/config';

/**
 * Suite de Pruebas: Normalización de Argumentos de IA en Proxy (Next.js -> FastAPI)
 * Simula y valida cómo el proxy adapta las variaciones de parámetros generadas por el LLM.
 */

function normalizeArgs(toolName: string, args: any, effectiveWorkspaceRoot: string) {
  const payload: any = { ...args };

  if (toolName === 'crear_carpetas') {
    if (Array.isArray(payload.folder_name)) {
      payload.folders = payload.folder_name;
      delete payload.folder_name;
    }
    if (!payload.folders && (payload.carpetas || payload.folder_names || payload.nombres)) {
      payload.folders = payload.carpetas || payload.folder_names || payload.nombres;
    }
    if (!payload.paths && payload.rutas) {
      payload.paths = payload.rutas;
    }
    if (!payload.subfolders && payload.subcarpetas) {
      payload.subfolders = payload.subcarpetas;
    }
    if (payload.channel && !payload.channel_name) {
      payload.channel_name = payload.channel;
    }
    if (payload.canal && !payload.channel_name) {
      payload.channel_name = payload.canal;
    }
    if (!payload.target_path && !payload.paths) {
      if (payload.channel_name) {
        payload.target_path = payload.channel_name;
      } else {
        payload.target_path = effectiveWorkspaceRoot;
      }
    }
  }

  if (toolName === 'eliminar_carpetas') {
    const channelName = payload.channel_name ?? payload.canal ?? payload.channel ?? null;
    if (channelName) payload.channel_name = String(channelName);

    const collectedPaths: string[] = [];
    const candidateArrays = [payload.paths, payload.rutas, payload.folders, payload.carpetas];
    for (const arr of candidateArrays) {
      if (Array.isArray(arr)) {
        for (const item of arr) {
          if (item && typeof item === 'string' && item.trim()) {
            collectedPaths.push(item.trim());
          }
        }
      }
    }

    const singleCandidates = [
      payload.ruta, payload.path, payload.target_path, payload.folder_path,
      payload.folder_name, payload.folder, payload.name, payload.carpeta
    ];
    for (const cand of singleCandidates) {
      if (cand && typeof cand === 'string' && cand.trim()) {
        if (!collectedPaths.includes(cand.trim())) {
          collectedPaths.push(cand.trim());
        }
      }
    }

    if (collectedPaths.length > 0) {
      const cleanList = collectedPaths.map(p => {
        let c = p.replace(/\\/g, '/');
        const isAbs = c.startsWith('/') || /^[a-zA-Z]:\//.test(c);
        if (!isAbs && effectiveWorkspaceRoot && !payload.channel_name) {
          c = `${effectiveWorkspaceRoot}/${c}`.replace(/\\/g, '/');
        }
        return c;
      });

      payload.paths = cleanList;
      if (cleanList.length === 1) {
        payload.ruta = cleanList[0];
      }
    }
  }

  return payload;
}

async function runSimulation() {
  const wsRoot = 'E:/AutoProdAI/youtube';

  console.log('=== TEST 1: LLM envía crear_carpetas con array en folder_name ===');
  const argsCreate1 = {
    channel_name: 'SimulacionCanal',
    folder_name: ['Videos', 'Guiones', 'Recursos']
  };
  const normCreate1 = normalizeArgs('crear_carpetas', argsCreate1, wsRoot);
  console.log('Payload normalizado:', normCreate1);
  const resCreate1 = await fetch('http://127.0.0.1:8000/workspace/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(normCreate1)
  });
  console.log('Respuesta creación:', resCreate1.status, await resCreate1.json());

  console.log('\n=== TEST 2: LLM envía eliminar_carpetas con canal y folder_name simple ===');
  const argsDelete1 = {
    channel_name: 'SimulacionCanal',
    folder_name: 'Videos'
  };
  const normDelete1 = normalizeArgs('eliminar_carpetas', argsDelete1, wsRoot);
  console.log('Payload normalizado:', normDelete1);
  const resDelete1 = await fetch('http://127.0.0.1:8000/workspace/delete_folder', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(normDelete1)
  });
  console.log('Respuesta eliminación individual:', resDelete1.status, await resDelete1.json());

  console.log('\n=== TEST 3: LLM envía eliminar_carpetas con alias en español (canal, carpetas: [...]) ===');
  const argsDelete2 = {
    canal: 'SimulacionCanal',
    carpetas: ['Guiones', 'Recursos']
  };
  const normDelete2 = normalizeArgs('eliminar_carpetas', argsDelete2, wsRoot);
  console.log('Payload normalizado:', normDelete2);
  const resDelete2 = await fetch('http://127.0.0.1:8000/workspace/delete_folder', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(normDelete2)
  });
  console.log('Respuesta eliminación múltiple:', resDelete2.status, await resDelete2.json());

  console.log('\n=== TEST 4: LLM solicita eliminar el canal entero (solo channel_name) ===');
  const argsDelete3 = {
    channel_name: 'SimulacionCanal'
  };
  const normDelete3 = normalizeArgs('eliminar_carpetas', argsDelete3, wsRoot);
  console.log('Payload normalizado:', normDelete3);
  const resDelete3 = await fetch('http://127.0.0.1:8000/workspace/delete_folder', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(normDelete3)
  });
  console.log('Respuesta eliminación de canal:', resDelete3.status, await resDelete3.json());

  console.log('\n🎉 Todos los casos de simulación de proxy y LLM se ejecutaron con éxito.');
}

runSimulation().catch(console.error);
