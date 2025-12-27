'use client';

import { motion, useSpring, useTransform, useInView } from 'framer-motion';
import { useEffect, useRef } from 'react';

// Tipus que ve del JSON
interface StatsData {
    label1: string; value1: string;
    label2: string; value2: string;
    label3: string; value3: string;
}

// Comptador animat (mateix que tenies, és molt bo)
function AnimatedCounter({ value }: { value: string }) {
  const numericValue = parseInt(value.replace(/[^0-9]/g, '')) || 0;
  const suffix = value.replace(/[0-9]/g, ''); 
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const spring = useSpring(0, { mass: 1, stiffness: 75, damping: 15 });
  const display = useTransform(spring, (current) => Math.round(current));

  useEffect(() => {
    if (isInView) spring.set(numericValue);
  }, [isInView, numericValue, spring]);

  return <span ref={ref}><motion.span>{display}</motion.span>{suffix}</span>;
}

export function StatsSection({ data }: { data: StatsData }) { // 👈 Acceptem l'objecte directe
  
  // 🔄 TRANSFORMACIÓ: Objecte -> Array
  const items = [
    { label: data.label1, value: data.value1 },
    { label: data.label2, value: data.value2 },
    { label: data.label3, value: data.value3 },
  ].filter(item => item.label && item.value); // Filtrem els buits

  if (items.length === 0) return null;

  return (
    <section className="py-20 bg-card border-y border-border/50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-border/50">
          {items.map((stat, i) => (
            <div key={i} className="p-4 flex flex-col items-center">
              <div className="text-5xl md:text-6xl font-black mb-2 text-primary tracking-tight">
                 <AnimatedCounter value={stat.value} />
              </div>
              <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}