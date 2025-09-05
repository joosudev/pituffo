import clientPromise from "@/app/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    const client = await clientPromise;
    const db = client.db("gasolinera");
    const col = db.collection("registros");

    const _id = new ObjectId(id);
    const result = await col.updateOne({ _id }, { $set: body });

    if (result.matchedCount === 0) {
      return NextResponse.json({ ok: false, message: "No existe" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("❌ Error PUT /api/registros/[id]:", e);
    return NextResponse.json({ ok: false, message: "Error en servidor" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const client = await clientPromise;
    const db = client.db("gasolinera");
    const col = db.collection("registros");
    const historial = db.collection("historial");

    const _id = new ObjectId(id);
    const doc = await col.findOne({ _id });

    if (!doc) {
      return NextResponse.json({ ok: false, message: "No existe" }, { status: 404 });
    }

    await historial.insertOne({ ...doc, eliminadoEn: new Date() });
    await col.deleteOne({ _id });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("❌ Error DELETE /api/registros/[id]:", e);
    return NextResponse.json({ ok: false, message: "Error en servidor" }, { status: 500 });
  }
}
