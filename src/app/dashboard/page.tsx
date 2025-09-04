/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './dashboard.css';

interface Registro {
  _id?: string;
  fecha: string;
  conductor: string;
  empresa: string;
  factura: string;
  despachador: string;
  litros: number;
  galones: number;
  stockInicialLitros: number;
  stockInicialGalones: number;
  stockFinalLitros: number;
  stockFinalGalones: number;
  entrada: string;
  salida: string;
}

type Filtro = 'dia' | 'semana' | 'mes' | 'anio' | 'todo';

export default function DashboardPage() {
  // ===== Estados =====
  const [form, setForm] = useState<any>({
    conductor: '',
    empresa: '',
    factura: '',
    despachador: '',
    litros: '',
    galones: '',
    stockInicialLitros: '',
    stockInicialGalones: '',
    stockFinalLitros: '',
    stockFinalGalones: '',
    entrada: '',
    salida: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [historial, setHistorial] = useState<Registro[]>([]);
  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [editando, setEditando] = useState<string | null>(null);

  // ===== Filtros =====
  const [filtro, setFiltro] = useState<Filtro>('mes');
  const [fechaDia, setFechaDia] = useState<string>(new Date().toISOString().split('T')[0]);
  const [semanaISO, setSemanaISO] = useState<string>(getCurrentISOWeek());
  const [mesFiltro, setMesFiltro] = useState<number>(new Date().getMonth() + 1);
  const [anioFiltro, setAnioFiltro] = useState<number>(new Date().getFullYear());

  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const router = useRouter();

  // ===== Check login =====
  useEffect(() => {
    const logged = localStorage.getItem('loggedIn');
    if (logged !== 'true') {
      router.replace('/');
    } else {
      setIsAuthChecked(true);
      fetchRegistros();
      fetchHistorial();
    }
  }, [router]);

  // ===== API Calls =====
  const fetchRegistros = async () => {
    const res = await fetch('/api/registros');
    const data = await res.json();
    if (data.ok) setRegistros(data.data);
  };

  const fetchHistorial = async () => {
    const res = await fetch('/api/historial');
    const data = await res.json();
    if (data.ok) setHistorial(data.data);
  };

  // ===== Validación =====
  const validar = () => {
    const newErrors: Record<string, string> = {};
    if (!form.conductor) newErrors.conductor = 'Campo obligatorio';
    if (!form.empresa) newErrors.empresa = 'Campo obligatorio';
    if (!form.factura) newErrors.factura = 'Campo obligatorio';
    if (!form.despachador) newErrors.despachador = 'Campo obligatorio';
    if (!form.litros) newErrors.litros = 'Campo obligatorio';
    if (!form.stockInicialLitros) newErrors.stockInicialLitros = 'Campo obligatorio';
    if (!form.entrada) newErrors.entrada = 'Campo obligatorio';
    if (!form.salida) newErrors.salida = 'Campo obligatorio';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ===== Handlers =====
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'litros') {
      const litros = Number(value);
      setForm({
        ...form,
        litros: value,
        galones: litros ? (litros * 0.264172).toFixed(2) : '',
      });
      return;
    }
    if (name === 'stockInicialLitros') {
      const litros = Number(value);
      setForm({
        ...form,
        stockInicialLitros: value,
        stockInicialGalones: litros ? (litros * 0.264172).toFixed(2) : '',
      });
      return;
    }
    if (name === 'stockFinalLitros') {
      const litros = Number(value);
      setForm({
        ...form,
        stockFinalLitros: value,
        stockFinalGalones: litros ? (litros * 0.264172).toFixed(2) : '',
      });
      return;
    }

    setForm({ ...form, [name]: value });
  };

  const handleAddRegistro = async () => {
    if (!validar()) return;

    const nuevo: Registro = {
      fecha: new Date().toISOString(),
      conductor: form.conductor,
      empresa: form.empresa,
      factura: form.factura,
      despachador: form.despachador,
      litros: Number(form.litros),
      galones: Number(form.galones),
      stockInicialLitros: Number(form.stockInicialLitros),
      stockInicialGalones: Number(form.stockInicialGalones),
      stockFinalLitros: form.stockFinalLitros
        ? Number(form.stockFinalLitros)
        : Number(form.stockInicialLitros) - Number(form.litros),
      stockFinalGalones: form.stockFinalGalones
        ? Number(form.stockFinalGalones)
        : (Number(form.stockInicialLitros) - Number(form.litros)) * 0.264172,
      entrada: form.entrada,
      salida: form.salida,
    };

    if (editando) {
      await fetch(`/api/registros/${editando}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevo),
      });
      setEditando(null);
    } else {
      await fetch('/api/registros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevo),
      });
    }

    fetchRegistros();
    setForm({
      conductor: '',
      empresa: '',
      factura: '',
      despachador: '',
      litros: '',
      galones: '',
      stockInicialLitros: '',
      stockInicialGalones: '',
      stockFinalLitros: '',
      stockFinalGalones: '',
      entrada: '',
      salida: '',
    });
    setErrors({});
  };

  const handleEditar = (registro: Registro) => {
    setForm({
      ...registro,
      litros: String(registro.litros),
      galones: String(registro.galones),
      stockInicialLitros: String(registro.stockInicialLitros),
      stockInicialGalones: String(registro.stockInicialGalones),
      stockFinalLitros: String(registro.stockFinalLitros),
      stockFinalGalones: String(registro.stockFinalGalones),
    });
    setEditando(registro._id ?? null);
  };

  const handleEliminar = async (id?: string) => {
    if (!id) return;
    await fetch(`/api/registros/${id}`, { method: 'DELETE' });
    fetchRegistros();
    fetchHistorial();
  };

  const handleLogout = () => {
    localStorage.removeItem('usuario');
    localStorage.removeItem('loggedIn');
    router.replace('/');
  };

  // ===== Filtros =====
  function getDateRange(): { start: Date | null; end: Date | null } {
    if (filtro === 'dia') {
      const start = new Date(fechaDia + 'T00:00:00');
      const end = new Date(start);
      end.setDate(start.getDate() + 1);
      return { start, end };
    }
    if (filtro === 'semana') {
      const [yStr, wStr] = semanaISO.split('-W');
      const year = Number(yStr);
      const week = Number(wStr);
      const start = getDateOfISOWeekStart(year, week);
      const end = new Date(start);
      end.setDate(start.getDate() + 7);
      return { start, end };
    }
    if (filtro === 'mes') {
      const start = new Date(anioFiltro, mesFiltro - 1, 1, 0, 0, 0);
      const end = new Date(anioFiltro, mesFiltro, 1, 0, 0, 0);
      return { start, end };
    }
    if (filtro === 'anio') {
      const start = new Date(anioFiltro, 0, 1, 0, 0, 0);
      const end = new Date(anioFiltro + 1, 0, 1, 0, 0, 0);
      return { start, end };
    }
    return { start: null, end: null };
  }

  function filtrarRegistros(): Registro[] {
    const { start, end } = getDateRange();
    if (!start || !end) return registros;
    return registros.filter((r) => {
      const f = new Date(r.fecha);
      return f >= start && f < end;
    });
  }

 
// ====== EXPORT PDF ======
const exportarPDF = () => {
  const dataFiltrada = filtrarRegistros();

  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  // ===== ENCABEZADO =====
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text("Registro de Control - Gasolinera Pitufo", 148, 15, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(80, 80, 80);
  doc.text(`Exportado: ${new Date().toLocaleString()}`, 148, 25, { align: "center" });

  // ===== FACTURAS ACTIVAS =====
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text("Facturas Activas", 20, 38);

  dataFiltrada.forEach((r, i) => {
    const startY = 45 + i * 55;

    autoTable(doc, {
      startY,
      body: [
        [
          { content: `Factura: ${r.factura}`, colSpan: 2, styles: { halign: "left", fontStyle: "bold" } },
          { content: `Conductor: ${r.conductor}`, colSpan: 2, styles: { halign: "left" } },
          { content: `Empresa: ${r.empresa}`, colSpan: 2, styles: { halign: "left" } },
          { content: `Fecha: ${new Date(r.fecha).toLocaleString()}`, colSpan: 2, styles: { halign: "left" } },
        ],
        [
          "Litros", r.litros,
          "Galones", r.galones,
          "Stock Inicial (L)", r.stockInicialLitros,
          "Stock Inicial (G)", r.stockInicialGalones,
        ],
        [
          "Stock Final (L)", r.stockFinalLitros,
          "Stock Final (G)", r.stockFinalGalones,
          "Entrada", r.entrada,
          "Salida", r.salida,
          "", "", "", ""
        ],
      ],
      theme: "grid",
      styles: { fontSize: 10, halign: "center" },
      headStyles: { fillColor: [30, 64, 175], textColor: 255 }, // Azul fuerte
      columnStyles: {
        0: { fontStyle: "bold" },
        2: { fontStyle: "bold" },
        4: { fontStyle: "bold" },
        6: { fontStyle: "bold" },
      },
    });
  });

  // ===== FACTURAS ELIMINADAS =====
  if (historial.length > 0) {
    const finalY = (doc as any).lastAutoTable.finalY + 15;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(180, 0, 0);
    doc.text("Facturas Eliminadas", 20, finalY);

    historial.forEach((r, i) => {
      const startY = finalY + 10 + i * 55;

      autoTable(doc, {
        startY,
        body: [
          [
            { content: `Factura: ${r.factura}`, colSpan: 2, styles: { halign: "left", fontStyle: "bold" } },
            { content: `Conductor: ${r.conductor}`, colSpan: 2, styles: { halign: "left" } },
            { content: `Empresa: ${r.empresa}`, colSpan: 2, styles: { halign: "left" } },
            { content: `Fecha: ${new Date(r.fecha).toLocaleString()}`, colSpan: 2, styles: { halign: "left" } },
          ],
          [
            "Litros", r.litros,
            "Galones", r.galones,
            "Stock Inicial (L)", r.stockInicialLitros,
            "Stock Inicial (G)", r.stockInicialGalones,
          ],
          [
            "Stock Final (L)", r.stockFinalLitros,
            "Stock Final (G)", r.stockFinalGalones,
            "Hora de Entrada", r.entrada,
            "Hora de Salida", r.salida,
            "", "", "", ""
          ],
        ],
        theme: "grid",
        styles: { fontSize: 10, halign: "center" },
        headStyles: { fillColor: [202, 138, 4], textColor: 255 }, // Naranja
        columnStyles: {
          0: { fontStyle: "bold" },
          2: { fontStyle: "bold" },
          4: { fontStyle: "bold" },
          6: { fontStyle: "bold" },
        },
      });
    });
  }

  // ===== FOOTER =====
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text(`Página ${i} de ${pageCount}`, 280, 200, { align: "right" });
  }

  doc.save("reporte-control-pitufo.pdf");
};



  if (!isAuthChecked) return <p>Cargando...</p>;

  const dataFiltrada = filtrarRegistros();

  // ===== UI =====
  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        {/* HEADER */}
        <div className="dashboard-header">
          <h1>🚛 Panel de Control Gasolinera - Pitufo</h1>
          <div className="actions">
            <button onClick={exportarPDF} className="btn-exportar">📄 Exportar PDF</button>
            <button onClick={handleLogout} className="btn-logout">🚪 Cerrar sesión</button>
          </div>
        </div>

        {/* FORM */}
        <div className="form-grid">
          {[
            { name: 'conductor', label: 'Conductor' },
            { name: 'empresa', label: 'Empresa / Cliente' },
            { name: 'factura', label: 'Factura' },
            { name: 'despachador', label: 'Despachador' },
            { name: 'litros', label: 'Litros', type: 'number' },
            { name: 'galones', label: 'Galones', type: 'text', readOnly: true },
            { name: 'stockInicialLitros', label: 'Stock Inicial (L)', type: 'number' },
            { name: 'stockInicialGalones', label: 'Stock Inicial (G)', type: 'text', readOnly: true },
            { name: 'stockFinalLitros', label: 'Stock Final (L)', type: 'number' },
            { name: 'stockFinalGalones', label: 'Stock Final (G)', type: 'text', readOnly: true },
            { name: 'entrada', label: 'Hora de Entrada', type: 'time' },
            { name: 'salida', label: 'Hora de Salida', type: 'time' },
          ].map(f => (
            <div key={f.name}>
              <label>{f.label}</label>
              <input
                type={f.type || 'text'}
                name={f.name}
                value={form[f.name]}
                onChange={handleChange}
                readOnly={f.readOnly || false}
              />
              {errors[f.name] && <p className="error">{errors[f.name]}</p>}
            </div>
          ))}
        </div>

        <button onClick={handleAddRegistro} className="btn-registrar">
          {editando ? 'Actualizar Registro' : 'Registrar'}
        </button>

        {/* FILTROS */}
        <div className="filters">
          <label>
            Ver por:&nbsp;
            <select value={filtro} onChange={(e) => setFiltro(e.target.value as Filtro)}>
              <option value="dia">Día</option>
              <option value="semana">Semana</option>
              <option value="mes">Mes</option>
              <option value="anio">Año</option>
              <option value="todo">Todos</option>
            </select>
          </label>

          {filtro === 'dia' && (
            <input type="date" value={fechaDia} onChange={(e) => setFechaDia(e.target.value)} />
          )}

          {filtro === 'semana' && (
            <input type="week" value={semanaISO} onChange={(e) => setSemanaISO(e.target.value)} />
          )}

          {filtro === 'mes' && (
            <>
              <select value={mesFiltro} onChange={(e) => setMesFiltro(Number(e.target.value))}>
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(0, i).toLocaleString('es', { month: 'long' })}
                  </option>
                ))}
              </select>
              <select value={anioFiltro} onChange={(e) => setAnioFiltro(Number(e.target.value))}>
                {Array.from({ length: 2050 - 2024 + 1 }, (_, i) => 2024 + i).map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </>
          )}

          {filtro === 'anio' && (
            <select value={anioFiltro} onChange={(e) => setAnioFiltro(Number(e.target.value))}>
              {Array.from({ length: 2050 - 2024 + 1 }, (_, i) => 2024 + i).map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          )}
        </div>

        {/* TABLA REGISTROS */}
        <h2 className="subtitle">📑 Registros Activos</h2>
        <table className="registros-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Fecha</th>
              <th>Conductor</th>
              <th>Empresa</th>
              <th>Factura</th>
              <th>Litros</th>
              <th>Galones</th>
              <th>Stock Ini (L)</th>
              <th>Stock Ini (G)</th>
              <th>Stock Fin (L)</th>
              <th>Stock Fin (G)</th>
              <th>Entrada</th>
              <th>Salida</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {dataFiltrada.map((r, i) => (
              <tr key={r._id}>
                <td>{i + 1}</td>
                <td>{new Date(r.fecha).toLocaleString()}</td>
                <td>{r.conductor}</td>
                <td>{r.empresa}</td>
                <td>{r.factura}</td>
                <td>{r.litros}</td>
                <td>{r.galones}</td>
                <td>{r.stockInicialLitros}</td>
                <td>{r.stockInicialGalones}</td>
                <td>{r.stockFinalLitros}</td>
                <td>{r.stockFinalGalones}</td>
                <td>{r.entrada}</td>
                <td>{r.salida}</td>
                <td>
                  <button className="btn-editar" onClick={() => handleEditar(r)}>✏️</button>
                  <button className="btn-eliminar" onClick={() => handleEliminar(r._id)}>🗑</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* HISTORIAL */}
        {historial.length > 0 && (
          <>
            <div className="actions">
              <button
                onClick={() => setMostrarHistorial(!mostrarHistorial)}
                className="btn-exportar"
              >
                {mostrarHistorial ? 'Ocultar Historial' : '📂 Ver Historial'}
              </button>
            </div>

            {mostrarHistorial && (
              <>
                <h2 className="subtitle" style={{ marginTop: '2rem', color: '#dc2626' }}>
                  📂 Facturas Eliminadas
                </h2>
                <table className="registros-table historial-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Fecha</th>
                      <th>Conductor</th>
                      <th>Empresa</th>
                      <th>Factura</th>
                      <th>Litros</th>
                      <th>Galones</th>
                      <th>Stock Ini (L)</th>
                      <th>Stock Ini (G)</th>
                      <th>Stock Fin (L)</th>
                      <th>Stock Fin (G)</th>
                      <th>Entrada</th>
                      <th>Salida</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historial.map((r, i) => (
                      <tr key={r._id}>
                        <td>{i + 1}</td>
                        <td>{new Date(r.fecha).toLocaleString()}</td>
                        <td>{r.conductor}</td>
                        <td>{r.empresa}</td>
                        <td>{r.factura}</td>
                        <td>{r.litros}</td>
                        <td>{r.galones}</td>
                        <td>{r.stockInicialLitros}</td>
                        <td>{r.stockInicialGalones}</td>
                        <td>{r.stockFinalLitros}</td>
                        <td>{r.stockFinalGalones}</td>
                        <td>{r.entrada}</td>
                        <td>{r.salida}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ===== Helpers =====
function getCurrentISOWeek() {
  const now = new Date();
  const onejan = new Date(now.getFullYear(), 0, 1);
  const millisecsInDay = 86400000;
  return `${now.getFullYear()}-W${Math.ceil(
    ((now.getTime() - onejan.getTime()) / millisecsInDay + onejan.getDay() + 1) / 7
  )}`;
}

function getDateOfISOWeekStart(year: number, week: number) {
  const simple = new Date(year, 0, 1 + (week - 1) * 7);
  const dow = simple.getDay();
  const ISOweekStart = simple;
  if (dow <= 4) ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
  else ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
  return ISOweekStart;
}
