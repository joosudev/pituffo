import clientPromise from "@/app/lib/mongodb";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const sessionCookie = await cookies();
  const session = sessionCookie.get("session")?.value;
  if (session !== "ok") return NextResponse.json({ ok: false }, { status: 401 });

  const client = await clientPromise;
  const db = client.db("gasolinera");
  const col = db.collection("historial");

  const data = await col.find().sort({ eliminadoEn: -1 }).toArray();
  return NextResponse.json({ ok: true, data });
}
