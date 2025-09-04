import clientPromise from "@/app/lib/mongodb";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const LITRO_A_GALON = 0.264172;

export async function GET() {
  const session = (await cookies()).get("session")?.value;
  if (session !== "ok") return NextResponse.json({ ok: false }, { status: 401 });

  const client = await clientPromise;
  const db = client.db("gasolinera");
  const registros = db.collection("registros");

  const data = await registros.find().sort({ fecha: -1 }).toArray();
  return NextResponse.json({ ok: true, data });
}

export async function POST(req: Request) {
  const session = (await cookies()).get("session")?.value;
  if (session !== "ok") return NextResponse.json({ ok: false }, { status: 401 });

  try {
    const body = await req.json();

    // Normalizamos en el server para evitar datos incoherentes
    const litros = Number(body.litros) || 0;
    const galones = Number((litros * LITRO_A_GALON).toFixed(2));

    const stockIniL = Number(body.stockInicialLitros) || 0;
    const stockIniG = Number((stockIniL * LITRO_A_GALON).toFixed(2));

    const stockFinL = body.stockFinalLitros !== undefined && body.stockFinalLitros !== ""
      ? Number(body.stockFinalLitros)
      : stockIniL - litros;

    const stockFinG = Number((stockFinL * LITRO_A_GALON).toFixed(2));

    const doc = {
      fecha: new Date().toISOString(),
      conductor: body.conductor,
      empresa: body.empresa,
      factura: body.factura,
      despachador: body.despachador,
      litros,
      galones,
      stockInicialLitros: stockIniL,
      stockInicialGalones: stockIniG,
      stockFinalLitros: stockFinL,
      stockFinalGalones: stockFinG,
      entrada: body.entrada,
      salida: body.salida,
    };

    const client = await clientPromise;
    const db = client.db("gasolinera");
    const col = db.collection("registros");

    const result = await col.insertOne(doc);
    return NextResponse.json({ ok: true, id: result.insertedId });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, message: "Error en el servidor" }, { status: 500 });
  }
}
