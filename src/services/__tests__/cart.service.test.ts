import { describe, it, expect } from 'vitest';

// Simulem una interfície de lògica de negoci (pots adaptar-la al teu CartService real)
interface CartItem {
  id: string;
  price: number;
  quantity: number;
}

// Funció pura (Lògica de negoci) que volem testejar
const calculateTotal = (items: CartItem[], taxRate: number): number => {
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  return subtotal + (subtotal * taxRate);
};

describe('CartService Business Logic', () => {
  it('hauria de calcular correctament el total amb impostos', () => {
    // 1. Arrange (Preparar dades)
    const mockItems: CartItem[] = [
      { id: '1', price: 100, quantity: 2 }, // 200
      { id: '2', price: 50, quantity: 1 },  // 50
    ];
    const taxRate = 0.21; // 21% IVA

    // 2. Act (Executar)
    const total = calculateTotal(mockItems, taxRate);

    // 3. Assert (Verificar)
    // 250 + (250 * 0.21) = 250 + 52.5 = 302.5
    expect(total).toBe(302.5);
  });

  it('hauria de retornar 0 si la cistella és buida', () => {
    const total = calculateTotal([], 0.21);
    expect(total).toBe(0);
  });
});