// src/pages/ReportsPage.tsx

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Calendar, FileText, Download } from "lucide-react";
import Header from "../components/layout/Header";
import Button from "../components/ui/Button";
import { getInventoryRecords } from "../services/firebase";
import { InventoryRecord, ReportFilters } from "../types";
import { cigarettes } from "../data/cigarettes";

// registrar locale español
registerLocale("es", es);

const shiftOptions = ["all", "morning", "afternoon", "night"] as const;
type ShiftOption = typeof shiftOptions[number];
const shiftLabels: Record<ShiftOption, string> = {
  all: "Todos",
  morning: "Mañana",
  afternoon: "Tarde",
  night: "Noche",
};

const ReportsPage: React.FC = () => {
  const [records, setRecords] = useState<InventoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ReportFilters>({
    startDate: new Date(),
    endDate: new Date(),
    shift: "all",
  });

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const { records: fetched } = await getInventoryRecords(
        filters.startDate,
        filters.endDate,
        filters.shift === "all" ? undefined : filters.shift
      );
      setRecords(fetched);
    } catch (error) {
      console.error("Error fetching records:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [filters]);

  const getCigaretteName = (id: string) => {
    const cig = cigarettes.find((c) => c.id === id);
    return cig ? cig.name : id;
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Reporte de Inventario de Cigarros", 14, 22);

    doc.setFontSize(11);
    doc.text(
      `Período: ${format(filters.startDate, "dd/MM/yyyy")} - ${format(
        filters.endDate,
        "dd/MM/yyyy"
      )}`,
      14,
      32
    );
    doc.text(`Turno: ${shiftLabels[filters.shift]}`, 14, 38);

    // Agrupar y generar tablas…
    // (resto del código de exportación permanece igual) :contentReference[oaicite:0]{index=0}:contentReference[oaicite:1]{index=1}

    doc.save(`reporte-inventario-${format(new Date(), "yyyy-MM-dd")}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ← Aquí agregamos el Header con logo y título */}
      <Header 
        title="Reportes" 
        showBackButton 
        showReportsButton={false} 
      />

      <main className="flex-1 p-4">
        <div className="max-w-5xl mx-auto">
          {/* Panel de filtros */}
          <div className="bg-white rounded-lg shadow p-4 mb-4">
            <h2 className="text-lg font-semibold mb-3">Filtrar Registros</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Fecha Inicio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Inicio
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar size={16} className="text-gray-400" />
                  </div>
                  <DatePicker
                    selected={filters.startDate}
                    onChange={(d: Date) =>
                      setFilters((f) => ({ ...f, startDate: d }))
                    }
                    locale="es"
                    dateFormat="dd/MM/yyyy"
                    className="block w-full pl-10 pr-3 py-2 border rounded-md"
                  />
                </div>
              </div>
              {/* Fecha Fin */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Fin
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar size={16} className="text-gray-400" />
                  </div>
                  <DatePicker
                    selected={filters.endDate}
                    onChange={(d: Date) =>
                      setFilters((f) => ({ ...f, endDate: d }))
                    }
                    locale="es"
                    dateFormat="dd/MM/yyyy"
                    className="block w-full pl-10 pr-3 py-2 border rounded-md"
                  />
                </div>
              </div>
              {/* Turno */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Turno
                </label>
                <select
                  value={filters.shift}
                  onChange={(e) =>
                    setFilters((f) => ({
                      ...f,
                      shift: e.target.value as ShiftOption,
                    }))
                  }
                  className="block w-full py-2 px-3 border rounded-md"
                >
                  {shiftOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {shiftLabels[opt]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button
                onClick={handleExportPDF}
                icon={<Download size={16} />}
                disabled={records.length === 0}
              >
                Exportar a PDF
              </Button>
            </div>
          </div>

          {/* Contenido: spinner, tabla o mensaje de vacío */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500" />
            </div>
          ) : records.length > 0 ? (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                        Turno
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                        Producto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                        Inicial
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                        Reposición
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                        Final
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                        Usuario
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {records.map((r) => (
                      <tr key={r.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {r.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {shiftLabels[r.shift]}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {getCigaretteName(r.cigaretteId)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {r.initialCount ?? "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {r.replenishment ?? "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {r.finalCount ?? "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {r.userName}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <FileText size={48} className="text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                No hay registros
              </h3>
              <p className="text-gray-500">
                No se encontraron registros con los filtros seleccionados.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ReportsPage;
