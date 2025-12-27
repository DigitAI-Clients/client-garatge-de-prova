import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BookingForm } from '../BookingForm';
import { Service } from '@/types/models';

describe('BookingForm Component', () => {
  const mockService: Service = {
    id: 's1',
    title: 'Servei Test',
    organization_id: 'org1',
    price: 10,
    duration_minutes: 30,
    active: true,
    description: '',
    created_at: new Date(),
    // ⚡️ SCHEMA DINÀMIC DE PROVA
    form_schema: [
      { key: 'matricula', label: 'Matrícula Cotxe', type: 'text', required: true }
    ]
  };

  const defaultProps = {
    service: mockService,
    date: new Date(),
    time: '10:00',
    formAction: vi.fn(), // Això és el que passa el useActionState
    isPending: false,
    state: { success: false },
    onBack: vi.fn(),
  };

  it('hauria de renderitzar camps estàndard i dinàmics', () => {
    render(<BookingForm {...defaultProps} />);

    // Camps estàndard
    expect(screen.getByPlaceholderText(/Joan Vila/i)).toBeInTheDocument(); // Nom
    expect(screen.getByPlaceholderText(/joan@exemple.com/i)).toBeInTheDocument(); // Email

    // Camp dinàmic (Matrícula)
    expect(screen.getByText('Matrícula Cotxe')).toBeInTheDocument();
    // Validem que l'input té el name correcte per al backend
    const dynamicInput = screen.getByPlaceholderText('Matrícula Cotxe');
    expect(dynamicInput).toHaveAttribute('name', 'custom_matricula');
    expect(dynamicInput).toBeRequired();
  });

  it('hauria de mostrar errors si el state en té', () => {
    render(<BookingForm {...defaultProps} state={{ success: false, message: 'Error fatal' }} />);
    expect(screen.getByText('Error fatal')).toBeInTheDocument();
  });
});