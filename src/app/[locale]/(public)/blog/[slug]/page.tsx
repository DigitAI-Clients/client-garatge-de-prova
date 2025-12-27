import { postService } from '@/services/container'; // Usem el servei directament (RSC)
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

// Helper per obtenir ORG_ID en Server Components purs
function getOrgId() {
  return process.env.NEXT_PUBLIC_ORG_ID!;
}

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params;
  const orgId = getOrgId();

  // Obtenim el post
  const post = await postService.getPostBySlug(slug, orgId);

  if (!post) notFound();

  return (
    <article className="min-h-screen bg-background py-20 px-4">
      <div className="container mx-auto max-w-3xl">
        
        <Link href={`/${locale}/blog`} className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Tornar al Blog
        </Link>

        <header className="mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-6 leading-tight">
            {post.title}
          </h1>
          {post.description && (
            <p className="text-xl text-muted-foreground italic border-l-4 border-primary pl-4">
              {post.description}
            </p>
          )}
        </header>

        {/* CONTINGUT (MDX Placeholder) */}
        {/* En el futur aquí anirà <MDXRemote source={post.content_mdx} /> */}
        <div className="prose prose-lg dark:prose-invert max-w-none">
            {/* Renderitzem el contingut com a text pla per ara, respectant salts de línia */}
            <div className="whitespace-pre-wrap text-foreground/90">
                {post.content_mdx}
            </div>
        </div>

      </div>
    </article>
  );
}