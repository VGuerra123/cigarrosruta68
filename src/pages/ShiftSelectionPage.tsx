import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/layout/Header';
import ShiftSelector from '../components/ui/ShiftSelector';

const ShiftSelectionPage: React.FC = () => {
  const navigate = useNavigate();

  const handleShiftSelect = (shift: 'morning' | 'afternoon' | 'night') => {
    navigate(`/inventory/${shift}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gray-50 flex flex-col"
    >
      <Header title="Seleccionar Turno" showReportsButton />
      
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          <ShiftSelector onSelectShift={handleShiftSelect} />
        </div>
      </main>
    </motion.div>
  );
};

export default ShiftSelectionPage;