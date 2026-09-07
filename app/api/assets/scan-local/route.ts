import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/prisma/db';
import { getAuthUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth.ok) return auth.response;
    const { user } = auth;

    const body = await req.json().catch(() => ({}));
    const { channelId, channelName, workspacePath } = body;

    let targetChannelName = channelName;
    let targetChannelId = channelId;

    if (channelId && !targetChannelName) {
      const ch = await db.channel.findFirst({
        where: { id: channelId, userId: user.id }
      });
      if (ch) {
        targetChannelName = ch.name;
      }
    } else if (targetChannelName && !targetChannelId) {
      const ch = await db.channel.findFirst({
        where: { name: targetChannelName, userId: user.id }
      });
      if (ch) {
        targetChannelId = ch.id;
      }
    }

    // Llamar al motor local de Python
    const motorRes = await fetch('http://127.0.0.1:8000/workspace/scan_media', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel_name: targetChannelName || null,
        target_path: workspacePath || null,
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!motorRes.ok) {
      const err = await motorRes.json().catch(() => ({}));
      return NextResponse.json(
        { error: err.detail || 'El motor local no respondió al escaneo de medios' },
        { status: 502 }
      );
    }

    const data = await motorRes.json();
    const diskFiles: Array<{
      name: string;
      format: string;
      type: string;
      localPath: string;
      relativePath: string;
      sizeBytes: number;
      modifiedAt: string;
    }> = data.files || [];

    if (diskFiles.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No se encontraron nuevos archivos de medios en la ruta escaneada.',
        importedCount: 0,
        totalFound: 0,
      });
    }

    // Obtener los assets que ya existen para este usuario
    const existing = await db.asset.findMany({
      where: { userId: user.id },
      select: { localPath: true, name: true }
    });

    const existingPaths = new Set(existing.map(a => a.localPath).filter(Boolean));

    const toInsert = diskFiles.filter(f => !existingPaths.has(f.localPath));

    if (toInsert.length === 0) {
      return NextResponse.json({
        success: true,
        message: `Todos los ${diskFiles.length} archivos encontrados ya están indexados en la biblioteca.`,
        importedCount: 0,
        totalFound: diskFiles.length,
      });
    }

    // Insertar masivamente en la tabla Asset
    const createdAssets = await Promise.all(
      toInsert.map(f =>
        db.asset.create({
          data: {
            userId: user.id,
            channelId: targetChannelId || null,
            name: f.name,
            type: f.type,
            format: f.format,
            localPath: f.localPath,
            sizeBytes: BigInt(f.sizeBytes || 0),
            metadata: {
              scannedFromDisk: true,
              relativePath: f.relativePath,
              modifiedAt: f.modifiedAt,
            }
          },
          include: {
            channel: { select: { id: true, name: true } }
          }
        })
      )
    );

    return NextResponse.json({
      success: true,
      message: `Se sincronizaron e indexaron ${createdAssets.length} nuevos recursos desde el disco local.`,
      importedCount: createdAssets.length,
      totalFound: diskFiles.length,
      assets: createdAssets.map(a => ({
        ...a,
        sizeBytes: Number(a.sizeBytes),
        channelName: a.channel?.name || null,
      }))
    });
  } catch (err: any) {
    console.error('Error scanning local assets:', err);
    return NextResponse.json(
      { error: err.message || 'Error al sincronizar recursos locales' },
      { status: 500 }
    );
  }
}
