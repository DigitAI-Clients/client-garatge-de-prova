import { BlogPost, CreatePostDTO} from '@/types/models';

export interface IPostRepository {
  // Públic (Web)
  getPublishedPosts(orgId: string): Promise<BlogPost[]>;
  getPostBySlug(slug: string, orgId: string): Promise<BlogPost | null>;

  // Privat (Dashboard)
  getAllPosts(orgId: string): Promise<BlogPost[]>;
  createPost(data: CreatePostDTO & { organization_id: string; slug: string }): Promise<BlogPost>;
  updatePost(id: string, data: Partial<CreatePostDTO>): Promise<void>;
  deletePost(id: string): Promise<void>;
}