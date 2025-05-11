import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { signInWithGoogle } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import { LogIn } from 'lucide-react';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user && !loading) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
      navigate('/');
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-500 to-blue-700 flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white rounded-xl shadow-xl p-8"
      >
        <div className="text-center mb-8">
          <img 
            src="/assets/logo.png" 
            alt="Pronto Copec Logo" 
            className="h-20 mx-auto mb-4"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'public/assets/logo.webp';
            }}
          />
          <h1 className="text-2xl font-bold text-gray-800">Conteo de Cigarros</h1>
          <p className="text-gray-600 mt-2">Inicia sesión para continuar</p>
        </div>
        
        <div className="space-y-4">
          <Button
            onClick={handleLogin}
            fullWidth
            size="lg"
            className="transition-all duration-300 hover:shadow-md"
            icon={<LogIn size={20} />}
          >
            Iniciar con Google
          </Button>
          
          <div className="text-center text-sm text-gray-500 mt-6">
            <p>© {new Date().getFullYear()} Pronto Copec</p>
            <p className="mt-1">Sistema de conteo de cigarros</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;