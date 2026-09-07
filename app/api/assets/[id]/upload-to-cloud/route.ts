import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/prisma/db';
import { getAuthUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthUser();
    if (!auth.ok) return auth.response;
    const { user } = auth;

    const { id } = await params;

    const asset = await db.asset.findFirst({
      where: { id, userId: user.id }
    });

    if (!asset) {
      return NextResponse.json({ error: 'Recurso no encontrado' }, { status: 404 });
    }

    if (!asset.localPath) {
      return NextResponse.json({ error: 'El recurso no tiene una ruta local vinculada' }, { status: 400 });
    }

    // Leer el archivo local
    let fileBuffer: Buffer;
    try {
      fileBuffer = await fs.readFile(asset.localPath);
    } catch (e: any) {
      return NextResponse.json({ error: `No se pudo leer el archivo local: ${e.message}` }, { status: 404 });
    }

    const supabase = await createClient();
    const cleanFileName = asset.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `${user.id}/${asset.id}_${cleanFileName}`;

    const contentType =
      asset.format === 'png' ? 'image/png' :
      asset.format === 'jpg' || asset.format === 'jpeg' ? 'image/jpeg' :
      asset.format === 'webp' ? 'image/webp' :
      asset.format === 'mp4' ? 'video/mp4' :
      asset.format === 'srt' ? 'text/plain' :
      asset.format === 'vtt' ? 'text/vtt' :
      asset.format === 'mp3' ? 'audio/mpeg' :
      'application/octet-stream';

    const { error: uploadError } = await supabase.storage
      .from('assets')
      .upload(storagePath, fileBuffer, {
        contentType,
        upsert: true,
      });

    if (uploadError) {
      console.error('Supabase storage upload error:', uploadError);
      return NextResponse.json({ error: `Error en almacenamiento en la nube: ${uploadError.message}` }, { status: 500 });
    }

    const { data: { publicUrl } } = supabase.storage
      .from('assets')
      .getPublicUrl(storagePath);

    const updated = await db.asset.update({
      where: { id },
      data: {
        storageUrl: publicUrl,
        sizeBytes: BigInt(fileBuffer.length),
      },
      include: {
        channel: { select: { id: true, name: true } }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Archivo respaldado en la nube con éxito',
      asset: {
        ...updated,
        sizeBytes: Number(updated.sizeBytes),
        channelName: updated.channel?.name || null,
      }
    });
  } catch (err: any) {
    console.error('Error uploading asset to cloud:', err);
    return NextResponse.json({ error: err.message || 'Error al subir recurso a la nube' }, { status: 500 });
  }
}
