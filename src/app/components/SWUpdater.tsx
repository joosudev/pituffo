"use client";

import { useEffect, useState } from "react";

export default function SWUpdater() {
  const [newVersion, setNewVersion] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data.type === "NEW_VERSION") {
          setNewVersion(true);
        }
      });
    }
  }, []);

  if (!newVersion) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "#1e40af", // azul fuerte
        color: "white",
        padding: "12px",
        textAlign: "center",
        zIndex: 9999,
        fontFamily: "sans-serif",
      }}
    >
      🚀 Nueva versión disponible &nbsp;
      <button
        style={{
          background: "white",
          color: "#1e40af",
          border: "none",
          padding: "6px 12px",
          borderRadius: "6px",
          fontWeight: "bold",
          cursor: "pointer",
        }}
        onClick={() => window.location.reload()}
      >
        Recargar
      </button>
    </div>
  );
}
