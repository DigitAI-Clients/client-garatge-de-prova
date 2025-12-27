import { IPostRepository } from '@/repositories/interfaces/IPostRepository';
import { CreatePostDTO } from '@/types/models';

export class PostService {
  constructor(private repo: IPostRepository) {}

  // 1. Llegir (Públic)
  async getPublicPosts(orgId: string) {
    return this.repo.getPublishedPosts(orgId);
  }

  async getPostBySlug(slug: string, orgId: string) {
    return this.repo.getPostBySlug(slug, orgId);
  }

  // 2. Llegir (Privat)
  async getDashboardPosts(orgId: string) {
    return this.repo.getAllPosts(orgId);
  }

  // 3. Escriptura amb Lògica
  async createNewPost(data: CreatePostDTO, orgId: string) {
    // Generar Slug automàtic (Ex: "El meu títol" -> "el-meu-titol")
    const slug = data.title
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Treure accents
        .replace(/[^a-z0-9]+/g, '-') // Caràcters rars a guions
        .replace(/^-+|-+$/g, ''); // Treure guions extres

    // Afegir sufix aleatori si vols evitar col·lisions (opcional per MVP)
    // const uniqueSlug = `${slug}-${Math.floor(Math.random() * 1000)}`;

    return this.repo.createPost({
        ...data,
        organization_id: orgId,
        slug: slug
    });
  }

  async deletePost(id: string) {
      return this.repo.deletePost(id);
  }
}