// src/components/ui/ShiftSelector.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Sunset } from 'lucide-react';

interface ShiftSelectorProps {
  onSelectShift: (shift: 'morning' | 'afternoon' | 'night') => void;
}

const shifts = [
  { id: 'morning', name: 'Mañana', Icon: Sun },
  { id: 'afternoon', name: 'Tarde', Icon: Sunset },
  { id: 'night', name: 'Noche', Icon: Moon },
] as const;

// Variants para animar la aparición
const container = {
  hidden: { opacity: 0, y: 32 },
  show: {
    opacity: 1,
    y: 0,
    transition: { when: 'beforeChildren', staggerChildren: 0.12 },
  },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

const ShiftSelector: React.FC<ShiftSelectorProps> = ({ onSelectShift }) => (
  <motion.section
    variants={container}
    initial="hidden"
    animate="show"
    className="
      w-full max-w-md mx-auto
      px-6 py-8
      bg-gradient-to-br from-white to-blue-50/40
      backdrop-blur-sm rounded-3xl
      shadow-xl
      "
  >
    <motion.h2
      variants={item}
      className="
        text-2xl md:text-3xl font-semibold
        text-blue-700 text-center
        mb-6
        relative
      "
    >
      Selecciona tu turno
      {/* Línea de acento bajo el título */}
      <span className="absolute bottom-0 left-1/2 w-16 h-0.5 bg-blue-600 rounded-full -translate-x-1/2"></span>
    </motion.h2>

    <div className="flex flex-col gap-5">
      {shifts.map(({ id, name, Icon }) => (
        <motion.button
          key={id}
          variants={item}
          onClick={() => onSelectShift(id)}
          whileHover={{ translateY: -3 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 140, damping: 18 }}
          className="
            flex items-center w-full
            bg-white rounded-2xl p-4
            shadow-md hover:shadow-2xl
            focus:outline-none focus:ring-2 focus:ring-blue-300
            transition-shadow duration-200
          "
          aria-label={`Seleccionar turno ${name}`}
        >
          <motion.span
            className="
              flex-shrink-0 grid place-items-center
              w-14 h-14 rounded-full
              bg-blue-100 text-blue-600
            "
            whileHover={{ scale: 1.1, rotate: 10 }}
            transition={{ type: 'spring', stiffness: 200, damping: 12 }}
          >
            <Icon size={26} />
          </motion.span>

          <span className="ml-5 text-lg md:text-xl font-medium text-slate-800">
            {name}
          </span>
        </motion.button>
      ))}
    </div>
  </motion.section>
);

export default ShiftSelector;
