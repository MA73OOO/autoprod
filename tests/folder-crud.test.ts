import 'dotenv/config';

/**
 * Suite de Pruebas: CRUD de Carpetas y Canales en Motor Local (FastAPI)
 * Verifica directamente los endpoints físicos en http://127.0.0.1:8000/workspace
 */
async function testMotor() {
  const baseUrl = 'http://127.0.0.1:8000/workspace';
  
  console.log('--- 1. Probando conexión al motor local ---');
  try {
    const resStatus = await fetch('http://127.0.0.1:8000/status');
    const dataStatus = await resStatus.json();
    console.log('Motor status:', dataStatus);
  } catch (e: any) {
    console.error('❌ Motor local no está respondiendo en el puerto 8000:', e.message);
    return;
  }

  console.log('\n--- 2. Creando carpetas múltiples en canal TestCanal ---');
  const createRes = await fetch(`${baseUrl}/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      channel_name: 'TestCanal',
      folders: ['Videos', 'Guiones', 'Miniaturas'],
      subfolders: ['Borradores']
    })
  });
  console.log('Create status:', createRes.status, await createRes.json());

  console.log('\n--- 3. Listando estructura plana ---');
  const listRes = await fetch(`${baseUrl}/list_flat?channel_name=TestCanal`);
  const listData = await listRes.json();
  console.log('List status:', listRes.status, `Total elementos: ${listData.total_folders} carpetas, ${listData.total_files} archivos`);

  console.log('\n--- 4. Eliminando carpetas múltiples en TestCanal ---');
  const deleteRes = await fetch(`${baseUrl}/delete_folder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      channel_name: 'TestCanal',
      folders: ['Videos', 'Guiones', 'Miniaturas']
    })
  });
  console.log('Delete folders status:', deleteRes.status, await deleteRes.json());

  console.log('\n--- 5. Eliminando canal TestCanal completo ---');
  const deleteChannelRes = await fetch(`${baseUrl}/delete_folder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      channel_name: 'TestCanal'
    })
  });
  console.log('Delete channel status:', deleteChannelRes.status, await deleteChannelRes.json());

  console.log('\n✅ Suite de pruebas de Motor Local finalizada correctamente.');
}

testMotor();
