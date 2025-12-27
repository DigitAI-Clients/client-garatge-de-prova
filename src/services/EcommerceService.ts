import { IEcommerceRepository } from '@/repositories/interfaces/IProductRepository';
import { CreateOrderDTO, Order, CreateProductDTO } from '@/types/models'; // 👈 Importem Order
import { StripeGateway } from '@/lib/payment/stripe-gateway'; // 👈 Importem


export class EcommerceService {
  private stripeGateway: StripeGateway;
  constructor(private repo: IEcommerceRepository) {
    // En una V2, això s'injectaria, però per ara ho instanciem aquí (Lazy loading)
    this.stripeGateway = new StripeGateway();
  }

  async getStoreProducts(orgId: string) {
    return this.repo.getProducts(orgId);
  }

  async processCheckout(data: CreateOrderDTO, orgId: string) {
    // 🛡️ VALIDACIÓ ESTOC SERVER-SIDE
    // Abans de crear la comanda, comprovem que hi hagi estoc real a la DB
    for (const item of data.items) {
      const productInDb = await this.repo.getProductBySlug(item.slug, orgId); // O getById millor
      if (!productInDb) throw new Error(`El producte ${item.name} ja no existeix.`);

      if (productInDb.stock < item.quantity) {
        throw new Error(`Estoc insuficient per a ${item.name}. Només queden ${productInDb.stock} unitats.`);
      }
    }

    // 1. Crear comanda "Pending"
    const order = await this.repo.createOrder(data, orgId);

    // 2. Estratègia de Pagament
    switch (data.payment_method) {
      case 'stripe':
        // 👇 CRIDA REAL A STRIPE
        const result = await this.stripeGateway.createCheckoutSession(order, data.items);
        return { redirectUrl: result.redirectUrl };

      case 'paypal':
        return this.handlePaypalPayment(order);

      case 'bank':
        return { redirectUrl: `/checkout/success?orderId=${order.id}&method=bank` };

      default:
        throw new Error("Mètode de pagament no suportat");
    }
  }
  // 👇 NOU: Lògica de creació
  async createNewProduct(data: CreateProductDTO, orgId: string) {
    // 1. Generar Slug (SEO Friendly)
    const slug = data.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Treure caràcters especials
      .replace(/[\s_-]+/g, '-') // Espais a guions
      .replace(/^-+|-+$/g, ''); // Treure guions sobrants

    // 2. Validacions de negoci
    if (data.price < 0) throw new Error("El preu no pot ser negatiu.");
    if (data.stock < 0) throw new Error("L'estoc no pot ser negatiu.");

    // 3. Persistència
    return this.repo.createProduct({ ...data, slug }, orgId);
  }

  // 👇 AFEGIT: Mètode que faltava
  async getProductBySlug(slug: string, orgId: string) {
    return this.repo.getProductBySlug(slug, orgId);
  }

  // 👇 Substituïm 'any' per 'Order'
  private async handleStripePayment(order: Order) {
    console.log("Iniciant sessió Stripe per comanda:", order.id);

    // Aquí aniria la lògica real de Stripe
    // const session = await stripe.checkout.sessions.create({
    //    customer_email: order.customer_email,
    //    ...
    // })

    // Mock per MVP:
    return { redirectUrl: `/checkout/success?orderId=${order.id}&method=stripe_mock` };
  }

  // 👇 Substituïm 'any' per 'Order'
  private async handlePaypalPayment(order: Order) {
    console.log("Iniciant sessió PayPal per comanda:", order.id);
    return { redirectUrl: `/checkout/success?orderId=${order.id}&method=paypal_mock` };
  }

  async getAdminOrders(orgId: string) {
    return this.repo.getOrders(orgId);
  }

  async getOrdersByUser(userId: string) {
    // Aquí podries afegir lògica extra (ex: amagar comandes cancel·lades)
    return this.repo.getOrdersByUser(userId);
  }

}