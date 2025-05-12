import React from "react";
import { motion } from "framer-motion";
import { Cigarette } from "../../types";

interface Props {
  cigarette: Cigarette;
  counts: {
    initial: number | null;
    replenishment: number | null;
    final: number | null;
  };
  onSelect: () => void;
}

const CigaretteCard: React.FC<Props> = ({ cigarette, onSelect }) => (
  <motion.button
    whileHover={{ y: -6, boxShadow: "0 12px 32px rgba(0,0,0,0.35)" }}
    whileTap={{ scale: 0.96 }}
    transition={{ type: "spring", stiffness: 260, damping: 18 }}
    onClick={onSelect}
    className="
      relative w-full aspect-[3/4] rounded-2xl
      bg-white/10 border border-white/20 backdrop-blur-md
      shadow-[0_6px_24px_rgba(0,0,0,0.25)]
      ring-1 ring-inset ring-white/15 overflow-hidden
      flex flex-col items-center justify-center p-3 group
    "
  >
    {/* Radial glow on hover */}
    <div
      className="
        pointer-events-none absolute inset-0
        opacity-0 group-hover:opacity-100 transition-opacity duration-300
      "
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-white/5 blur-xl" />
    </div>

    <img
      src={cigarette.image}
      alt={cigarette.name}
      className="h-24 object-contain mb-3 drop-shadow-md"
    />
    <p className="text-sm font-semibold text-gray-50 text-center leading-tight line-clamp-2">
      {cigarette.name}
    </p>
  </motion.button>
);

export default CigaretteCard;
