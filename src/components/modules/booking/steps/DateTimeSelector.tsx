'use client';

import { DayPicker } from 'react-day-picker';
import { ca } from 'date-fns/locale';
import { Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import 'react-day-picker/dist/style.css';

interface Props {
  selectedDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
  slots: string[];
  isLoadingSlots: boolean;
  onTimeSelect: (time: string) => void;
  onBack: () => void;
}

export function DateTimeSelector({ selectedDate, onDateSelect, slots, isLoadingSlots, onTimeSelect, onBack }: Props) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: -20 }} 
      className="h-full flex flex-col"
    >
      <button onClick={onBack} className="text-sm text-slate-400 hover:text-slate-600 mb-6 flex items-center gap-1 self-start">
        ← Tornar als serveis
      </button>
      
      <div className="flex flex-col xl:flex-row gap-12">
        {/* CALENDARI */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-6">Tria un dia</h2>
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={onDateSelect}
            locale={ca}
            disabled={{ before: new Date() }}
            modifiersClassNames={{
              selected: 'bg-primary text-white hover:bg-primary hover:text-white rounded-lg'
            }}
            className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm inline-block"
          />
        </div>

        {/* SLOTS */}
        <div className="flex-1">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Hores lliures</h2>
          {!selectedDate ? (
            <p className="text-slate-400 text-sm">Selecciona un dia del calendari.</p>
          ) : isLoadingSlots ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : slots.length === 0 ? (
            <p className="text-red-400 text-sm bg-red-50 p-3 rounded-lg flex items-center gap-2">
              <AlertCircle size={16} /> No hi ha hores disponibles.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {slots.map(slot => (
                <button
                  key={slot}
                  onClick={() => onTimeSelect(slot)}
                  className="px-2 py-3 text-sm font-medium rounded-lg border border-slate-200 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all text-center"
                >
                  {slot}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}