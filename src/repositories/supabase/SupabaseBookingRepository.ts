// FITXER: src/features/booking/repositories/SupabaseBookingRepository.ts

import { IBookingRepository } from '../interfaces/IBookingRepository';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import {
  ServiceDTO,
  Booking,
  BookingWithService,
  Schedule, 
  FormField 
} from '@/types/models';
import { format } from 'date-fns';
import { Database, Json } from '@/types/database.types';

type ServiceRow = Database['public']['Tables']['services']['Row'];
type ServiceInsert = Database['public']['Tables']['services']['Insert'];
type BookingRow = Database['public']['Tables']['bookings']['Row'];

type BookingJoinRow = BookingRow & {
  services: {
    title: string;
    duration_minutes?: number; 
  } | null
};

export class SupabaseBookingRepository implements IBookingRepository {

  // Mapper: SQL -> ServiceDTO
  private mapService(row: ServiceRow): ServiceDTO {
    return {
      id: row.id,
      
      // ✅ FIX CRÍTIC 1: Ara organization_id és obligatori al Model, l'hem de retornar.
      organization_id: row.organization_id, 
      
      title: row.title,
      description: row.description ?? "",
      duration_minutes: row.duration_minutes ?? 60,
      price: row.price ?? 0,
      
      // ✅ FIX CRÍTIC 2: Mapegem active (si és null a DB, assumim true)
      active: row.active ?? true,

      // Valors per defecte (no existeixen a DB encara)
      currency: "EUR", 
      image_url: undefined, 
      
      form_schema: row.form_schema ? (row.form_schema as unknown as FormField[]) : []
    };
  }

  // Mapper: SQL -> Booking
  private mapBooking(row: BookingRow & { services?: { title: string } | null }): Booking {
    return {
      id: row.id,
      organization_id: row.organization_id,
      service_id: row.service_id,
      user_id: row.user_id,
      customer_name: row.customer_name,
      customer_email: row.customer_email,
      start_time: new Date(row.start_time),
      end_time: new Date(row.end_time),
      status: (row.status as Booking['status']) ?? 'pending',
      created_at: new Date(row.created_at ?? Date.now()),
      form_data: (row.form_data as Record<string, unknown>) || {},
      services: row.services
        ? { title: row.services.title, duration_minutes: 0 }
        : undefined
    };
  }

  async getServices(orgId: string): Promise<ServiceDTO[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('organization_id', orgId)
      .eq('active', true)
      .order('price', { ascending: true });

    if (error) throw new Error(error.message);
    return data.map((row) => this.mapService(row));
  }

  async getServiceById(id: string): Promise<ServiceDTO | null> {
    const supabaseAdmin = createAdminClient();
    const { data } = await supabaseAdmin.from('services').select('*').eq('id', id).single();
    if (!data) return null;
    return this.mapService(data);
  }

  // ✅ Mètode corregit per complir el contracte estricte
  async createService(serviceData: Omit<ServiceDTO, 'id' | 'created_at'>): Promise<ServiceDTO> {
    const supabase = await createClient();

    // Payload que coincideix amb la teva taula SQL
    const payload: ServiceInsert = {
      organization_id: serviceData.organization_id,
      title: serviceData.title,
      description: serviceData.description,
      price: serviceData.price,
      duration_minutes: serviceData.duration_minutes,
      active: serviceData.active, // ✅ Ara active existeix al DTO d'entrada
      form_schema: serviceData.form_schema as unknown as Json
    };

    const { data, error } = await supabase.from('services').insert(payload).select().single();
    if (error) throw new Error(error.message);
    return this.mapService(data);
  }

  // ... (La resta de mètodes es queden igual que els tenies abans)
  async deleteService(id: string): Promise<void> {
    const supabase = await createClient();
    await supabase.from('services').delete().eq('id', id);
  }

  async getBookingsByDateRange(orgId: string, start: Date, end: Date): Promise<Booking[]> {
    const supabaseAdmin = createAdminClient();
    const { data, error } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .eq('organization_id', orgId)
      .gte('start_time', start.toISOString())
      .lte('start_time', end.toISOString());

    if (error) throw new Error(error.message);
    return data.map((row) => this.mapBooking(row));
  }

  async createBooking(bookingData: Omit<Booking, 'id' | 'created_at'>): Promise<Booking> {
    const supabase = await createClient();
    const payload = {
      organization_id: bookingData.organization_id,
      service_id: bookingData.service_id,
      customer_name: bookingData.customer_name,
      customer_email: bookingData.customer_email,
      start_time: bookingData.start_time.toISOString(),
      end_time: bookingData.end_time.toISOString(),
      status: bookingData.status,
      user_id: bookingData.user_id,
      form_data: bookingData.form_data as unknown as Json
    };
    const { data, error } = await supabase.from('bookings').insert(payload).select().single();
    if (error) throw new Error(error.message);
    return this.mapBooking(data);
  }

  async getBookings(orgId: string): Promise<Booking[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('bookings')
      .select('*, services(title, duration_minutes)')
      .eq('organization_id', orgId)
      .order('start_time', { ascending: false });

    if (error) throw new Error(error.message);
    const rows = data as unknown as BookingJoinRow[];
    return rows.map((row) => this.mapBooking(row));
  }

  async getBookingsByUser(userId: string): Promise<BookingWithService[]> {
    const supabase = await createClient();
    const { data } = await supabase
      .from('bookings')
      .select('*, services(title, duration_minutes)')
      .eq('user_id', userId)
      .order('start_time', { ascending: true });
    return (data as unknown as BookingWithService[]) || [];
  }

  async getScheduleForDay(orgId: string, dayOfWeek: number): Promise<Schedule | null> {
    const supabase = await createClient();
    const { data } = await supabase
      .from('schedules')
      .select('*')
      .eq('organization_id', orgId)
      .eq('day_of_week', dayOfWeek)
      .maybeSingle();
    return data as Schedule | null;
  }

  async isDateBlocked(orgId: string, date: Date): Promise<boolean> {
    const supabase = await createClient();
    const dateStr = format(date, 'yyyy-MM-dd');
    const { count } = await supabase
      .from('blocked_dates')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .eq('date', dateStr);
    return (count || 0) > 0;
  }
}