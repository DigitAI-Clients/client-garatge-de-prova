import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ServiceList } from '../ServiceList';
import { Service } from '@/types/models';

describe('ServiceList Component', () => {
  const mockServices: Service[] = [
    { 
      id: '1', 
      title: 'Massatge', 
      price: 50, 
      duration_minutes: 60, 
      description: 'Relax',
      active: true,
      organization_id: 'org1',
      form_schema: [],
      created_at: new Date()
    }
  ];

  it('hauria de renderitzar la llista de serveis', () => {
    const onSelect = vi.fn();
    render(<ServiceList services={mockServices} onSelect={onSelect} />);

    expect(screen.getByText('Massatge')).toBeInTheDocument();
    expect(screen.getByText(/50 €/)).toBeInTheDocument();
  });

  it('hauria de cridar onSelect al fer clic', () => {
    const onSelect = vi.fn();
    render(<ServiceList services={mockServices} onSelect={onSelect} />);

    fireEvent.click(screen.getByText('Massatge'));
    expect(onSelect).toHaveBeenCalledWith(mockServices[0]);
  });
});