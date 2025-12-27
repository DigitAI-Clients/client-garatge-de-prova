'use server';

import { redirect } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { revalidatePath } from 'next/cache';
import { bookingService } from '@/services/container';
import { Service, Booking } from '@/types/models';

// --- DEFINICIÓ DE TIPUS (ZERO ANY) ---

export type BookingActionState = {
  success: boolean;
  message?: string;
  error?: string;
  slots?: string[];
};

// --- HELPERS ---

function getOrgId(): string {
  const orgId = process.env.NEXT_PUBLIC_ORG_ID;
  if (!orgId) throw new Error("Missing NEXT_PUBLIC_ORG_ID");
  return orgId;
}

// --- GETTERS (Lectura) ---

export async function getServices(): Promise<Service[]> {
  try {
    return await bookingService.getAllServices(getOrgId());
  } catch (error) {
    console.error("Error fetching services:", error);
    return [];
  }
}

export async function getDashboardBookings(): Promise<Booking[]> {
  try {
    return await bookingService.getDashboardBookings(getOrgId());
  } catch (error) {
    console.error("Error fetching dashboard bookings:", error);
    return [];
  }
}

export async function getAvailableSlotsAction(date: string, serviceId: string): Promise<BookingActionState> {
  try {
    const slots = await bookingService.getAvailableSlots(date, serviceId, getOrgId());
    return { success: true, slots };
  } catch (error) {
    console.error("Slots Error:", error);
    return { success: false, slots: [], error: 'Error calculant disponibilitat' };
  }
}

// --- MUTATIONS (Escriptura) ---

/**
 * Crear Reserva (Pública o Admin)
 * Tipus estricte: 'prevState' és unknown perquè ve del hook però no l'utilitzem per a lògica.
 */
export async function createBookingAction(prevState: unknown, formData: FormData): Promise<BookingActionState> {
  const orgId = getOrgId();
  
  // 1. Dades estàndard (Casting segur)
  const serviceId = formData.get('serviceId') as string;
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const dateStr = formData.get('date') as string;
  const timeStr = formData.get('time') as string;

  // 2. Dades dinàmiques (Camps personalitzats)
  const customData: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith('custom_')) {
      const fieldName = key.replace('custom_', '');
      customData[fieldName] = value;
    }
  }

  // 3. Validació bàsica
  if (!serviceId || !name || !email || !dateStr || !timeStr) {
    return { success: false, message: "Tots els camps obligatoris són necessaris." };
  }

  try {
    await bookingService.processBooking({
      serviceId,
      name,
      email,
      date: dateStr,
      time: timeStr,
      formData: customData
    }, orgId);

    revalidatePath('/dashboard/booking');
    return { success: true, message: 'Reserva confirmada correctament!' };

  } catch (error) {
    console.error("Booking error:", error);
    let message = 'Error creant la reserva.';
    if (error instanceof Error) message = error.message;
    return { success: false, message };
  }
}

/**
 * Crear Nou Servei (Admin)
 */
export async function createServiceAction(prevState: unknown, formData: FormData): Promise<BookingActionState> {
  try {
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const priceRaw = formData.get('price');
    const durationRaw = formData.get('duration');
    const formSchemaJson = formData.get('form_schema') as string;

    // Conversió segura de tipus numèrics
    const price = priceRaw ? parseFloat(priceRaw.toString()) : 0;
    const duration = durationRaw ? parseInt(durationRaw.toString()) : 30;

    let formSchema = [];
    if (formSchemaJson) {
      try {
        formSchema = JSON.parse(formSchemaJson);
      } catch (e) {
        console.error("Error parsing form schema:", e);
        throw new Error("Format dels camps personalitzats invàlid.");
      }
    }

    await bookingService.createNewService({
      title,
      description,
      price,
      duration,
      form_schema: formSchema
    }, getOrgId());

    revalidatePath('/services');
    return { success: true, message: 'Servei creat correctament' };

  } catch (error) {
    console.error("Create Service Error:", error);
    let errorMessage = "Error desconegut creant el servei";
    if (error instanceof Error) errorMessage = error.message;
    return { success: false, message: errorMessage };
  }
}

/**
 * Esborrar Servei (Admin)
 */
export async function deleteServiceAction(formData: FormData): Promise<void> {
  const serviceId = formData.get('id') as string;
  const locale = await getLocale();
  
  if (!serviceId) return;

  try {
    // Aquí idealment cridaríem a bookingService.deleteService(serviceId)
    // Com que no ho tenim implementat al service encara, fem un log
    console.log(`[PENDING] Delete service ${serviceId}`);
    
    // Simulem revalidació
    revalidatePath('/services');
    redirect(`/${locale}/services`);
  } catch (error) {
     console.error("Delete error", error);
  }
}