import clientPromise from "@/app/lib/mongodb";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ObjectId } from "mongodb";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (session !== "ok") return NextResponse.json({ ok: false }, { status: 401 });

  try {
    const body = await req.json();
    const client = await clientPromise;
    const db = client.db("gasolinera");
    const col = db.collection("registros");

    const _id = new ObjectId(params.id);
    await col.updateOne({ _id }, { $set: body });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, message: "Error en el servidor" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (session !== "ok") return NextResponse.json({ ok: false }, { status: 401 });

  try {
    const client = await clientPromise;
    const db = client.db("gasolinera");
    const col = db.collection("registros");
    const historial = db.collection("historial");

    const _id = new ObjectId(params.id);
    const doc = await col.findOne({ _id });
    if (!doc) return NextResponse.json({ ok: false, message: "No existe" }, { status: 404 });

    await historial.insertOne({ ...doc, eliminadoEn: new Date().toISOString() });
    await col.deleteOne({ _id });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, message: "Error en el servidor" }, { status: 500 });
  }
}
