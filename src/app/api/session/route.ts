/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";

 
export async function GET(request: NextRequest) {
  try {
    // Aquí normalmente se validaría la sesión
    return NextResponse.json({ ok: true, message: "Sesión activa" });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: "No hay sesión activa" },
      { status: 401 }
    );
  }
}
