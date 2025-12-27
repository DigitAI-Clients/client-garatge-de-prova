'use client';

import { useState, useEffect, useActionState } from 'react';
import { format } from 'date-fns';
import { ca } from 'date-fns/locale';
import { AnimatePresence } from 'framer-motion';
import { Service } from '@/types/models';
import { getAvailableSlotsAction, createBookingAction, BookingActionState } from '@/features/booking/actions';
import { Calendar as CalendarIcon, Clock, Check } from 'lucide-react';
import { motion } from 'framer-motion';

// Importem els sub-components (Separació de responsabilitats)
import { ServiceList } from './steps/ServiceList';
import { DateTimeSelector } from './steps/DateTimeSelector';
import { BookingForm } from './steps/BookingForm';

const initialState: BookingActionState = { success: false };

export function BookingWidget({ services }: { services: Service[] }) {
    // Estat del Wizard
    const [step, setStep] = useState(1);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    
    // Estat de Dades (Slots)
    const [slots, setSlots] = useState<string[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);

    // Server Action Hook
    const [state, formAction, isPending] = useActionState(createBookingAction, initialState);

    // Fetch Slots Effect
    useEffect(() => {
        if (!selectedDate || !selectedService) {
            setSlots([]);
            return;
        }
        const fetchSlots = async () => {
            setLoadingSlots(true);
            try {
                const dateStr = format(selectedDate, 'yyyy-MM-dd');
                const res = await getAvailableSlotsAction(dateStr, selectedService.id);
                setSlots(res.success && res.slots ? res.slots : []);
            } catch (e) {
                console.log(e)
                setSlots([]);
            } finally {
                setLoadingSlots(false);
            }
        };
        fetchSlots();
    }, [selectedDate, selectedService]);

    // Move to Success Step
    useEffect(() => {
        if (state.success) setStep(4);
    }, [state.success]);

    return (
        <div className="bg-white rounded-3xl shadow-xl border border-border overflow-hidden min-h-150 flex flex-col md:flex-row">
            
            {/* SIDEBAR (Context permanent) */}
            <div className="md:w-1/3 bg-slate-50 p-8 border-r border-border flex flex-col">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-8">La teva reserva</h3>
                {selectedService ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">{selectedService.title}</h2>
                        <div className="flex items-center text-slate-500 gap-2 text-sm mb-4">
                            <Clock className="w-4 h-4" /> {selectedService.duration_minutes} min
                        </div>
                    </motion.div>
                ) : (
                    <p className="text-slate-400 italic">Selecciona un servei...</p>
                )}

                <div className="mt-auto space-y-4">
                    {selectedDate && (
                        <div className="flex items-center gap-3 text-slate-700 bg-white p-3 rounded-xl border border-slate-100 shadow-sm animate-in fade-in">
                            <CalendarIcon className="w-5 h-5 text-primary" />
                            <span className="font-medium capitalize">{format(selectedDate, 'PPPP', { locale: ca })}</span>
                        </div>
                    )}
                    {selectedTime && (
                        <div className="flex items-center gap-3 text-slate-700 bg-white p-3 rounded-xl border border-slate-100 shadow-sm animate-in fade-in">
                            <Clock className="w-5 h-5 text-primary" />
                            <span className="font-medium">{selectedTime} h</span>
                        </div>
                    )}
                </div>
            </div>

            {/* ZONA PRINCIPAL (Switch de Passos) */}
            <div className="flex-1 p-8 md:p-12 relative overflow-y-auto">
                <AnimatePresence mode="wait">
                    
                    {step === 1 && (
                        <ServiceList 
                            key="step1" 
                            services={services} 
                            onSelect={(s) => { setSelectedService(s); setStep(2); }} 
                        />
                    )}

                    {step === 2 && (
                        <DateTimeSelector
                            key="step2"
                            selectedDate={selectedDate}
                            onDateSelect={setSelectedDate}
                            slots={slots}
                            isLoadingSlots={loadingSlots}
                            onTimeSelect={(t) => { setSelectedTime(t); setStep(3); }}
                            onBack={() => setStep(1)}
                        />
                    )}

                    {step === 3 && selectedService && selectedDate && selectedTime && (
                        <BookingForm
                            key="step3"
                            service={selectedService}
                            date={selectedDate}
                            time={selectedTime}
                            formAction={formAction}
                            isPending={isPending}
                            state={state}
                            onBack={() => setStep(2)}
                        />
                    )}

                    {step === 4 && (
                        <motion.div key="step4" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center justify-center h-full text-center py-12">
                            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-sm animate-bounce">
                                <Check className="w-12 h-12" />
                            </div>
                            <h2 className="text-3xl font-bold text-slate-900 mb-4">Reserva Confirmada!</h2>
                            <button onClick={() => window.location.reload()} className="px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800">
                                Tornar a l'inici
                            </button>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
    );
}