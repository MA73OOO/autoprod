import fs from 'fs';

const content = `# Estructura Rígida de AutoProd (Plantilla Global)

Esta es la estructura obligatoria para la creación de cualquier canal y video en este workspace. Ollama y Gemini deben seguir estrictamente estas rutas para asegurar la comunicación entre APIs.

## Nivel Canal
Cada canal generado debe contener:
- \`ConfigCanal.md\`: Contiene toda la información del canal de youtube (Temática general, tono, audiencia, descripciones SEO).
- \`Prompts.md\`: Prompts visuales maestros (Miniaturas, banners) si el usuario lo solicita.

## Nivel Video
Dentro de cada canal, los videos deben seguir esta sub-estructura:
\`\`\`text
CarpetaVideo1/
├── Videos/     (Renders finales, clips de video)
├── Imagenes/   (Miniaturas, assets visuales)
├── Musica/     (Pistas de audio, efectos de sonido)
├── loop/       (Material de fondo en loop, animaciones continuas)
├── guion/      (Guiones de voz en off, escaletas)
├── Prompts/    (Prompts específicos del video para IA generativa)
└── ideavideo.md (Archivo maestro con la idea original y metadatos del video)
\`\`\`

> NOTA PARA LA IA: Esta estructura es universal. No aplica solo para "canales de dormir", sino para canales educativos, de tecnología, entretenimiento o cualquier otro nicho general. Eres libre de usar o ignorar subcarpetas según lo requiera el video, pero si vas a guardar un activo, DEBE ir en su carpeta correspondiente.
`;

const postData = JSON.stringify({
  path: 'E:\\Youtube\\ESTRUCTURA_AUTO_PROD.md',
  content: content
});

fetch('http://localhost:8000/workspace/file', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: postData
})
.then(res => res.json())
.then(data => console.log('Archivo creado:', data))
.catch(err => console.error('Error:', err));
