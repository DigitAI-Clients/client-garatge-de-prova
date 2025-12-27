import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChatWidget } from '../chat-widget'; 

// Mock globals
global.fetch = vi.fn();
window.HTMLElement.prototype.scrollIntoView = vi.fn();

describe('ChatWidget Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('hauria d\'obrir-se al clicar', () => {
    render(<ChatWidget />);
    // Inicialment només hi ha 1 botó (el Toggle)
    fireEvent.click(screen.getByRole('button')); 
    expect(screen.getByText(/Hola!/i)).toBeInTheDocument();
  });

  it('hauria d\'enviar un missatge i mostrar la resposta', async () => {
    const { container } = render(<ChatWidget />);
    
    // 1. Obrim el xat (Botó Toggle)
    fireEvent.click(screen.getByRole('button'));

    // 2. Mock de l'API
    vi.mocked(global.fetch).mockResolvedValue({
      json: async () => ({ content: 'Soc la IA responent' }),
      ok: true
    } as Response);

    // 3. Escriure a l'input
    const input = screen.getByPlaceholderText(/Escriu la teva pregunta/i);
    fireEvent.change(input, { target: { value: 'Com et dius?' } });

    // ✅ FIX: Buscar el botó d'enviar específicament pel seu tipus
    // Així evitem clicar el botó Toggle (que tancaria el xat) o el botó X
    const submitBtn = container.querySelector('button[type="submit"]');
    if (!submitBtn) throw new Error("No s'ha trobat el botó de submit");
    
    fireEvent.click(submitBtn); 
    
    // 4. Esperar que el missatge aparegui al xat (ja no a l'input)
    await waitFor(() => {
      expect(screen.getByText('Com et dius?')).toBeInTheDocument();
    });

    // 5. Esperar resposta de la IA
    await waitFor(() => {
      expect(screen.getByText('Soc la IA responent')).toBeInTheDocument();
    });
  });
});