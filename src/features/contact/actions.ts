'use server';

export type FormState = {
  success: boolean;
  message: string;
};

export async function submitContactForm(prevState: FormState, formData: FormData): Promise<FormState> {
  // Simulem retard
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const message = formData.get('message') as string;
  const terms = formData.get('terms'); // 👈 Recuperem el checkbox

  // --- VALIDACIONS ---
  
  // 1. Validació de Termes (CRÍTICA)
  if (!terms) {
    return { success: false, message: "Has d'acceptar la política de privacitat per continuar." };
  }

  // 2. Altres validacions
  if (!name || name.length < 2) return { success: false, message: "El nom és massa curt." };
  if (!email || !email.includes('@')) return { success: false, message: "L'email no és vàlid." };
  if (!message || message.length < 10) return { success: false, message: "El missatge és massa curt." };

  // 3. Enviament (simulat)
  console.log(`📧 Contacte vàlid: ${name} - Terms: ${terms}`);

  return { 
    success: true, 
    message: "Missatge enviat correctament! Et respondrem aviat." 
  };
}