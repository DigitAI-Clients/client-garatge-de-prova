import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BookingWidget } from '../BookingWidget';
import { Service } from '@/types/models';
import * as actions from '@/features/booking/actions';

// Mocks de les accions
vi.mock('@/features/booking/actions', () => ({
  createBookingAction: vi.fn(),
  getAvailableSlotsAction: vi.fn(),
}));

const mockServiceFull: Service = {
  id: 's1',
  title: 'Servei 1',
  organization_id: 'org-mock',
  price: 10,
  duration_minutes: 30,
  active: true,
  description: 'Descripció test',
  form_schema: [],
  created_at: new Date()
};

// --- MOCKS DE SUBCOMPONENTS ---

vi.mock('../steps/ServiceList', () => ({
  ServiceList: ({ onSelect }: { onSelect: (s: Service) => void }) => (
    <button onClick={() => onSelect(mockServiceFull)}>Select Service</button>
  )
}));

// MOCK ACTUALITZAT: Botó per triar data
vi.mock('../steps/DateTimeSelector', () => ({
  DateTimeSelector: ({ onTimeSelect, onDateSelect }: { onTimeSelect: (t: string) => void, onDateSelect: (d: Date) => void }) => (
    <div>
      <button onClick={() => onDateSelect(new Date('2023-10-10'))}>Select Date</button>
      <button onClick={() => onTimeSelect('10:00')}>Select Time</button>
    </div>
  )
}));

vi.mock('../steps/BookingForm', () => ({
  BookingForm: () => <div>Formulari Final</div>
}));

describe('BookingWidget Integration', () => {
  const services: Service[] = [mockServiceFull];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('hauria de navegar pels passos correctament', async () => {
    // Mock resposta slots
    vi.mocked(actions.getAvailableSlotsAction).mockResolvedValue({ success: true, slots: ['10:00'] });

    render(<BookingWidget services={services} />);

    // PAS 1: Seleccionar Servei
    fireEvent.click(screen.getByText('Select Service'));

    // PAS 2: Estem al DateTimeSelector.
    // Primer hem de seleccionar una data per disparar la càrrega de slots
    fireEvent.click(screen.getByText('Select Date'));

    // Ara sí, esperem que es cridi l'acció perquè tenim Servei + Data
    await waitFor(() => {
      expect(actions.getAvailableSlotsAction).toHaveBeenCalled();
    });

    // Clicar hora
    fireEvent.click(screen.getByText('Select Time'));

    // PAS 3: Veure formulari
    expect(screen.getByText('Formulari Final')).toBeInTheDocument();
  });
});