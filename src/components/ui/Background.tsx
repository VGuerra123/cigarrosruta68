// src/components/ui/ParticleBackground.tsx
import React, { useEffect, useRef } from 'react';

export type TimeOfDay = 'morning' | 'afternoon' | 'night';

interface ParticleBackgroundProps {
  timeOfDay?: TimeOfDay;
}

const gradients: Record<TimeOfDay, string> = {
  morning:   'from-[#6EB5FF] via-[#4C95FF] to-[#3578E6]',
  afternoon: 'from-[#4C84FF] via-[#3A6FFF] to-[#0048CA]',
  night:     'from-[#2E3A80] via-[#1B2760] to-[#0D173F]',
};

const ParticleBackground: React.FC<ParticleBackgroundProps> = ({
  timeOfDay = 'afternoon',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const DPR = window.devicePixelRatio || 1;

    let w = (canvas.width = window.innerWidth * DPR);
    let h = (canvas.height = window.innerHeight * DPR);
    ctx.scale(DPR, DPR);

    const particles: {
      x: number; y: number; size: number;
      vx: number; vy: number; opacity: number;
    }[] = [];

    const init = () => {
      particles.length = 0;
      const count = Math.round((w / DPR + h / DPR) / 28);
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * (w / DPR),
          y: Math.random() * (h / DPR),
          size: Math.random() * 3 + 1,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          opacity: Math.random() * 0.25 + 0.1,
        });
      }
    };

    const onResize = () => {
      w = canvas.width = window.innerWidth * DPR;
      h = canvas.height = window.innerHeight * DPR;
      ctx.scale(DPR, DPR);
      init();
    };
    window.addEventListener('resize', onResize);

    init();
    let rafId: number;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      particles.forEach(p => {
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w / DPR) p.vx *= -1;
        if (p.y < 0 || p.y > h / DPR) p.vy *= -1;
      });
      rafId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <div
      className={`
        absolute inset-0 -z-20 overflow-hidden
        bg-gradient-to-b ${gradients[timeOfDay]}
      `}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
    </div>
  );
};

export default ParticleBackground;
