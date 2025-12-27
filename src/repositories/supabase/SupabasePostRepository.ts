import { IPostRepository } from '../interfaces/IPostRepository';
import { createClient } from '@/lib/supabase/server';
import { BlogPost, CreatePostDTO } from '@/types/models';
import { Database } from '@/types/database.types';

type PostRow = Database['public']['Tables']['posts']['Row'];

export class SupabasePostRepository implements IPostRepository {
  
  private mapPost(row: PostRow): BlogPost {
    return {
      id: row.id,
      organization_id: row.organization_id,
      slug: row.slug,
      title: row.title,
      description: row.description,
      content_mdx: row.content_mdx,
      cover_image: row.cover_image,
      tags: row.tags ? (row.tags as string[]) : [],
      status: (row.status as unknown as import('@/types/models').PostStatus) ?? 'draft',
      published_at: row.published_at ? new Date(row.published_at) : null,
      created_at: new Date(row.created_at ?? Date.now())
    };
  }

  async getPublishedPosts(orgId: string): Promise<BlogPost[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('organization_id', orgId)
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data.map(this.mapPost);
  }

  async getPostBySlug(slug: string, orgId: string): Promise<BlogPost | null> {
    const supabase = await createClient();
    const { data } = await supabase
      .from('posts')
      .select('*')
      .eq('organization_id', orgId)
      .eq('slug', slug)
      .eq('status', 'published') // Seguretat: no mostrar esborranys per URL
      .single();

    if (!data) return null;
    return this.mapPost(data);
  }

  async getAllPosts(orgId: string): Promise<BlogPost[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data.map(this.mapPost);
  }

  async createPost(data: CreatePostDTO & { organization_id: string; slug: string }): Promise<BlogPost> {
    const supabase = await createClient();
    
    const { data: newPost, error } = await supabase.from('posts').insert({
        organization_id: data.organization_id,
        title: data.title,
        slug: data.slug,
        description: data.description,
        content_mdx: data.content,
        status: data.status || 'draft',
        tags: data.tags || [],
        published_at: data.status === 'published' ? new Date().toISOString() : null
    }).select().single();

    if (error) throw new Error(error.message);
    return this.mapPost(newPost);
  }

  async updatePost(id: string, data: Partial<CreatePostDTO>): Promise<void> {
      const supabase = await createClient();
      
      const payload: Partial<PostRow> = { ...data };
      if (data.content) payload.content_mdx = data.content; // Mapeig de nom
      
      const { error } = await supabase.from('posts').update(payload).eq('id', id);
      if (error) throw new Error(error.message);
  }

  async deletePost(id: string): Promise<void> {
      const supabase = await createClient();
      await supabase.from('posts').delete().eq('id', id);
  }
}