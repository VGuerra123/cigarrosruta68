import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Calendar, FileText, Download } from "lucide-react";
import { motion, Variants } from "framer-motion";
import Header from "../components/layout/Header";
import Button from "../components/ui/Button";
import { getInventoryRecords } from "../services/firebase";
import { InventoryRecord, ReportFilters } from "../types";
import { cigarettes } from "../data/cigarettes";
import { useAuth } from "../context/AuthContext";

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

// Animaciones
const containerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { when: "beforeChildren", staggerChildren: 0.1, duration: 0.5 } },
};
const itemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const ReportsPage: React.FC = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<InventoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ReportFilters>({
    startDate: new Date(),
    endDate: new Date(),
    shift: "all",
  });

  const tableColumns = [
    "Fecha",
    "Turno",
    "Producto",
    "Inicial",
    "Reposición",
    "Final",
    "Usuario",
  ];

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const { records: fetched } = await getInventoryRecords(
        filters.startDate,
        filters.endDate,
        filters.shift === "all" ? undefined : filters.shift
      );
      setRecords(fetched);
    } catch (err) {
      console.error("Error fetching records:", err);
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

    const rows = records.map((r) => [
      r.date,
      shiftLabels[r.shift],
      getCigaretteName(r.cigaretteId),
      r.initialCount?.toString() ?? "-",
      r.replenishment?.toString() ?? "-",
      r.finalCount?.toString() ?? "-",
      r.userName,
    ]);

    autoTable(doc, {
      startY: 45,
      head: [tableColumns],
      body: rows,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [245, 245, 245] },
    });

    const u = user?.displayName || user?.email || "Usuario";
    doc.save(`Conteo_Cigarros_${u}.pdf`);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600">
      {/* overlay radial */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.15),transparent)] opacity-50" />
      </div>

      <Header title="Reportes" showBackButton showReportsButton={false} />

      <motion.main
        className="flex-1 px-6 py-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="max-w-5xl mx-auto space-y-6">
          {/* filtros */}
          <motion.div
            variants={itemVariants}
            className="bg-white/20 backdrop-blur-lg rounded-3xl shadow-xl ring-1 ring-white/30 p-6"
          >
            <h2 className="text-xl font-bold text-white mb-4">Filtrar Registros</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* fecha inicio */}
              <div>
                <label className="block text-sm font-medium text-white mb-1">Fecha Inicio</label>
                <div className="relative">
                  <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white" />
                  <DatePicker
                    selected={filters.startDate}
                    onChange={(d: Date) => setFilters((f) => ({ ...f, startDate: d }))}
                    locale="es"
                    dateFormat="dd/MM/yyyy"
                    className="w-full pl-10 pr-3 py-2 rounded-lg bg-white/30 text-white placeholder-white outline-none focus:ring-2 focus:ring-purple-300 transition"
                  />
                </div>
              </div>
              {/* fecha fin */}
              <div>
                <label className="block text-sm font-medium text-white mb-1">Fecha Fin</label>
                <div className="relative">
                  <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white" />
                  <DatePicker
                    selected={filters.endDate}
                    onChange={(d: Date) => setFilters((f) => ({ ...f, endDate: d }))}
                    locale="es"
                    dateFormat="dd/MM/yyyy"
                    className="w-full pl-10 pr-3 py-2 rounded-lg bg-white/30 text-white placeholder-white outline-none focus:ring-2 focus:ring-purple-300 transition"
                  />
                </div>
              </div>
              {/* turno */}
              <div>
                <label className="block text-sm font-medium text-white mb-1">Turno</label>
                <select
                  value={filters.shift}
                  onChange={(e) => setFilters((f) => ({ ...f, shift: e.target.value as ShiftOption }))}
                  className="w-full py-2 px-3 rounded-lg bg-white/30 text-white outline-none focus:ring-2 focus:ring-purple-300 transition"
                >
                  {shiftOptions.map((opt) => (
                    <option key={opt} value={opt} className="bg-white/80 text-gray-800">
                      {shiftLabels[opt]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-6 text-right">
              <motion.button
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
                onClick={handleExportPDF}
              >
                <Button icon={<Download size={16} />} disabled={records.length === 0}>
                  Exportar a PDF
                </Button>
              </motion.button>
            </div>
          </motion.div>

          {/* tabla o mensaje */}
          <motion.div variants={itemVariants}>
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-white border-t-transparent" />
              </div>
            ) : records.length > 0 ? (
              <div className="bg-white/20 backdrop-blur-lg rounded-3xl shadow-xl ring-1 ring-white/30 overflow-auto">
                <table className="min-w-full divide-y divide-white/30">
                  <thead className="bg-white/20">
                    <tr>
                      {tableColumns.map((col) => (
                        <th key={col} className="px-6 py-3 text-left text-xs font-semibold text-white/90 uppercase">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/30">
                    {records.map((r) => (
                      <tr key={r.id} className="hover:bg-white/10 transition">
                        <td className="px-6 py-4 text-sm text-white">{r.date}</td>
                        <td className="px-6 py-4 text-sm text-white">{shiftLabels[r.shift]}</td>
                        <td className="px-6 py-4 text-sm text-white">{getCigaretteName(r.cigaretteId)}</td>
                        <td className="px-6 py-4 text-sm text-white">{r.initialCount ?? "-"}</td>
                        <td className="px-6 py-4 text-sm text-white">{r.replenishment ?? "-"}</td>
                        <td className="px-6 py-4 text-sm text-white">{r.finalCount ?? "-"}</td>
                        <td className="px-6 py-4 text-sm text-white">{r.userName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-white/20 backdrop-blur-lg rounded-3xl shadow-xl ring-1 ring-white/30 p-10 text-center">
                <FileText size={48} className="text-white mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No hay registros</h3>
                <p className="text-white/80">No se encontraron registros con los filtros seleccionados.</p>
              </div>
            )}
          </motion.div>
        </div>
      </motion.main>
    </div>
  );
};

export default ReportsPage;
