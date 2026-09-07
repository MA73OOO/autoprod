import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/prisma/db';
import { getAuthUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthUser();
    if (!auth.ok) return auth.response;
    const { user } = auth;

    const { id } = await params;
    const body = await req.json();
    const { name, channelId, metadata } = body;

    const existing = await db.asset.findFirst({
      where: { id, userId: user.id }
    });

    if (!existing) {
      return NextResponse.json({ error: 'Recurso no encontrado' }, { status: 404 });
    }

    const updated = await db.asset.update({
      where: { id },
      data: {
        ...(name ? { name: name.trim() } : {}),
        ...(channelId !== undefined ? { channelId: channelId || null } : {}),
        ...(metadata !== undefined ? { metadata } : {}),
      },
      include: {
        channel: { select: { id: true, name: true } }
      }
    });

    return NextResponse.json({
      success: true,
      asset: {
        ...updated,
        sizeBytes: Number(updated.sizeBytes),
        channelName: updated.channel?.name || null,
      }
    });
  } catch (err: any) {
    console.error('Error updating asset:', err);
    return NextResponse.json({ error: err.message || 'Error al actualizar recurso' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthUser();
    if (!auth.ok) return auth.response;
    const { user } = auth;

    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const deleteLocal = searchParams.get('deleteLocal') === 'true';

    const asset = await db.asset.findFirst({
      where: { id, userId: user.id }
    });

    if (!asset) {
      return NextResponse.json({ error: 'Recurso no encontrado' }, { status: 404 });
    }

    // 1. Borrado físico del disco local si el usuario lo solicitó y existe localPath
    let localDeleted = false;
    if (deleteLocal && asset.localPath) {
      try {
        const motorRes = await fetch('http://127.0.0.1:8000/workspace/delete_file', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: asset.localPath }),
          signal: AbortSignal.timeout(3000),
        });
        if (motorRes.ok) {
          localDeleted = true;
        }
      } catch (e) {
        console.warn('Could not delete physical file via motor:', e);
      }
    }

    // 2. Borrado de Supabase Storage si tiene URL en la nube
    if (asset.storageUrl) {
      try {
        const supabase = await createClient();
        const urlParts = asset.storageUrl.split('/assets/');
        if (urlParts.length > 1) {
          const filePath = decodeURIComponent(urlParts[1]);
          await supabase.storage.from('assets').remove([filePath]);
        }
      } catch (e) {
        console.warn('Could not remove file from Supabase storage:', e);
      }
    }

    // 3. Borrado del registro en la base de datos
    await db.asset.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Recurso eliminado correctamente',
      localDeleted,
    });
  } catch (err: any) {
    console.error('Error deleting asset:', err);
    return NextResponse.json({ error: err.message || 'Error al eliminar recurso' }, { status: 500 });
  }
}
