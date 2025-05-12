/* eslint-disable react-hooks/exhaustive-deps */
import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import Header from "../components/layout/Header";
import CigaretteCard from "../components/ui/CigaretteCard";
import CountModal from "../components/ui/CountModal";
import Button from "../components/ui/Button";
import { cigarettes } from "../data/cigarettes";
import { Cigarette, CountType, InventoryRecord } from "../types";
import {
  saveInventoryCount,
  getCurrentShiftInventory,
} from "../services/firebase";

/* -------------------------------------------------------------------------- */
/* Configuración                                                              */
/* -------------------------------------------------------------------------- */
type ShiftType = "morning" | "afternoon" | "night";
const ITEMS_PER_PAGE = 78;

/* -------------------------------------------------------------------------- */
/* Hook debounce                                                              */
/* -------------------------------------------------------------------------- */
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const h = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(h);
  }, [value, delay]);
  return debounced;
}

/* -------------------------------------------------------------------------- */
/* Componente principal                                                       */
/* -------------------------------------------------------------------------- */
const InventoryPage: React.FC = () => {
  const { shift } = useParams<{ shift: string }>();
  const navigate = useNavigate();

  const validShift: ShiftType | null = ["morning", "afternoon", "night"].includes(
    shift!
  )
    ? (shift as ShiftType)
    : null;

  /* ------------ redirect si turno inválido ------------ */
  useEffect(() => {
    if (!validShift) navigate("/");
  }, [validShift]);

  /* ------------------ estado página ------------------- */
  const [countType, setCountType] = useState<CountType>("initial");
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);

  const [inventory, setInventory] = useState<InventoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayedItems, setDisplayedItems] = useState(ITEMS_PER_PAGE);

  /* ---------------- filtrado --------------------------- */
  const filtered = useMemo(
    () =>
      cigarettes.filter((c) =>
        c.name.toLowerCase().includes(debouncedSearch.toLowerCase())
      ),
    [debouncedSearch]
  );

  /* ---------------- infinite scroll ------------------- */
  const observer = useRef<IntersectionObserver>();
  const lastCardRef = useCallback(
    (node: HTMLDivElement) => {
      if (loading) return;
      observer.current?.disconnect();
      observer.current = new IntersectionObserver(
        ([entry]) => {
          if (
            entry.isIntersecting &&
            entry.intersectionRatio > 0.6 &&
            displayedItems < filtered.length
          ) {
            setDisplayedItems((prev) =>
              Math.min(prev + ITEMS_PER_PAGE, filtered.length)
            );
          }
        },
        { rootMargin: "0px 0px -200px 0px", threshold: 0.6 }
      );
      if (node) observer.current.observe(node);
    },
    [loading, displayedItems, filtered.length]
  );

  /* ---------------- carga inicial --------------------- */
  useEffect(() => {
    const fetchInv = async () => {
      if (!validShift) return;
      setLoading(true);
      try {
        setInventory(await getCurrentShiftInventory(validShift));
      } catch (e) {
        console.error("Error al cargar inventario:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchInv();
  }, [validShift]);

  /* ---------------- handlers -------------------------- */
  const [selected, setSelected] = useState<Cigarette | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleCardSelect = (c: Cigarette) => {
    setSelected(c);
    setShowModal(true);
  };

  /* ----- guardado optimista para counts (más rápido) -- */
  const handleSave = async (
    id: string,
    type: CountType,
    count: number
  ): Promise<void> => {
    if (!validShift) return;
    setShowModal(false);

    setInventory((prev) =>
      prev.map((r) =>
        r.cigaretteId === id
          ? ({
              ...r,
              initialCount: type === "initial" ? count : r.initialCount,
              replenishment:
                type === "replenishment" ? count : r.replenishment,
              finalCount: type === "final" ? count : r.finalCount,
            } as InventoryRecord)
          : r
      )
    );

    // fire-and-forget
    saveInventoryCount(id, type, count, validShift).catch((err) =>
      console.error("Error guardando optimista:", err)
    );
  };

  const getCounts = (id: string) => {
    const rec = inventory.find((r) => r.cigaretteId === id);
    return {
      initial: rec?.initialCount ?? null,
      replenishment: rec?.replenishment ?? null,
      final: rec?.finalCount ?? null,
    };
  };

  const display = filtered.slice(0, displayedItems);

  const getTitle = () =>
    validShift === "morning"
      ? "Turno de Mañana"
      : validShift === "afternoon"
      ? "Turno de Tarde"
      : "Turno de Noche";

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* background gradient + sutil bokeh animado */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#1a2980] via-[#267871] to-[#0f2027]" />
      <div className="absolute -inset-20 -z-10 opacity-40 blur-3xl pointer-events-none animate-[pulse_14s_ease-in-out_infinite] bg-[radial-gradient(ellipse_at_top_left,var(--tw-gradient-stops))] from-emerald-400 via-sky-500 to-fuchsia-500" />

      <Header title={getTitle()} showBackButton showReportsButton />

      <main className="flex-1 flex justify-center px-4 py-6">
        {/* contenedor glass */}
        <div
          className="
            w-full max-w-6xl bg-white/10 backdrop-blur-xl
            rounded-[28px] ring-1 ring-white/15
            shadow-[0_35px_120px_rgba(0,0,0,0.35)]
            px-8 py-7
          "
        >
          {/* selector de tipo de conteo */}
          <div className="mb-7 flex justify-center gap-4">
            {(["initial", "replenishment", "final"] as CountType[]).map((t) => (
              <Button
                key={t}
                onClick={() => setCountType(t)}
                variant={countType === t ? "primary" : "outline"}
                size="md"
                className="backdrop-blur-md"
              >
                {t === "initial"
                  ? "Inicial"
                  : t === "replenishment"
                  ? "Reposición"
                  : "Final"}
              </Button>
            ))}
          </div>

          {/* buscador */}
          <div className="mb-8 relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar cigarrillos…"
              className="
                w-full pl-14 pr-5 py-3 rounded-xl
                bg-white/15 backdrop-blur-md
                border border-white/20 ring-1 ring-inset ring-white/5
                focus:ring-2 focus:ring-sky-400 focus:border-transparent
                text-slate-100 placeholder-slate-300
                shadow-inner
                outline-none transition
              "
            />
          </div>

          {/* grid de tarjetas (glass) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {display.map((c, i) => (
              <div
                key={c.id}
                ref={i === display.length - 1 ? lastCardRef : undefined}
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
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-sky-300 border-t-transparent" />
            </div>
          )}
        </div>
      </main>

      {/* modal de conteo */}
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
