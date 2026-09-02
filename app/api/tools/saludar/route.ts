import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nombre, _userContext } = body;

    const nombreFinal = nombre || _userContext?.name || "Usuario";

    const mensaje = `¡Hola, bienvenido ${nombreFinal} a AutoProd!`;

    return NextResponse.json({ status: "success", mensaje });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
