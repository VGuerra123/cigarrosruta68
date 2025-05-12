import React from "react";
import { motion, Variants } from "framer-motion";
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

// Hover & tap states with rotate + shadow bounce
const cardVariants: Variants = {
  rest: { scale: 1, rotate: 0, boxShadow: "0 6px 24px rgba(0,0,0,0.2)" },
  hover: {
    scale: 1.04,
    rotate: -1,
    boxShadow: "0 12px 32px rgba(0,0,0,0.3)",
  },
  tap: { scale: 0.96, rotate: 0 },
};

const CigaretteCard: React.FC<Props> = ({ cigarette, onSelect }) => (
  <motion.button
    initial="rest"
    whileHover="hover"
    whileTap="tap"
    variants={cardVariants}
    transition={{ type: "spring", stiffness: 260, damping: 20 }}
    onClick={onSelect}
    className="
      relative w-full aspect-[3/4] rounded-2xl
      bg-white/30 border border-white/40 backdrop-blur-md
      shadow-lg ring-1 ring-white/30 overflow-hidden
      flex flex-col items-center justify-center p-4 group
    "
  >
    {/* Radial glow on hover */}
    <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-300/40 to-blue-400/30 blur-xl" />
    </div>

    <img
      src={cigarette.image}
      alt={cigarette.name}
      className="h-28 object-contain mb-3 drop-shadow-md"
    />
    <p className="text-sm font-semibold text-white text-center leading-tight line-clamp-2">
      {cigarette.name}
    </p>
  </motion.button>
);

export default CigaretteCard;
