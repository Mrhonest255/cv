import React from 'react';

export default function Particles({ count = 24, className = '' }: { count?: number, className?: string }) {
  const items = Array.from({ length: count });
  return (
    <div aria-hidden="true" role="presentation" className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className}`}>
      {items.map((_, i) => (
        <span
          key={i}
          className="absolute block rounded-full bg-white/30 dark:bg-white/10 shadow-[0_0_20px_rgba(255,255,255,0.2)] animate-float"
          style={{
            width: `${Math.random() * 6 + 3}px`,
            height: `${Math.random() * 6 + 3}px`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 10}s`,
            animationDuration: `${12 + Math.random() * 8}s`,
          }}
        />
      ))}
    </div>
  );
}
