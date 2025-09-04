import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  const usuario = cookieStore.get("usuario")?.value;
  if (session === "ok" && usuario) {
    return NextResponse.json({ ok: true, usuario });
  }
  return NextResponse.json({ ok: false }, { status: 401 });
}
