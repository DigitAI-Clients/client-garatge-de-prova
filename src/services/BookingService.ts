import { IBookingRepository } from '@/repositories/interfaces/IBookingRepository'; 
import { ServiceDTO as Service, Booking, FormField } from '@/types/models'; 
import { addMinutes, format, set } from 'date-fns';

// DTOs d'entrada (Input Models) específics per al cas d'ús
type NewServiceInput = {
  title: string;
  description: string | null;
  price: number;
  duration: number;
  form_schema?: FormField[];
};

type NewBookingInput = {
  serviceId: string;
  name: string;
  email: string;
  date: string; 
  time: string; 
  userId?: string;
  formData?: Record<string, unknown>;
};

export class BookingService {
  constructor(private repo: IBookingRepository) { }

  async getAllServices(orgId: string): Promise<Service[]> {
    return this.repo.getServices(orgId);
  }

  async createNewService(data: NewServiceInput, orgId: string): Promise<Service> {
    // Validacions de Negoci (Domain Logic)
    if (data.price < 0) throw new Error("El preu no pot ser negatiu");
    if (data.duration < 5) throw new Error("La durada mínima són 5 minuts");

    // Ara TypeScript està feliç perquè 'organization_id' és part esperada de ServiceDTO
    return this.repo.createService({
      organization_id: orgId,
      title: data.title,
      // Gestió de nuls a nivell de servei per assegurar consistència
      description: data.description ?? "", 
      price: data.price,
      duration_minutes: data.duration,
      // Valors per defecte de domini
      active: true, 
      form_schema: data.form_schema || [],
      // Camps opcionals que el repo gestionarà (però que el tipus permet)
      currency: "EUR",
      image_url: undefined
    });
  }

  async processBooking(data: NewBookingInput, orgId: string): Promise<Booking> {
    // Validació
    if (!data.email.includes('@')) throw new Error("Email invàlid");

    const startTime = new Date(`${data.date}T${data.time}:00`);
    
    // Recuperem el servei per saber la durada real
    const service = await this.repo.getServiceById(data.serviceId);
    if (!service) throw new Error("Servei no vàlid");

    // Càlcul de domini: EndTime
    const duration = service.duration_minutes ?? 60;
    const endTime = addMinutes(startTime, duration);

    return this.repo.createBooking({
      organization_id: orgId,
      service_id: data.serviceId,
      customer_name: data.name,
      customer_email: data.email,
      start_time: startTime,
      end_time: endTime,
      status: 'confirmed', // O 'pending' si hi ha pagament
      user_id: data.userId || null,
      form_data: data.formData || {}
    });
  }

  async getDashboardBookings(orgId: string): Promise<Booking[]> {
    return this.repo.getBookings(orgId);
  }

  async getBookingsByUser(userId: string) {
    return this.repo.getBookingsByUser(userId);
  }

  async getAvailableSlots(dateStr: string, serviceId: string, orgId: string): Promise<string[]> {
    const targetDate = new Date(dateStr);
    const dayOfWeek = targetDate.getDay(); 

    // 1. Comprovar Bloquejos globals
    const isBlocked = await this.repo.isDateBlocked(orgId, targetDate);
    if (isBlocked) return [];

    // 2. Comprovar Horari base
    const schedule = await this.repo.getScheduleForDay(orgId, dayOfWeek);
    if (!schedule || !schedule.is_active) return []; 

    // 3. Recuperar dades per calcular col·lisions
    const bookings = await this.repo.getBookingsByDateRange(orgId, targetDate, targetDate);
    const service = await this.repo.getServiceById(serviceId);
    if (!service) throw new Error("Servei no trobat");

    const slots: string[] = [];
    const openTime = this.parseTime(targetDate, schedule.start_time);
    const closeTime = this.parseTime(targetDate, schedule.end_time);
    
    const serviceDuration = service.duration_minutes ?? 60;
    let currentTime = openTime;

    // Algoritme de Slots
    while (addMinutes(currentTime, serviceDuration) <= closeTime) {
      const slotEnd = addMinutes(currentTime, serviceDuration);
      
      const isBusy = bookings.some(b => {
        const bStart = new Date(b.start_time);
        const bEnd = new Date(b.end_time);
        // Intersecció d'intervals
        return (currentTime < bEnd && slotEnd > bStart);
      });

      if (!isBusy) {
        slots.push(format(currentTime, 'HH:mm'));
      }

      currentTime = addMinutes(currentTime, 30); // Pas de 30 minuts
    }

    return slots;
  }

  private parseTime(date: Date, timeStr: string): Date {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return set(date, { hours, minutes, seconds: 0, milliseconds: 0 });
  }
}