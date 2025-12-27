'use server';

import { ecommerceService } from '@/services/container';
import { CreateOrderDTO } from '@/types/models';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth/guards'; // 👈 Importar
// 1. Definim el tipus d'estat de forma explícita
export type ActionState = {
  success: boolean;
  message: string;
  error?: string; // Opcional
};
function getOrgId() {
  const orgId = process.env.NEXT_PUBLIC_ORG_ID;
  if (!orgId) throw new Error("Missing ORG_ID");
  return orgId;
}

// 1. Obtenir Productes (Per a la pàgina /shop)
export async function getProductsAction() {
  try {
    return await ecommerceService.getStoreProducts(getOrgId());
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

// 2. Processar Pagament (Checkout)
export async function checkoutAction(orderData: CreateOrderDTO) {
  try {
    const orgId = getOrgId();
    // Cridem al servei que ja té l'estratègia de pagament
    const result = await ecommerceService.processCheckout(orderData, orgId);

    // Si tot va bé, retornem la URL on redirigir (Stripe, PayPal, o Success page)
    return { success: true, redirectUrl: result.redirectUrl };

  } catch (error) {
    console.error("Checkout Error:", error);
    return { success: false, error: "Error processant la comanda." };
  }
}
// 2. Corregim la signatura de la funció createProductAction
export async function createProductAction(
  prevState: ActionState, // Tipus correcte pel 1r argument
  formData: FormData
): Promise<ActionState> { // Retorn explícit
  // 🛡️ SECURITY CHECK: Això atura l'execució si no és admin
  await requireAdmin();
  const orgId = getOrgId();

  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const price = parseFloat(formData.get('price') as string);
  const stock = parseInt(formData.get('stock') as string);
  const imagesStr = formData.get('images') as string;

  const images = imagesStr ? imagesStr.split(',').map(s => s.trim()).filter(Boolean) : [];

  try {
    await ecommerceService.createNewProduct({
      name,
      description,
      price,
      stock,
      images,
      active: true
    }, orgId);

    revalidatePath('/shop');
    revalidatePath('/admin/products');

    // Retornem l'objecte que compleix amb ActionState
    return { success: true, message: 'Producte creat correctament!' };

  } catch (error) {
    console.error(error);
    // Retornem l'objecte amb l'error, complint el tipus
    return {
      success: false,
      message: 'Error al crear',
      error: error instanceof Error ? error.message : "Error desconegut"
    };
  }
}

// 👇 NOVA ACTION (Fetching)
export async function getProductBySlugAction(slug: string) {
  try {
    const orgId = getOrgId();
    // Aquesta funció ja existeix al repository, només l'exposem
    // Però atenció: el repository method es diu 'getProductBySlug'
    // Assegura't que l'has afegit a EcommerceService també
    return await ecommerceService.getProductBySlug(slug, orgId);
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

// 👇 NOVA ACCIÓ ADMIN
export async function getAdminOrdersAction() {
  await requireAdmin(); // Seguretat
  try {
    return await ecommerceService.getAdminOrders(getOrgId());
  } catch (error) {
    console.error(error);
    return [];
  }
}

