import 'dotenv/config';

async function test() {
  const payload = {
    channel_name: 'El Abrazo del Padre worship',
    folder_name: '🌊 EN LAS AGUAS DE SU AMOR - Reggae Gospel para Tu Alma 🕊️',
    subfolders: ['Guiones', 'Videos', 'Miniatura', 'Musica', 'Ambiente']
  };

  const res = await fetch('http://localhost:8000/workspace/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  console.log(`Status: ${res.status}`);
  const data = await res.json();
  console.log('Data:', data);
}

test().catch(console.error);
