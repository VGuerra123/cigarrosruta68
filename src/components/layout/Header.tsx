import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, ChevronLeft, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { signOut } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  showReportsButton?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  title = '',
  showBackButton = false,
  showReportsButton = false,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [scrollPct, setScrollPct] = useState(0);

  useEffect(() => {
    const handler = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.body.scrollHeight - window.innerHeight;
      setScrollPct(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const isReportsPage = location.pathname === '/reports';

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header
      className="
        sticky top-0 z-50
        backdrop-filter backdrop-blur-lg
        bg-blue-600/50
        border-b border-blue-500/30
        shadow-[0_4px_30px_rgba(0,0,0,0.3)]
      "
    >
      {/* Progress bar */}
      <div
        className="
          h-1
          bg-gradient-to-r
          from-purple-400/80 via-blue-300/80 to-blue-500/80
        "
        style={{ width: `${scrollPct}%`, transition: 'width 0.2s ease-out' }}
      />

      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center space-x-3">
          {showBackButton && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate(-1)}
              className="p-2 rounded-full hover:bg-blue-500/30 transition-shadow shadow-lg"
              aria-label="Atrás"
            >
              <ChevronLeft size={24} />
            </motion.button>
          )}

          <motion.img
            src="/assets/prontin-fumador.webp"
            alt="Pronto Copec"
            className="
              h-10 w-auto cursor-pointer
              filter drop-shadow-[0_0_6px_rgba(255,255,255,0.6)]
            "
            onError={e => { (e.target as HTMLImageElement).src = '/assets/logo.png'; }}
            onClick={() => navigate('/')}
            animate={{ opacity: [1, 0.7, 1] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          />

          {title && (
            <motion.h1
              className="text-lg font-semibold ml-4 text-white"
              initial="rest"
              whileHover="hover"
              animate="rest"
              variants={{
                rest: { textShadow: '0 0 0 rgba(255,255,255,0)' },
                hover: { textShadow: '0 0 8px rgba(255,255,255,0.8)' },
              }}
              transition={{ duration: 0.3 }}
            >
              {title}
            </motion.h1>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-2">
          {showReportsButton && !isReportsPage && (
            <motion.button
              whileHover={{ rotate: 10, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/reports')}
              className="p-2 rounded-full hover:bg-blue-500/30 transition-shadow shadow-lg"
              title="Ver reportes"
            >
              <BarChart3 size={22} />
            </motion.button>
          )}

          {user && (
            <motion.button
              whileHover={{ rotate: 10, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleSignOut}
              className="p-2 rounded-full hover:bg-blue-500/30 transition-shadow shadow-lg"
              title="Cerrar sesión"
            >
              <LogOut size={22} />
            </motion.button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
