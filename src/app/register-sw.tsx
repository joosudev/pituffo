'use client';
import { useEffect } from "react";

export default function RegisterSW() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => console.log("✅ Service Worker activo"))
        .catch((err) => console.error("❌ Error en SW", err));
    }
  }, []);
  return null;
}
