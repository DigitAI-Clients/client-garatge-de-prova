import { Product, Order, CreateOrderDTO, CreateProductDTO } from '@/types/models';

export interface IEcommerceRepository {
  getProducts(orgId: string): Promise<Product[]>;
  getProductBySlug(slug: string, orgId: string): Promise<Product | null>;
  createOrder(data: CreateOrderDTO, orgId: string): Promise<Order>;
  updateStock(productId: string, quantitySold: number): Promise<void>;
  
  // 👇 AFEGIT: Mètode per crear producte
  createProduct(data: CreateProductDTO & { slug: string }, orgId: string): Promise<Product>;
  getOrders(orgId: string): Promise<Order[]>; // 👈 AFEGIT
  getOrdersByUser(userId: string): Promise<Order[]>; // 👈 AFEGIT
}