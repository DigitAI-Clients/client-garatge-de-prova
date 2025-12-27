import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as actions from '../actions';
import { bookingService } from '@/services/container';
import { Service, Booking, FormField } from '@/types/models'; // 👈 Afegeix FormField aquí

// 1. Mock de Next.js i llibreries externes
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('next-intl/server', () => ({
  getLocale: vi.fn().mockResolvedValue('ca'),
}));

// 2. Mock del Container de Serveis (bookingService)
vi.mock('@/services/container', () => ({
  bookingService: {
    getAllServices: vi.fn(),
    getDashboardBookings: vi.fn(),
    processBooking: vi.fn(),
    createNewService: vi.fn(),
    getAvailableSlots: vi.fn(),
  },
}));

describe('Booking Server Actions', () => {
  const mockOrgId = 'test-org-123';

  beforeEach(() => {
    vi.clearAllMocks();
    // Configurem l'entorn perquè getOrgId() funcioni
    process.env.NEXT_PUBLIC_ORG_ID = mockOrgId;
  });

  // --- TEST GETTERS ---
  describe('getServices', () => {
    it('hauria de retornar els serveis de l\'organització', async () => {
      // 🛡️ FIX: Construïm un objecte Service complet per evitar 'as any'
      const mockServices: Service[] = [{ 
        id: '1', 
        title: 'Tallada',
        organization_id: mockOrgId,
        description: 'Descripció test',
        price: 20,
        duration_minutes: 30,
        active: true,
        form_schema: [],
        created_at: new Date()
      }];
      
      vi.mocked(bookingService.getAllServices).mockResolvedValue(mockServices);

      const result = await actions.getServices();

      expect(bookingService.getAllServices).toHaveBeenCalledWith(mockOrgId);
      expect(result).toEqual(mockServices);
    });

    it('hauria de gestionar errors retornant array buit', async () => {
      vi.mocked(bookingService.getAllServices).mockRejectedValue(new Error('DB Error'));
      const result = await actions.getServices();
      expect(result).toEqual([]);
    });
  });

  // --- TEST MUTATIONS: CREATE BOOKING ---
  describe('createBookingAction', () => {
    it('hauria de retornar error si falten camps obligatoris', async () => {
      const formData = new FormData();
      // Només posem serviceId, falten la resta
      formData.append('serviceId', 's1');

      const result = await actions.createBookingAction({}, formData);

      expect(result.success).toBe(false);
      expect(result.message).toContain('camps obligatoris');
      expect(bookingService.processBooking).not.toHaveBeenCalled();
    });

    it('hauria de processar la reserva correctament i revalidar', async () => {
      const formData = new FormData();
      formData.append('serviceId', 's1');
      formData.append('name', 'Joan');
      formData.append('email', 'joan@test.com');
      formData.append('date', '2023-10-10');
      formData.append('time', '10:00');
      // Camps custom
      formData.append('custom_notes', 'Al·lèrgia al làtex');

      // 🛡️ FIX: Construïm un objecte Booking vàlid
      const mockBooking: Booking = {
        id: 'b1',
        organization_id: mockOrgId,
        service_id: 's1',
        customer_name: 'Joan',
        customer_email: 'joan@test.com',
        start_time: new Date('2023-10-10T10:00:00'),
        end_time: new Date('2023-10-10T11:00:00'),
        status: 'confirmed',
        user_id: null,
        form_data: { notes: 'Al·lèrgia al làtex' },
        created_at: new Date()
      };

      vi.mocked(bookingService.processBooking).mockResolvedValue(mockBooking);

      const result = await actions.createBookingAction({}, formData);

      // Verifiquem que es crida al servei amb les dades netes i el customData extret
      expect(bookingService.processBooking).toHaveBeenCalledWith(
        expect.objectContaining({
          serviceId: 's1',
          name: 'Joan',
          formData: { notes: 'Al·lèrgia al làtex' } // 'custom_' eliminat
        }),
        mockOrgId
      );

      expect(result.success).toBe(true);
    });

    it('hauria de gestionar errors del servei', async () => {
      const formData = new FormData();
      formData.append('serviceId', 's1');
      formData.append('name', 'Joan');
      formData.append('email', 'joan@test.com');
      formData.append('date', '2023-10-10');
      formData.append('time', '10:00');

      vi.mocked(bookingService.processBooking).mockRejectedValue(new Error('Servei complet'));

      const result = await actions.createBookingAction({}, formData);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Servei complet');
    });
  });

// --- TEST MUTATIONS: CREATE SERVICE (ADMIN) ---
  describe('createServiceAction', () => {
    
    // 🛡️ TIPATGE ESTRICTE: Definim l'schema com a FormField[]
    // Això valida 'key', 'required' i que 'type' sigui un dels valors permesos
    const validSchema: FormField[] = [{ 
      key: 'notes',
      label: 'Notes', 
      type: 'text', 
      required: false
    }];

    it('hauria de crear un servei amb schema JSON vàlid', async () => {
      const formData = new FormData();
      formData.append('title', 'Nou Servei');
      formData.append('price', '50');
      formData.append('duration', '60');
      formData.append('form_schema', JSON.stringify(validSchema));

      // 🛡️ FIX: Mock complet sense 'any'
      // Com que validSchema és estricte (FormField[]), TypeScript l'accepta perfectament
      const mockService: Service = {
        id: 'new-1',
        title: 'Nou Servei',
        organization_id: mockOrgId,
        price: 50,
        duration_minutes: 60,
        form_schema: validSchema, 
        description: null,
        active: true,
        created_at: new Date()
      };
      
      vi.mocked(bookingService.createNewService).mockResolvedValue(mockService);

      await actions.createServiceAction({}, formData);

      expect(bookingService.createNewService).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Nou Servei',
          price: 50,
          form_schema: validSchema
        }),
        mockOrgId
      );
    });

    it('hauria de fallar si el JSON del schema és invàlid', async () => {
      const formData = new FormData();
      formData.append('title', 'Nou Servei');
      formData.append('form_schema', '{ json trencat ...');

      const result = await actions.createServiceAction({}, formData);
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('invàlid');
      expect(bookingService.createNewService).not.toHaveBeenCalled();
    });
  });
});