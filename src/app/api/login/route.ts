import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import clientPromise from "@/app/lib/mongodb";

export async function POST(request: NextRequest) {
  try {
    const { identifier, password } = await request.json();

    const client = await clientPromise;
    const db = client.db("gasolinera");
    const users = db.collection("usuarios");

    const user = await users.findOne({
      $or: [{ usuario: identifier }, { correo: identifier }],
    });

    if (!user) {
      return NextResponse.json(
        { ok: false, message: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const passwordOk = await bcrypt.compare(password, user.password);
    if (!passwordOk) {
      return NextResponse.json(
        { ok: false, message: "Contraseña incorrecta" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Login correcto",
      user: { usuario: user.usuario, correo: user.correo },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { ok: false, message: "Error en el servidor" },
      { status: 500 }
    );
  }
}
