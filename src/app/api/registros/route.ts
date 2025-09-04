import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/app/lib/mongodb";
import { cookies } from "next/headers";

const LITRO_A_GALON = 0.264172;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: NextRequest) {
  const session = (await cookies()).get("session")?.value;
  if (session !== "ok") {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db("gasolinera");
    const registros = db.collection("registros");

    const data = await registros.find().sort({ fecha: -1 }).toArray();
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    console.error("❌ Error GET registros:", error);
    return NextResponse.json(
      { ok: false, message: "Error obteniendo registros" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = (await cookies()).get("session")?.value;
  if (session !== "ok") {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  try {
    const body = await request.json();

    // 🔹 Normalizamos en el server
    const litros = Number(body.litros) || 0;
    const galones = Number((litros * LITRO_A_GALON).toFixed(2));

    const stockIniL = Number(body.stockInicialLitros) || 0;
    const stockIniG = Number((stockIniL * LITRO_A_GALON).toFixed(2));

    const stockFinL =
      body.stockFinalLitros !== undefined && body.stockFinalLitros !== ""
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
  } catch (error) {
    console.error("❌ Error POST registros:", error);
    return NextResponse.json(
      { ok: false, message: "Error insertando registro" },
      { status: 500 }
    );
  }
}
