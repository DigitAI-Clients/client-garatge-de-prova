import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createProductAction, checkoutAction } from '../actions';
import { ecommerceService } from '@/services/container';

import type { CreateOrderDTO } from '@/types/models';

vi.mock('@/services/container', () => ({
  ecommerceService: {
    createNewProduct: vi.fn(),
    processCheckout: vi.fn(),
  },
}));

vi.mock('@/lib/auth/guards', () => ({
  requireAdmin: vi.fn().mockResolvedValue(true),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('Ecommerce Actions', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_ORG_ID = 'org_123';
    vi.clearAllMocks();
  });

  describe('createProductAction', () => {
    it('hauria de crear producte i retornar success', async () => {
      const formData = new FormData();
      formData.append('name', 'Prod 1');
      formData.append('price', '100');
      formData.append('stock', '10');

      const result = await createProductAction({ success: false, message: '' }, formData);

      expect(ecommerceService.createNewProduct).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Prod 1', price: 100 }),
        'org_123'
      );
      expect(result.success).toBe(true);
    });
  });

  describe('checkoutAction', () => {
    it('hauria de retornar url de redirecció si va bé', async () => {
      vi.mocked(ecommerceService.processCheckout).mockResolvedValue({ redirectUrl: 'https://stripe.com/pay' });
      
      // ✅ CORRECTE: Casting a la interfície esperada, no 'any'
      const orderData = { items: [] } as unknown as CreateOrderDTO;
      
      const result = await checkoutAction(orderData);

      expect(result).toEqual({ success: true, redirectUrl: 'https://stripe.com/pay' });
    });
  });
});