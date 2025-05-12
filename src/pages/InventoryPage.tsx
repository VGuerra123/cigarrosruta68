/* eslint-disable react-hooks/exhaustive-deps */
import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AnimatePresence, motion, Variants } from "framer-motion";
import { Search } from "lucide-react";
import Header from "../components/layout/Header";
import CigaretteCard from "../components/ui/CigaretteCard";
import CountModal from "../components/ui/CountModal";
import { cigarettes } from "../data/cigarettes";
import { Cigarette, CountType, InventoryRecord } from "../types";
import {
  saveInventoryCount,
  getCurrentShiftInventory,
} from "../services/firebase";

type ShiftType = "morning" | "afternoon" | "night";
const ITEMS_PER_PAGE = 78;

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.08,
      duration: 0.5,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

const InventoryPage: React.FC = () => {
  const { shift } = useParams<{ shift: string }>();
  const navigate = useNavigate();

  const validShift: ShiftType | null = ["morning", "afternoon", "night"].includes(
    shift!
  )
    ? (shift as ShiftType)
    : null;

  useEffect(() => {
    if (!validShift) navigate("/");
  }, [validShift, navigate]);

  const [countType, setCountType] = useState<CountType>("initial");
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);

  const [inventory, setInventory] = useState<InventoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayedItems, setDisplayedItems] = useState(ITEMS_PER_PAGE);

  const getCounts = (id: string) => {
    const rec = inventory.find((r) => r.cigaretteId === id);
    return {
      initial: rec?.initialCount ?? null,
      replenishment: rec?.replenishment ?? null,
      final: rec?.finalCount ?? null,
    };
  };

  const filtered = useMemo(() => {
    const base = cigarettes
      .filter((c) =>
        c.name.toLowerCase().includes(debouncedSearch.toLowerCase())
      )
      .map((c) => {
        const counts = getCounts(c.id);
        const isCompleted = counts[countType] !== null;
        return { cigarette: c, counts, isCompleted };
      });
    return base.sort((a, b) => Number(a.isCompleted) - Number(b.isCompleted));
  }, [debouncedSearch, countType, inventory]);

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

  const [selected, setSelected] = useState<Cigarette | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleCardSelect = (c: Cigarette) => {
    setSelected(c);
    setShowModal(true);
  };

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
    saveInventoryCount(id, type, count, validShift).catch((err) =>
      console.error("Error guardando optimista:", err)
    );
  };

  const display = filtered.slice(0, displayedItems);
  const getTitle = () =>
    validShift === "morning"
      ? "Turno de Mañana"
      : validShift === "afternoon"
      ? "Turno de Tarde"
      : "Turno de Noche";

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.15),transparent)] opacity-50" />
      </div>

      <Header title={getTitle()} showBackButton showReportsButton />

      <motion.main
        className="flex-1 flex justify-center px-6 py-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="w-full max-w-6xl bg-white/20 backdrop-blur-lg rounded-3xl shadow-xl ring-1 ring-white/30 p-8 transition-shadow hover:shadow-2xl">
          <div className="mb-8 flex justify-center">
            <div className="inline-flex rounded-full bg-white/30 p-1">
              {(["initial", "replenishment", "final"] as CountType[]).map(
                (t) => (
                  <motion.button
                    key={t}
                    onClick={() => setCountType(t)}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                    className={`
                      px-5 py-2 rounded-full text-sm font-medium transition
                      ${
                        countType === t
                          ? "bg-gradient-to-r from-purple-400 to-blue-500 text-white shadow-lg"
                          : "text-gray-800 hover:bg-white/50"
                      }
                    `}
                  >
                    {t === "initial"
                      ? "Inicial"
                      : t === "replenishment"
                      ? "Reposición"
                      : "Final"}
                  </motion.button>
                )
              )}
            </div>
          </div>

          <div className="mb-6 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-200" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar cigarrillos…"
              className="
                w-full pl-12 pr-4 py-3 rounded-xl bg-white/30
                text-white placeholder-gray-200 shadow-inner
                focus:ring-2 focus:ring-purple-400 outline-none transition
              "
            />
          </div>

          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
            variants={{ hidden: {}, visible: {} }}
          >
            {display.map(({ cigarette, counts, isCompleted }, i) => (
              <motion.div
                key={cigarette.id}
                ref={i === display.length - 1 ? lastCardRef : undefined}
                variants={itemVariants}
              >
                <CigaretteCard
                  cigarette={cigarette}
                  counts={counts}
                  onSelect={() => handleCardSelect(cigarette)}
                  disabled={isCompleted}
                />
              </motion.div>
            ))}
          </motion.div>

          {loading && (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent" />
            </div>
          )}
        </div>
      </motion.main>

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
