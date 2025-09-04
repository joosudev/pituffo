// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { NextRequest, NextResponse } from "next/server";

export async function POST() {
  try {
    // Simplemente devolvemos confirmación
    return NextResponse.json({ ok: true, message: "Sesión cerrada" });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: "Error cerrando sesión" },
      { status: 500 }
    );
  }
}
