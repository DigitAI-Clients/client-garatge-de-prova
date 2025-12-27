import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPostAction, getPostsAction } from '../actions';
import { postService } from '@/services/container';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import type { BlogPost as Post} from '@/types/models'; // Assumim que existeix

vi.mock('@/services/container', () => ({
  postService: {
    getDashboardPosts: vi.fn(),
    createNewPost: vi.fn(),
    deletePost: vi.fn(),
  },
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('next-intl/server', () => ({
  getLocale: vi.fn(() => Promise.resolve('en')),
}));

describe('Blog Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_ORG_ID = 'org_123';
  });

  it('getPostsAction hauria de retornar posts', async () => {
    // ✅ CORRECTE: Tipatge segur
    const mockPosts = [{ id: '1', title: 'Post 1' }];
    vi.mocked(postService.getDashboardPosts).mockResolvedValue(mockPosts as unknown as Post[]);

    const result = await getPostsAction();
    expect(result).toEqual(mockPosts);
    expect(postService.getDashboardPosts).toHaveBeenCalledWith('org_123');
  });

  it('createPostAction hauria de crear, revalidar i redirigir', async () => {
    const formData = new FormData();
    formData.append('title', 'New Post');
    formData.append('content', 'Content');
    formData.append('description', 'Desc');

    try {
        await createPostAction(null, formData);
    } catch(e) {console.log(e)}

    expect(postService.createNewPost).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'New Post' }),
      'org_123'
    );
    expect(revalidatePath).toHaveBeenCalledWith('/blog-manager');
    expect(redirect).toHaveBeenCalledWith('/en/blog-manager');
  });
});