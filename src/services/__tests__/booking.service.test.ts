import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BookingService } from '../BookingService'; 
import { IBookingRepository } from '@/repositories/interfaces/IBookingRepository';
import { Service, Schedule, Booking } from '@/types/models';

// Definim un tipus Mocked segur
type MockBookingRepository = {
  [K in keyof IBookingRepository]: ReturnType<typeof vi.fn>;
};

// 1. Creem el Mock del Repositori sense 'any'
const mockRepo = {
  getServices: vi.fn(),
  getServiceById: vi.fn(),
  createService: vi.fn(),
  createBooking: vi.fn(),
  getBookings: vi.fn(),
  getBookingsByUser: vi.fn(),
  isDateBlocked: vi.fn(),
  getScheduleForDay: vi.fn(),
  getBookingsByDateRange: vi.fn(),
} as unknown as MockBookingRepository;

describe('BookingService Logic', () => {
  let service: BookingService;
  const orgId = 'test-org';

  beforeEach(() => {
    vi.clearAllMocks();
    // Injectem el mock tipat com si fos el real
    service = new BookingService(mockRepo as unknown as IBookingRepository);
  });

  // --- BLOC 1: Validacions de Creació ---
  describe('createNewService', () => {
    it('hauria de llançar error amb preus negatius', async () => {
      // utilitzem 'expect.assertions' per assegurar que el test no passa si no falla
      expect.assertions(1);
      
      await expect(service.createNewService({
        title: 'Test', description: '', price: -10, duration: 30
      }, orgId)).rejects.toThrow("El preu no pot ser negatiu");
    });

    it('hauria de crear el servei si tot és correcte', async () => {
      const input = { title: 'Tallada', description: 'Simple', price: 15, duration: 30 };
      
      // Construïm la resposta esperada sense 'any'
      const mockResponse: Service = {
        id: '1',
        organization_id: orgId,
        title: input.title,
        description: input.description,
        price: input.price,
        duration_minutes: input.duration,
        active: true,
        form_schema: [],
        created_at: new Date(),
        // 🚫 FIX: Eliminat updated_at perquè no existeix a la interfície Service
      };

      vi.mocked(mockRepo.createService).mockResolvedValue(mockResponse);

      const result = await service.createNewService(input, orgId);

      expect(mockRepo.createService).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Tallada',
        price: 15
      }));
      expect(result.id).toBe('1');
    });
  });

  // --- BLOC 2: Procés de Reserva ---
  describe('processBooking', () => {
    it('hauria de calcular correctament la data final (endTime)', async () => {
      const input = {
        serviceId: 's1', name: 'Pep', email: 'pep@test.com',
        date: '2023-10-10', time: '10:00'
      };

      // Mock del servei
      const mockService: Service = {
        id: 's1', 
        duration_minutes: 60, 
        title: 'Massatge',
        organization_id: orgId,
        description: '',
        price: 50,
        active: true,
        form_schema: [],
        created_at: new Date(),
        // 🚫 FIX: Eliminat updated_at
      };
      
      vi.mocked(mockRepo.getServiceById).mockResolvedValue(mockService);

      // Mock de creació de booking
      vi.mocked(mockRepo.createBooking).mockImplementation(async (data) => ({
        ...data,
        id: 'b1',
        created_at: new Date(),
        services: null 
      } as Booking));

      const result = await service.processBooking(input, orgId);

      // Verifiquem matemàtiques de dates
      const expectedStart = new Date('2023-10-10T10:00:00');
      const expectedEnd = new Date('2023-10-10T11:00:00'); // 10:00 + 60min

      expect(result.start_time).toEqual(expectedStart);
      expect(result.end_time).toEqual(expectedEnd);
    });
  });

  // --- BLOC 3: Algoritme d'Slots ---
  describe('getAvailableSlots', () => {
    const dateStr = '2023-10-10'; 

    it('hauria de retornar buit si el dia està bloquejat', async () => {
      vi.mocked(mockRepo.isDateBlocked).mockResolvedValue(true);
      const slots = await service.getAvailableSlots(dateStr, 's1', orgId);
      expect(slots).toEqual([]);
    });

    it('hauria de calcular slots lliures sense solapaments', async () => {
      // 1. Setup
      vi.mocked(mockRepo.isDateBlocked).mockResolvedValue(false);
      
      const mockSchedule: Schedule = {
        id: 'sch1',
        day_of_week: 2,
        start_time: '09:00:00',
        end_time: '11:00:00',
        is_active: true
      };
      vi.mocked(mockRepo.getScheduleForDay).mockResolvedValue(mockSchedule);

      const mockService: Service = {
        id: 's1', 
        duration_minutes: 60,
        organization_id: orgId,
        title: 'Test',
        description: null,
        price: 10,
        active: true,
        form_schema: [],
        created_at: new Date(),
        // 🚫 FIX: Eliminat updated_at
      };
      vi.mocked(mockRepo.getServiceById).mockResolvedValue(mockService);

      // RESERVA EXISTENT: 09:00 - 10:00
      const existingBooking: Booking = {
        id: 'b_old',
        organization_id: orgId,
        service_id: 's1',
        customer_name: 'Existing',
        customer_email: 'ex@test.com',
        start_time: new Date('2023-10-10T09:00:00'),
        end_time: new Date('2023-10-10T10:00:00'),
        status: 'confirmed',
        user_id: null,
        created_at: new Date(),
        form_data: {}
      };
      vi.mocked(mockRepo.getBookingsByDateRange).mockResolvedValue([existingBooking]);

      // 2. Execució
      const slots = await service.getAvailableSlots(dateStr, 's1', orgId);

      // 3. Verificació
      expect(slots).toContain('10:00');
      expect(slots).not.toContain('09:00');
    });
  });
});