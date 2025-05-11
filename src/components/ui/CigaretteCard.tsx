// src/components/ui/CigaretteCard.tsx

import React from 'react';
import { motion } from 'framer-motion';
import { Cigarette, CountType } from '../../types';

interface CigaretteCardProps {
  cigarette: Cigarette;
  onSelect: (cig: Cigarette) => void;
  counts?: {
    initial: number | null;
    replenishment: number | null;
    final: number | null;
  };
}

const CigaretteCard: React.FC<CigaretteCardProps> = ({
  cigarette,
  onSelect,
  counts
}) => {
  const hasInitial = counts?.initial != null;
  const hasReplenishment = counts?.replenishment != null;
  const hasFinal = counts?.final != null;

  const getStatusColor = () => {
    if (hasInitial && hasReplenishment && hasFinal) return 'bg-green-500';
    if (hasInitial || hasReplenishment || hasFinal) return 'bg-yellow-500';
    return 'bg-gray-300';
  };

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      className="relative bg-white rounded-lg shadow-md overflow-hidden"
      onClick={() => onSelect(cigarette)}
    >
      <div
        className={`absolute top-2 right-2 w-3 h-3 rounded-full ${getStatusColor()}`}
        title={
          hasInitial && hasReplenishment && hasFinal
            ? 'Completado'
            : hasInitial || hasReplenishment || hasFinal
              ? 'Parcial'
              : 'Sin iniciar'
        }
      />

      <div className="h-32 bg-gray-100 flex items-center justify-center p-2">
        <img
          src={cigarette.image}
          alt={cigarette.name}
          loading="lazy"
          className="h-full object-contain"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/assets/placeholder.png';
          }}
        />
      </div>

      <div className="p-3">
        <h3
          className="text-sm font-medium text-gray-900 truncate"
          title={cigarette.name}
        >
          {cigarette.name}
        </h3>

        {(hasInitial || hasReplenishment || hasFinal) && (
          <div className="mt-2 text-xs space-y-0.5">
            {hasInitial && (
              <div className="flex justify-between">
                <span className="text-gray-500">Inicial:</span>
                <span className="font-medium">{counts!.initial}</span>
              </div>
            )}
            {hasReplenishment && (
              <div className="flex justify-between">
                <span className="text-gray-500">Reposición:</span>
                <span className="font-medium">{counts!.replenishment}</span>
              </div>
            )}
            {hasFinal && (
              <div className="flex justify-between">
                <span className="text-gray-500">Final:</span>
                <span className="font-medium">{counts!.final}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Memoizamos para que sólo re-renderice la card cambiada :contentReference[oaicite:2]{index=2}:contentReference[oaicite:3]{index=3}
export default React.memo(CigaretteCard);
