import 'dotenv/config';

async function test() {
  const res = await fetch('http://localhost:3000/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [
        { role: 'user', content: 'Quiero hacer un video para el canal del padre, Puedes ayudarme?' }
      ],
      provider: 'openai',
      model: 'gpt-4o-mini',
      workspacePath: 'E:\\AutoProdAI\\youtube'
    })
  });

  console.log(`HTTP Status: ${res.status}`);
  const data = await res.json();
  console.log('Response body:', data);
}

test().catch(console.error);
