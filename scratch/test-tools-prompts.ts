import 'dotenv/config';

async function test() {
  console.log('Testing GET /api/tools/prompts...');
  const resGet = await fetch('http://localhost:3000/api/tools/prompts');
  const jsonGet = await resGet.json();
  console.log(`GET status: ${resGet.status}, count: ${Array.isArray(jsonGet) ? jsonGet.length : jsonGet.error}`);

  console.log('\nTesting POST /api/tools/prompts with tipo: "crear_canal"...');
  const resPost = await fetch('http://localhost:3000/api/tools/prompts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tipo: 'crear_canal' })
  });
  const jsonPost = await resPost.json();
  console.log(`POST status: ${resPost.status}, found template: ${jsonPost.templateName}`);
  console.log('WelcomeText preview:\n', jsonPost.welcomeText?.slice(0, 250));
}

test().catch(console.error);
