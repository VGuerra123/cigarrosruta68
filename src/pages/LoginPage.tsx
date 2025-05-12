// src/pages/LoginPage.tsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { signInWithGoogle } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import { LogIn } from 'lucide-react';
import logo from '../assets/logo.webp';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user && !loading) navigate('/');
  }, [user, loading, navigate]);

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-600 to-blue-700 px-4">
      {/* Sutiles difusores de fondo */}
      <div className="absolute -top-10 -left-10 w-80 h-80 bg-white/10 rounded-full blur-2xl" />
      <div className="absolute bottom-16 right-[-8%] w-64 h-64 bg-black/5 rounded-full blur-2xl" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        whileHover={{ scale: 1.01 }}
        className="relative z-10 w-full max-w-sm bg-white/40 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-lg"
      >
        {/* Logo */}
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-5"
        >
          <img src={logo} alt="Pronto Copec Logo" className="h-20 w-auto object-contain" />
        </motion.div>

        {/* Título */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-3xl font-bold text-blue-800 mb-1"
        >
          Conteo de Cigarros
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-sm text-blue-800/70 mb-6"
        >
          Inicia sesión para continuar
        </motion.p>

        {/* Botón de Google */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <Button
            onClick={handleLogin}
            fullWidth
            size="lg"
            className="flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-400 hover:to-blue-600 text-white uppercase py-3 rounded-2xl transition-shadow shadow-md hover:shadow-lg"
            icon={<LogIn size={20} />}
          >
            Iniciar con Google
          </Button>
        </motion.div>

        {/* Pie de página */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-center text-xs text-blue-800/60"
        >
          <p>© {new Date().getFullYear()} Pronto Copec Ruta 68</p>
          <p>Sistema de conteo de cigarros</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
