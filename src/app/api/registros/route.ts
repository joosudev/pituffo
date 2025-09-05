import clientPromise from "@/app/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const client = await clientPromise;
    const db = client.db("gasolinera");
    const col = db.collection("registros");

    const result = await col.insertOne({ ...body, creadoEn: new Date() });
    return NextResponse.json({ ok: true, id: result.insertedId });
  } catch (e) {
    console.error("❌ Error POST /api/registros:", e);
    return NextResponse.json({ ok: false, message: "Error en servidor" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("gasolinera");
    const col = db.collection("registros");

    const docs = await col.find().toArray();
    return NextResponse.json({ ok: true, data: docs });
  } catch (e) {
    console.error("❌ Error GET /api/registros:", e);
    return NextResponse.json({ ok: false, message: "Error en servidor" }, { status: 500 });
  }
}
