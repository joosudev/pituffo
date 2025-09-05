import clientPromise from "@/app/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("gasolinera");
    const historial = db.collection("historial");

    const docs = await historial.find().toArray();
    return NextResponse.json({ ok: true, data: docs });
  } catch (e) {
    console.error("❌ Error GET /api/historial:", e);
    return NextResponse.json({ ok: false, message: "Error en servidor" }, { status: 500 });
  }
}
