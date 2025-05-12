import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ShiftCard from './ShiftCard.tsx';
import { formatCurrentDate } from '../../utils/timeUtils';

interface ShiftSelectorProps {
  onSelectShift: (shift: 'morning' | 'afternoon' | 'night') => void;
  currentTimeOfDay: 'morning' | 'afternoon' | 'night';
}

const ShiftSelector: React.FC<ShiftSelectorProps> = ({ onSelectShift, currentTimeOfDay }) => {
  const [hoveredShift, setHoveredShift] = useState<string | null>(null);
  const formattedDate = formatCurrentDate();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    }
  };

  const shifts = [
    {
      id: 'morning',
      title: 'Mañana',
      hours: '07:00 - 15:00',
      icon: 'sun',
    },
    {
      id: 'afternoon',
      title: 'Tarde',
      hours: '15:00 - 23:00',
      icon: 'sunset',
    },
    {
      id: 'night',
      title: 'Noche',
      hours: '23:00 - 07:00',
      icon: 'moon',
    }
  ];

  return (
    <div className="p-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-6 text-center"
      >
        <h2 className="text-white text-2xl md:text-3xl font-semibold mb-2">Selecciona tu Turno</h2>
        <p className="text-white/70 text-sm md:text-base">{formattedDate}</p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-4"
      >
        {shifts.map((shift) => (
          <ShiftCard
            key={shift.id}
            shift={shift.id as 'morning' | 'afternoon' | 'night'}
            title={shift.title}
            hours={shift.hours}
            icon={shift.icon}
            isRecommended={shift.id === currentTimeOfDay}
            isHovered={hoveredShift === shift.id}
            onHover={() => setHoveredShift(shift.id)}
            onLeave={() => setHoveredShift(null)}
            onSelect={() => onSelectShift(shift.id as 'morning' | 'afternoon' | 'night')}
          />
        ))}
      </motion.div>
    </div>
  );
};

export default ShiftSelector;