import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Sunset, Moon, ArrowRight } from 'lucide-react';

interface ShiftCardProps {
  shift: 'morning' | 'afternoon' | 'night';
  title: string;
  hours: string;
  icon: string;
  isRecommended: boolean;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
  onSelect: () => void;
}

const ShiftCard: React.FC<ShiftCardProps> = ({
  shift,
  title,
  hours,
  icon,
  isRecommended,
  isHovered,
  onHover,
  onLeave,
  onSelect
}) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  // Colors based on shift time
  const getGradient = () => {
    switch (shift) {
      case 'morning':
        return 'from-amber-400 to-orange-500';
      case 'afternoon':
        return 'from-sky-500 to-blue-600';
      case 'night':
        return 'from-indigo-700 to-purple-900';
      default:
        return 'from-blue-500 to-indigo-600';
    }
  };

  const getIcon = () => {
    switch (icon) {
      case 'sun':
        return <Sun className="h-6 w-6" />;
      case 'sunset':
        return <Sunset className="h-6 w-6" />;
      case 'moon':
        return <Moon className="h-6 w-6" />;
      default:
        return <Sun className="h-6 w-6" />;
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={onHover}
      onHoverEnd={onLeave}
      onClick={onSelect}
      className={`relative overflow-hidden bg-white/10 backdrop-blur-md rounded-2xl cursor-pointer transition-all duration-300 group border border-white/10 shadow-xl`}
    >
      {/* Background gradient that changes with hover */}
      <motion.div 
        className={`absolute inset-0 bg-gradient-to-r ${getGradient()} opacity-0 transition-opacity duration-300 group-hover:opacity-80`}
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 0.8 : 0 }}
        transition={{ duration: 0.3 }}
      />

      {/* Recommended badge */}
      {isRecommended && (
        <div className="absolute top-4 right-4 z-10">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="bg-white text-xs font-medium text-black px-2 py-1 rounded-full"
          >
            Recomendado
          </motion.div>
        </div>
      )}

      <div className="relative z-10 p-5 flex items-center">
        {/* Icon container */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className={`flex-shrink-0 mr-4 p-3 rounded-xl ${isHovered ? 'bg-white' : 'bg-white/20'} transition-colors duration-300`}
        >
          <motion.div
            animate={{ 
              color: isHovered ? (
                shift === 'morning' ? '#F59E0B' : 
                shift === 'afternoon' ? '#0284C7' : 
                '#4338CA'
              ) : '#FFFFFF'
            }}
            transition={{ duration: 0.3 }}
          >
            {getIcon()}
          </motion.div>
        </motion.div>

        {/* Text content */}
        <div className="flex-grow">
          <h3 className={`font-semibold text-lg ${isHovered ? 'text-white' : 'text-white'}`}>
            {title}
          </h3>
          <p className={`text-sm ${isHovered ? 'text-white' : 'text-white/70'}`}>
            {hours}
          </p>
        </div>

        {/* Arrow indicator */}
        <motion.div
          initial={{ x: -10, opacity: 0 }}
          animate={{ 
            x: isHovered ? 0 : -10, 
            opacity: isHovered ? 1 : 0
          }}
          transition={{ duration: 0.3 }}
          className="ml-4"
        >
          <ArrowRight className="h-5 w-5 text-white" />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ShiftCard;