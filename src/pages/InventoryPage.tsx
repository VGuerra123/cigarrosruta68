// src/pages/InventoryPage.tsx

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import Header from "../components/layout/Header";
import CigaretteCard from "../components/ui/CigaretteCard";
import CountModal from "../components/ui/CountModal";
import { cigarettes } from "../data/cigarettes";
import { Cigarette, CountType, InventoryRecord } from "../types";
import {
  saveInventoryCount,
  getCurrentShiftInventory
} from "../services/firebase";

type ShiftType = "morning" | "afternoon" | "night";
const ITEMS_PER_PAGE = 78;

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const h = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(h);
  }, [value, delay]);
  return debounced;
}

const InventoryPage: React.FC = () => {
  const { shift } = useParams<{ shift: string }>();
  const navigate = useNavigate();
  const validShift: ShiftType | null = (["morning","afternoon","night"].includes(shift!)
    ? (shift as ShiftType)
    : null);
  useEffect(() => {
    if (!validShift) navigate("/");
  }, [validShift, navigate]);

  // Tipo de conteo activo
  const [countType, setCountType] = useState<CountType>("initial");
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);

  const [inventory, setInventory] = useState<InventoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayedItems, setDisplayedItems] = useState(ITEMS_PER_PAGE);

  // Filtrado de cigarrillos
  const filtered = useMemo(
    () =>
      cigarettes.filter(c =>
        c.name.toLowerCase().includes(debouncedSearch.toLowerCase())
      ),
    [debouncedSearch]
  );

  // Infinite scroll optimizado
  const observer = useRef<IntersectionObserver>();
  const lastCardRef = useCallback(
    (node: HTMLDivElement) => {
      if (loading) return;
      observer.current?.disconnect();
      observer.current = new IntersectionObserver(
        ([entry]) => {
          if (
            entry.isIntersecting &&
            entry.intersectionRatio > 0.5 &&
            displayedItems < filtered.length
          ) {
            setDisplayedItems(prev =>
              Math.min(prev + ITEMS_PER_PAGE, filtered.length)
            );
          }
        },
        { rootMargin: "0px 0px -200px 0px", threshold: 0.5 }
      );
      if (node) observer.current.observe(node);
    },
    [loading, displayedItems, filtered.length]
  );

  // Carga inicial de inventario
  useEffect(() => {
    const fetchInv = async () => {
      if (!validShift) return;
      setLoading(true);
      try {
        const recs = await getCurrentShiftInventory(validShift);
        setInventory(recs);
      } catch (e) {
        console.error("Error al cargar inventario:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchInv();
  }, [validShift]);

  const [selected, setSelected] = useState<Cigarette | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Abrir modal de conteo
  const handleCardSelect = (c: Cigarette) => {
    setSelected(c);
    setShowModal(true);
  };

  // —— GUARDADO OPTIMISTA —— 
  const handleSave = async (
    id: string,
    type: CountType,
    count: number
  ): Promise<void> => {
    if (!validShift) return;

    // 1) Cerrar modal ya
    setShowModal(false);

    // 2) Actualizar UI local inmediatamente
    setInventory(prev =>
      prev.map(r =>
        r.cigaretteId === id
          ? ({
              ...r,
              initialCount:
                type === "initial" ? count : r.initialCount,
              replenishment:
                type === "replenishment" ? count : r.replenishment,
              finalCount:
                type === "final" ? count : r.finalCount,
            } as InventoryRecord)
          : r
      )
    );

    // 3) Fire-and-forget al servicio
    saveInventoryCount(id, type, count, validShift).catch(err =>
      console.error("Error guardando optimista:", err)
    );
  };

  // Obtener conteos para cada card
  const getCounts = (id: string) => {
    const rec = inventory.find(r => r.cigaretteId === id);
    return {
      initial:       rec?.initialCount ?? null,
      replenishment: rec?.replenishment   ?? null,
      final:         rec?.finalCount     ?? null
    };
  };

  const display = filtered.slice(0, displayedItems);

  // Título según turno
  const getTitle = () =>
    validShift === "morning"
      ? "Mañana"
      : validShift === "afternoon"
      ? "Tarde"
      : validShift === "night"
      ? "Noche"
      : "Inventario";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header
        title={getTitle()}
        showBackButton
        showReportsButton
      />

      <main className="flex-1 p-4">
        <div className="max-w-5xl mx-auto">

          {/* Selector de tipo de conteo */}
          <div className="mb-4 flex justify-center space-x-3">
            {(["initial","replenishment","final"] as CountType[]).map(t => (
              <button
                key={t}
                onClick={() => setCountType(t)}
                className={`px-4 py-2 rounded-full border transition ${
                  countType === t
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                }`}
              >
                {t === "initial"
                  ? "Inicial"
                  : t === "replenishment"
                  ? "Reposición"
                  : "Final"}
              </button>
            ))}
          </div>

          {/* Buscador */}
          <div className="mb-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="Buscar cigarros..."
            />
          </div>

          {/* Grid de tarjetas */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {display.map((c, i) => (
              <div
                key={c.id}
                ref={i === display.length - 1 ? lastCardRef : null}
              >
                <CigaretteCard
                  cigarette={c}
                  counts={getCounts(c.id)}
                  onSelect={() => handleCardSelect(c)}
                />
              </div>
            ))}
          </div>

          {loading && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-600" />
            </div>
          )}
        </div>
      </main>

      {/* Modal de conteo */}
      <AnimatePresence>
        {selected && (
          <CountModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            cigarette={selected}
            onSave={handleSave}
            countType={countType}
            currentCount={getCounts(selected.id)[countType]}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default InventoryPage;
