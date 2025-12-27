'use server';

import { authService } from '@/services/container';
import { redirect } from 'next/navigation';
import { getLocale } from 'next-intl/server';
// Assegura't que aquest servei existeix o comenta la línia si encara no el tens
import { EmailService } from '@/lib/email/email-service';

export type AuthState = {
  error?: string;
  message?: string;
};

function getOrgId() {
  const orgId = process.env.NEXT_PUBLIC_ORG_ID;
  if (!orgId) throw new Error("ERROR CRÍTIC: Manca NEXT_PUBLIC_ORG_ID");
  return orgId;
}

export async function loginAction(
  prevState: AuthState | null,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const locale = await getLocale();

  try {
    const orgId = getOrgId();
    const user = await authService.login(email, password, orgId);
    const destination = await authService.getRedirectPath(user.id, orgId);
    
    redirect(`/${locale}${destination}`);

  } catch (error: unknown) {
    if ((error as Error).message === 'NEXT_REDIRECT') throw error;

    console.error("Login Error:", error);
    let errorKey = 'generic';
    const msg = (error as Error).message;

    if (msg.includes('Invalid login credentials') || msg === 'Credencials invàlides') {
      errorKey = 'invalid_credentials';
    } else if (msg === 'NO_PROFILE') {
      errorKey = 'no_access';
    }

    return { error: errorKey };
  }
}

export async function registerAction(
  prevState: AuthState | null,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const fullName = formData.get('fullName') as string;
  const locale = await getLocale();

  try {
    const orgId = getOrgId();
    await authService.register({
      email,
      password,
      fullName,
      orgId
    });
    
    // Intentem enviar mail, però no bloquegem si falla
    try {
        await EmailService.sendWelcomeEmail(email, fullName);
    } catch (e) {
        console.warn("No s'ha pogut enviar el mail de benvinguda:", e);
    }

    redirect(`/${locale}/auth/login?message=registered`);

  } catch (error: unknown) {
    if ((error as Error).message === 'NEXT_REDIRECT') throw error;

    console.error("Register Error:", error);
    let errorKey = 'generic';
    const msg = (error as Error).message;

    if (msg === 'ACCOUNT_EXISTS_WRONG_PASS' || msg.includes('already registered')) {
      errorKey = 'account_exists';
    }

    return { error: errorKey };
  }
}

export async function signOutAction() {
  const locale = await getLocale();
  try {
    await authService.logout();
  } catch (e) {
    console.error("Error al fer logout", e);
  }
  redirect(`/${locale}/auth/login`);
}