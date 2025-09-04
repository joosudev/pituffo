import clientPromise from "@/app/lib/mongodb";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { identifier, password } = await req.json();

    const client = await clientPromise;
    const db = client.db("gasolinera");
    const users = db.collection("usuarios");

    const user = await users.findOne({
      $or: [{ usuario: identifier }, { correo: identifier }],
    });

    if (!user) {
      return NextResponse.json({ ok: false, message: "Usuario no encontrado" }, { status: 404 });
    }

    const passwordOk = await bcrypt.compare(password, user.password);
    if (!passwordOk) {
      return NextResponse.json({ ok: false, message: "Contraseña incorrecta" }, { status: 401 });
    }

    const res = NextResponse.json({
      ok: true,
      user: { usuario: user.usuario, correo: user.correo },
    });

    // Cookie de sesión (simple, sin JWT ni middleware)
    res.cookies.set("session", "ok", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });
    res.cookies.set("usuario", user.usuario, {
      sameSite: "lax",
      path: "/",
    });

    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, message: "Error en el servidor" }, { status: 500 });
  }
}
