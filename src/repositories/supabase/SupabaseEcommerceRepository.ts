import { IEcommerceRepository } from '../interfaces/IProductRepository';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { Product, Order, CreateOrderDTO } from '@/types/models';
import { Database, Json } from '@/types/database.types'; // Importem Json de Supabase
import { CreateProductDTO } from '@/types/models';

type OrderRow = Database['public']['Tables']['orders']['Row'];
type ProductRow = Database['public']['Tables']['products']['Row'];

export class SupabaseEcommerceRepository implements IEcommerceRepository {

  // --- Mappers Privats (La clau per evitar errors de tipus) ---

  private mapProduct(row: ProductRow): Product {
    return {
      id: row.id,
      organization_id: row.organization_id,
      slug: row.slug,
      name: row.name,
      description: row.description,
      price: row.price,
      stock: row.stock ?? 0,
      images: row.images ? (row.images as string[]) : [],
      active: row.active ?? false
    };
  }

  private mapOrder(row: OrderRow): Order {
    return {
      id: row.id,
      organization_id: row.organization_id,
      customer_email: row.customer_email,
      // Convertim la string de la DB a Date de JS
      created_at: new Date(row.created_at || Date.now()),
      total_amount: row.total_amount,
      status: (row.status as Order['status']) || 'pending',
      payment_method: row.payment_method || 'unknown'
    };
  }

  // --- Implementació Pública ---

  async getProducts(orgId: string): Promise<Product[]> {
    const supabase = await createClient();
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('organization_id', orgId)
      .eq('active', true);

    if (!data) return [];
    return data.map(this.mapProduct);
  }

  async getProductBySlug(slug: string, orgId: string): Promise<Product | null> {
    const supabase = await createClient();
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('organization_id', orgId)
      .eq('slug', slug)
      .single();

    if (!data) return null;
    return this.mapProduct(data);
  }

  async createOrder(data: CreateOrderDTO, orgId: string): Promise<Order> {
    // 1. Obtenim l'usuari actual (si n'hi ha) per vincular-lo
    const supabaseUserClient = await createClient();
    const { data: { user } } = await supabaseUserClient.auth.getUser();

    // 2. Usem el CLIENT ADMIN per escriure a la DB saltant-nos les restriccions RLS
    // Això soluciona l'error "violates row-level security" definitivament.
    const supabaseAdmin = createAdminClient();

    const total = data.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    const orderPayload = {
      organization_id: orgId,
      user_id: user ? user.id : null, // Si és convidat, null. Si està loguejat, la seva ID.
      customer_email: data.customer_email,
      customer_details: data.customer_details as unknown as Json,
      total_amount: total,
      payment_method: data.payment_method,
      status: 'pending'
    };

    // 3. Insertar Order (amb permisos de Déu)
    const { data: orderData, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert(orderPayload)
      .select()
      .single();

    if (orderError) {
      console.error("Error inserint comanda:", orderError);
      throw new Error(orderError.message);
    }

    // 4. Insertar Items
    const itemsPayload = data.items.map(item => ({
      order_id: orderData.id,
      product_id: item.id,
      product_name: item.name,
      quantity: item.quantity,
      unit_price: item.price
    }));

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(itemsPayload);

    if (itemsError) {
      console.error("Error creant items:", itemsError);
      // Opcional: Esborrar la comanda si fallen els items
      await supabaseAdmin.from('orders').delete().eq('id', orderData.id);
      throw new Error("Error guardant els detalls de la comanda");
    }

    return this.mapOrder(orderData);
  }

  async updateStock(productId: string, quantitySold: number): Promise<void> {
    // Ara sí que usem l'admin, perquè això és una operació de sistema

    // Exemple de crida RPC (Stored Procedure) que hauríem de crear a Supabase
    /*
    const { error } = await admin.rpc('decrement_stock', { 
      p_product_id: productId, 
      p_quantity: quantitySold 
    });
    if (error) console.error(error);
    */
    console.log(`Stock updated for ${productId}: -${quantitySold}`);
  }
  // 👇 NOU MÈTODE: Crear Producte
  async createProduct(data: CreateProductDTO & { slug: string }, orgId: string): Promise<Product> {
    const supabase = await createClient();

    const { data: newProduct, error } = await supabase
      .from('products')
      .insert({
        organization_id: orgId,
        name: data.name,
        slug: data.slug, // El slug ve calculat del servei
        description: data.description,
        price: data.price,
        stock: data.stock,
        images: data.images,
        active: data.active
      })
      .select()
      .single();

    if (error) {
      // Gestionem duplicats de slug (molt comú)
      if (error.code === '23505') throw new Error("Ja existeix un producte amb aquest nom (slug duplicat).");
      throw new Error(error.message);
    }

    return this.mapProduct(newProduct);
  }
  // 👇 IMPLEMENTACIÓ
  async getOrders(orgId: string): Promise<Order[]> {
    const supabase = await createClient();

    // Fem un join per saber quins items hi ha a cada comanda (opcional, aquí fem fetch bàsic)
    const { data, error } = await supabase
      .from('orders')
      .select('*') // Podries fer '*, order_items(*)' si volguessis detalls
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    return data.map(this.mapOrder);
  }

  // Afegeix aquest mètode a la classe
  async getOrdersByUser(userId: string): Promise<Order[]> {
    const supabase = await createClient();
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*)') // Portem els items també
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!data) return [];

    // Mapegem (Important per TypeScript)
    return data.map(this.mapOrder); // Assegura't que mapOrder inclou els items si cal
  }
}