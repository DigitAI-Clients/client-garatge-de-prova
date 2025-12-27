import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { CartDrawer } from '../cart-drawer'; 
import * as actions from '@/features/ecommerce/actions';
import { useCartStore } from '@/lib/store/cart-store';
import { CartItem } from '@/types/models';
import React from 'react'; // 👈 Necessari per als tipus del Mock

// ----------------------------------------------------------------------
// 🛠️ MOCKS LOCALS
// ----------------------------------------------------------------------

// 1. Mock de Next/Navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

// 2. Mock de Next/Image (CRÍTIC: Arreglat tipatge 'any')
vi.mock('next/image', () => ({
  __esModule: true,
  // 👇 FIX: Usem el tipus natiu de props d'una etiqueta <img>
  default: (props: React.ComponentProps<'img'>) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt || ''} />;
  },
}));

// 3. Mock del Server Action
const mockCheckoutAction = vi.spyOn(actions, 'checkoutAction');

// 4. Mock del Store (Zustand)
vi.mock('@/lib/store/cart-store');

// ----------------------------------------------------------------------
// 📝 DEFINICIONS I DADES
// ----------------------------------------------------------------------

interface CartStoreState {
  isOpen: boolean;
  items: CartItem[];
  totalPrice: () => number;
  toggleCart: () => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
}

const baseMockItem: CartItem = {
  id: '1',
  organization_id: 'org-test-123',
  name: 'Producte Test',
  slug: 'producte-test',

  price: 50,
  quantity: 1,
  stock: 10,

  image: 'https://example.com/img.jpg', // URL absoluta per evitar errors
  
};

// ----------------------------------------------------------------------
// 🧪 TESTS
// ----------------------------------------------------------------------

describe('CartDrawer Component', () => {
  
  const setupStore = (overrides: Partial<CartStoreState> = {}) => {
    const defaultState: CartStoreState = {
      isOpen: true,
      items: [],
      totalPrice: () => 0,
      toggleCart: vi.fn(),
      removeItem: vi.fn(),
      updateQuantity: vi.fn(),
      clearCart: vi.fn(),
      ...overrides
    };
    (useCartStore as unknown as Mock).mockReturnValue(defaultState);
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('hauria de cridar a removeItem al clicar la paperera', () => {
    const mockRemove = vi.fn();
    const mockItem: CartItem = { ...baseMockItem, id: 'prod-1' };
    
    setupStore({
      items: [mockItem],
      removeItem: mockRemove,
      totalPrice: () => 50
    });

    render(<CartDrawer />);
    
    // Busquem el botó per l'aria-label
    const deleteBtn = screen.getByRole('button', { name: /Eliminar producte/i });
    fireEvent.click(deleteBtn);

    expect(mockRemove).toHaveBeenCalledWith('prod-1');
  });

  it('hauria de gestionar el Checkout amb èxit', async () => {
    const mockClear = vi.fn();
    const mockToggle = vi.fn();
    const mockItem: CartItem = { ...baseMockItem };

    setupStore({
      items: [mockItem],
      clearCart: mockClear,
      toggleCart: mockToggle,
      totalPrice: () => 50
    });

    mockCheckoutAction.mockResolvedValue({ 
        success: true, 
        redirectUrl: 'http://stripe.com/pay' 
    });

    render(<CartDrawer />);

    const checkoutBtn = screen.getByRole('button', { name: /Tramitar/i });
    fireEvent.click(checkoutBtn);

    expect(screen.getByText(/Processant/i)).toBeInTheDocument();

    await waitFor(() => {
        expect(mockCheckoutAction).toHaveBeenCalled();
    });

    expect(mockClear).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith('http://stripe.com/pay');
  });
});