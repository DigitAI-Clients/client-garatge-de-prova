'use server';

import { redirect } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { revalidatePath } from 'next/cache';
import { postService } from '@/services/container';

function getOrgId() {
    const orgId = process.env.NEXT_PUBLIC_ORG_ID;
    if (!orgId) throw new Error("Missing ORG_ID");
    return orgId;
}

export async function getPostsAction() {
    try {
        return await postService.getDashboardPosts(getOrgId());
    } catch (e) {
        console.error("Error fetching posts:", e);
        return [];
    }
}

export async function getPublicPostsAction() {
    try {
        return await postService.getPublicPosts(getOrgId());
    } catch (e) {
        console.error("Error fetching public posts:", e);
        return [];
    }
}

export async function createPostAction(prevState: unknown, formData: FormData) {
    const locale = await getLocale();
    const orgId = getOrgId();

    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const content = formData.get('content') as string;

    if (!title || !content) {
        return { error: "El títol i el contingut són obligatoris." };
    }

    try {
        await postService.createNewPost({
            title,
            description,
            content,
            status: 'published'
        }, orgId);

    } catch (error) {
        console.error("Create Post Error:", error);
        return { error: "Hi ha hagut un error guardant l'article." };
    }

    revalidatePath('/blog-manager');
    redirect(`/${locale}/blog-manager`);
}

export async function deletePostAction(formData: FormData) {
    const id = formData.get('id') as string;
    if (!id) return;

    try {
        await postService.deletePost(id);
        revalidatePath('/blog-manager');
    } catch (error) {
        console.error("Delete Post Error:", error);
    }
}