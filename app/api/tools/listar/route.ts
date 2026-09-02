import { NextResponse } from 'next/server';
import { db as prisma } from '@/src/prisma/db';

export async function POST(req: Request) {
  try {
    const tools = await prisma.tool.findMany({
      select: {
        name: true,
        description: true
      }
    });

    return NextResponse.json({ 
      status: "success", 
      tools: tools 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
