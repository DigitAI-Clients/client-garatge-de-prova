'use client';

import { Service } from '@/types/models';
import { ChevronRight, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  services: Service[];
  onSelect: (service: Service) => void;
}

export function ServiceList({ services, onSelect }: Props) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: -20 }} 
      className="space-y-6"
    >
      <h2 className="text-2xl font-bold text-slate-900">Quin servei necessites?</h2>
      <div className="grid gap-4">
        {services.map(service => (
          <button
            key={service.id}
            onClick={() => onSelect(service)}
            className="group flex items-center justify-between p-6 rounded-2xl border border-slate-200 hover:border-primary hover:bg-primary/5 transition-all text-left w-full"
          >
            <div>
              <h3 className="font-bold text-lg text-slate-900 group-hover:text-primary transition-colors">
                {service.title}
              </h3>
              <p className="text-sm text-slate-500 flex items-center gap-1">
                 <Clock size={14} /> {service.duration_minutes} min • <span className="font-semibold text-slate-700">{service.price} €</span>
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
              <ChevronRight className="w-5 h-5" />
            </div>
          </button>
        ))}
      </div>
    </motion.div>
  );
}