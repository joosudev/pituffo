import "dotenv/config";
import clientPromise from "@/app/lib/mongodb";
import bcrypt from "bcryptjs";

async function main() {
  const client = await clientPromise;
  const db = client.db("gasolinera");
  const users = db.collection("usuarios");

  const existe = await users.findOne({ usuario: "admin" });
  if (!existe) {
    // 👇 generamos hash en vez de guardar plano
    const hashedPassword = await bcrypt.hash("Pitufo12345", 10);

    await users.insertOne({
      usuario: "admin",
      correo: "admin@mail.com",
      password: hashedPassword,
    });

    console.log("✅ Usuario admin creado con contraseña hasheada");
  } else {
    console.log("⚠️ El usuario admin ya existe");
  }

  process.exit();
}

main().catch((err) => {
  console.error("❌ Error ejecutando seed:", err);
  process.exit(1);
});
