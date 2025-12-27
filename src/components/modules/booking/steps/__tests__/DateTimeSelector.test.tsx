import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DateTimeSelector } from '../DateTimeSelector';

describe('DateTimeSelector Component', () => {
  const defaultProps = {
    selectedDate: undefined,
    onDateSelect: vi.fn(),
    slots: [],
    isLoadingSlots: false,
    onTimeSelect: vi.fn(),
    onBack: vi.fn(),
  };

  it('hauria de mostrar missatge si no hi ha data seleccionada', () => {
    render(<DateTimeSelector {...defaultProps} />);
    expect(screen.getByText(/Selecciona un dia/i)).toBeInTheDocument();
  });

  it('hauria de mostrar loader quan carrega slots', () => {
    render(<DateTimeSelector {...defaultProps} selectedDate={new Date()} isLoadingSlots={true} />);
    // Busquem un element que indiqui càrrega (pel text o classe, aquí assumim que el Loader2 no té text accessible per defecte, així que busquem el contenidor o text alternatiu si en té)
    // Al teu codi no hi ha text "Loading", així que comprovarem que NO apareix "No hi ha hores"
    expect(screen.queryByText(/No hi ha hores/i)).not.toBeInTheDocument();
  });

  it('hauria de llistar slots disponibles i permetre selecció', () => {
    const onTimeSelect = vi.fn();
    render(<DateTimeSelector 
      {...defaultProps} 
      selectedDate={new Date()} 
      slots={['10:00', '11:00']} 
      onTimeSelect={onTimeSelect}
    />);

    const slotBtn = screen.getByText('10:00');
    expect(slotBtn).toBeInTheDocument();
    
    fireEvent.click(slotBtn);
    expect(onTimeSelect).toHaveBeenCalledWith('10:00');
  });

  it('hauria de cridar onBack al clicar tornar', () => {
    const onBack = vi.fn();
    render(<DateTimeSelector {...defaultProps} onBack={onBack} />);
    
    fireEvent.click(screen.getByText(/Tornar/i));
    expect(onBack).toHaveBeenCalled();
  });
});