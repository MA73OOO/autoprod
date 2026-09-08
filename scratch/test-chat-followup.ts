import 'dotenv/config';

async function test() {
  const res = await fetch('http://localhost:3000/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [
        { role: 'user', content: 'Quiero hacer un video para el canal del padre, Puedes ayudarme?' },
        { role: 'assistant', content: '¡Claro que sí! Para "El Abrazo del Padre worship": 1. "🌊 EN LAS AGUAS DE SU AMOR: Reggae Gospel para Tu Alma 🕊️"... ¿Cuál prefieres?' },
        { role: 'user', content: 'Me gusta la opción 1, crea las carpetas de producción para este video.' }
      ],
      provider: 'openai',
      model: 'gpt-4o-mini',
      workspacePath: 'E:\\AutoProdAI\\youtube',
      channelId: 'El Abrazo del Padre worship'
    })
  });

  console.log(`HTTP Status: ${res.status}`);
  const data = await res.json();
  console.log('Executed tools:', data.executedTools);
  console.log('Workspace modified:', data.workspaceModified);
  console.log('\n=== AI RESPONSE ===\n');
  console.log(data.text);
}

test().catch(console.error);
