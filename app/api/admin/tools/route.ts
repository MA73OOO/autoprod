import { NextResponse } from 'next/server';
import { db as prisma } from '@/src/prisma/db';

// List all tools
export async function GET() {
  try {
    const tools = await prisma.tool.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ tools });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Create a new tool and link it to the orchestrator
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description, schema, apiEndpoint, method } = body;

    if (!name || !apiEndpoint || !schema) {
      return NextResponse.json({ error: "Missing required fields: name, apiEndpoint, schema" }, { status: 400 });
    }

    const newTool = await prisma.tool.create({
      data: {
        name,
        description: description || "",
        schema: typeof schema === 'string' ? JSON.parse(schema) : schema,
        apiEndpoint,
        method: method || 'POST',
      }
    });

    // Auto-link to the orchestrator
    const orchestrator = await prisma.agent.findUnique({ where: { slug: 'orchestrator' } });
    if (orchestrator) {
      await prisma.agentTool.create({
        data: {
          agentId: orchestrator.id,
          toolId: newTool.id
        }
      });
    }

    return NextResponse.json({ tool: newTool }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Update an existing tool
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, name, description, schema, apiEndpoint, method } = body;

    if (!id) {
      return NextResponse.json({ error: "Tool ID is required" }, { status: 400 });
    }

    const updatedTool = await prisma.tool.update({
      where: { id },
      data: {
        name,
        description,
        schema: typeof schema === 'string' ? JSON.parse(schema) : schema,
        apiEndpoint,
        method,
      }
    });

    return NextResponse.json({ tool: updatedTool });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Delete a tool
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "Tool ID is required" }, { status: 400 });
    }

    await prisma.tool.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
