// src/components/ui/CountModal.tsx

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cigarette, CountType } from '../../types';
import Button from './Button';
import { X } from 'lucide-react';

interface CountModalProps {
  isOpen: boolean;
  onClose: () => void;
  cigarette: Cigarette | null;
  onSave: (
    cigaretteId: string,
    countType: CountType,
    count: number
  ) => Promise<void>;
  countType: CountType;
  currentCount?: number | null;
}

const CountModal: React.FC<CountModalProps> = ({
  isOpen,
  onClose,
  cigarette,
  onSave,
  countType,
  currentCount
}) => {
  const [count, setCount] = useState<string>(currentCount?.toString() || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!cigarette) return;
    if (!count.trim()) {
      setError('Por favor ingrese una cantidad');
      return;
    }
    const countValue = parseInt(count.trim(), 10);
    if (isNaN(countValue) || countValue < 0) {
      setError('Ingrese un número válido');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await onSave(cigarette.id, countType, countValue);
      onClose();
    } catch {
      setError('Error al guardar. Inténtelo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const labels = {
    initial: 'Cantidad Inicial',
    replenishment: 'Reposición',
    final: 'Cantidad Final'
  } as const;

  return (
    <AnimatePresence>
      {isOpen && cigarette && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-lg shadow-lg w-full max-w-sm"
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                {labels[countType]}
              </h2>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center mr-3">
                  <img
                    src={cigarette.image}
                    alt={cigarette.name}
                    className="h-full object-contain p-1"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/placeholder.jpg';
                    }}
                  />
                </div>
                <h3 className="text-md font-medium">{cigarette.name}</h3>
              </div>

              <div className="mb-4">
                <label htmlFor="count" className="block text-sm font-medium text-gray-700 mb-1">
                  Cantidad
                </label>
                <input
                  id="count"
                  type="number"
                  min="0"
                  value={count}
                  onChange={(e) => setCount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  fullWidth
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSave}
                  fullWidth
                  disabled={isLoading}
                  className="relative"
                >
                  {isLoading ? (
                    <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    'Guardar'
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CountModal;
