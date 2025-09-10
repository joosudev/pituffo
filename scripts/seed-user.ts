/**
 * Script de inicialización de usuario administrador para Gasolinera 🚛
 * -----------------------------------------------------------------
 * - Si el usuario "admin" NO existe → lo crea con correo y password por defecto.
 * - Si el usuario "admin" YA existe → actualiza su contraseña con la nueva definida aquí.
 *
 * 👉 Úsalo cuando quieras inicializar o resetear credenciales de acceso.
 */

import "dotenv/config";
import clientPromise from "@/app/lib/mongodb";
import bcrypt from "bcryptjs";

async function main() {
  const client = await clientPromise;
  const db = client.db("gasolinera");
  const users = db.collection("usuarios");

  // 👇 Nueva contraseña por defecto
  const nuevaPassword = "Pitufo2025**";
  const hashedPassword = await bcrypt.hash(nuevaPassword, 10);

  const existe = await users.findOne({ usuario: "admin" });

  if (!existe) {
    await users.insertOne({
      usuario: "admin",
      correo: "admin@mail.com",
      password: hashedPassword,
    });
    console.log("✅ Usuario admin creado con contraseña inicial");
  } else {
    await users.updateOne(
      { usuario: "admin" },
      { $set: { password: hashedPassword } }
    );
    console.log("🔑 Contraseña del admin actualizada correctamente");
  }

  process.exit();
}

main().catch((err) => {
  console.error("❌ Error ejecutando seed:", err);
  process.exit(1);
});
