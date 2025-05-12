import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/layout/Header';
import ParticleBackground, { TimeOfDay } from '../components/ui/Background';
import { Sun, Sunset, Moon } from 'lucide-react';

/* -------------------------------------------------------------------------- */
/*  Data                                                                     */
/* -------------------------------------------------------------------------- */
const shifts = [
  { id: 'morning',   label: 'Mañana',  hours: '07:00 – 15:00', icon: Sun   },
  { id: 'afternoon', label: 'Tarde',   hours: '15:00 – 23:00', icon: Sunset },
  { id: 'night',     label: 'Noche',   hours: '23:00 – 07:00', icon: Moon  },
] as const;

/* Hora actual → tramo del día */
const hour = new Date().getHours();
const timeOfDay: TimeOfDay =
  hour >= 7 && hour < 15 ? 'morning'
  : hour >= 15 && hour < 23 ? 'afternoon'
  : 'night';

/* Utilidades */
const capitalize = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);
const today = capitalize(
  new Date().toLocaleDateString('es-CL', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  }),
);

/* Animaciones */
const containerVariants = {
  visible: (i = 1) => ({
    transition: { staggerChildren: 0.12, delayChildren: 0.15 * i },
  }),
};
const cardVariants = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 60 } },
};

/* -------------------------------------------------------------------------- */
/*  Componente                                                               */
/* -------------------------------------------------------------------------- */
const ShiftSelectionPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden font-inter">
      {/* Fondo con partículas */}
      <ParticleBackground timeOfDay={timeOfDay} />

      {/* Header corporativo (intacto) */}
      <Header title="" showBackButton={false} showReportsButton={false} />

      {/* Contenido principal */}
      <motion.main
        className="relative z-10 flex flex-col items-center pt-24 px-4"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.h1
          className="text-white text-3xl sm:text-4xl font-semibold tracking-tight drop-shadow-lg"
          variants={cardVariants}
        >
          Selecciona tu Turno
        </motion.h1>
        <motion.p
          className="text-blue-200 mt-1 drop-shadow-sm"
          variants={cardVariants}
        >
          {today}
        </motion.p>

        <motion.ul
          className="w-full max-w-md mt-10 space-y-7"
          variants={containerVariants}
          custom={2}
        >
          {shifts.map(({ id, label, hours, icon: Icon }) => (
            <motion.li key={id} variants={cardVariants}>
              <button
                aria-label={`Seleccionar turno de ${label}`}
                onClick={() => navigate(`/inventory/${id}`)}
                className="
                  group relative w-full flex items-center justify-between
                  rounded-3xl px-6 py-5 text-left
                  bg-gradient-to-r from-white/10 via-white/5 to-white/10
                  ring-1 ring-white/15 backdrop-blur-md
                  transition
                  hover:ring-white/25 focus-visible:ring-2 focus-visible:ring-white
                "
              >
                <span
                  className="
                    pointer-events-none absolute inset-0 rounded-3xl
                    opacity-0 group-hover:opacity-100
                    transition
                    bg-white/5 blur-md
                  "
                />

                <div className="relative flex items-center space-x-4">
                  <div
                    className="
                      w-14 h-14 grid place-items-center rounded-xl
                      bg-white/25 group-hover:bg-white/30 transition
                      shadow-[inset_0_1px_2px_rgba(255,255,255,0.15)]
                    "
                  >
                    <Icon size={28} color="white" strokeWidth={1.8} />
                  </div>
                  <div>
                    <p className="text-white text-lg font-medium">{label}</p>
                    <p className="text-blue-100 text-sm">{hours}</p>
                  </div>
                </div>

                {id === 'night' && (
                  <span
                    className="
                      relative z-10 rounded-full bg-white text-blue-800
                      text-[11px] font-semibold px-3 py-1 shadow select-none
                    "
                  >
                    Recomendado
                  </span>
                )}
              </button>
            </motion.li>
          ))}
        </motion.ul>
      </motion.main>

      {/* Footer con parpadeo */}
      <footer
        className="
          absolute inset-x-0 bottom-10     /* ⬆️  más alto */
          z-10 flex justify-center pointer-events-none
        "
      >
        <span
          className="
            text-sm text-blue-200/70 font-medium   /* transparencia base */
            animate-blink                           /* parpadeo */
          "
        >
          © 2025 Sistema de Turnos <strong>Pronto Copec Ruta 68</strong>
        </span>
      </footer>
    </div>
  );
};

export default ShiftSelectionPage;
