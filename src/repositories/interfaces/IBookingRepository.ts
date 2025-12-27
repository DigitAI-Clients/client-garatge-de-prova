import { ServiceDTO, Booking, BookingWithService, Schedule } from '@/types/models';

export interface IBookingRepository {
  getServices(orgId: string): Promise<ServiceDTO[]>;
  getServiceById(id: string): Promise<ServiceDTO | null>;
  
  // ✅ Aquí està la clau: Al fer Omit de 'id' i 'created_at', 
  // TypeScript veu que 'organization_id' (que hem afegit al pas 1) ÉS OBLIGATORI.
  createService(service: Omit<ServiceDTO, 'id' | 'created_at'>): Promise<ServiceDTO>;
  
  // ... altres mètodes
  deleteService(id: string): Promise<void>;
  getBookingsByDateRange(orgId: string, start: Date, end: Date): Promise<Booking[]>;
  createBooking(booking: Omit<Booking, 'id' | 'created_at'>): Promise<Booking>;
  getBookings(orgId: string): Promise<Booking[]>;
  getBookingsByUser(userId: string): Promise<BookingWithService[]>;
  getScheduleForDay(orgId: string, dayOfWeek: number): Promise<Schedule | null>;
  isDateBlocked(orgId: string, date: Date): Promise<boolean>;
}