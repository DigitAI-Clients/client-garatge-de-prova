import Link from 'next/link';
import { getPublicPostsAction } from '@/features/blog/actions'; // Acció que vam crear
import { CONFIG } from '@/config/digitai.config';
import { format } from 'date-fns';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function BlogIndexPage({ params }: Props) {
  const { locale } = await params;

  // 1. Feature Flag Check
  if (!CONFIG.modules.blog) {
    return <div className="py-20 text-center">El blog no està habilitat.</div>;
  }

  // 2. Data Fetching (Server Side)
  const posts = await getPublicPostsAction();

  return (
    <div className="min-h-screen bg-background py-20 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">Blog & Notícies</h1>
          <p className="text-muted-foreground text-lg">Últimes novetats de {CONFIG.identity.name}</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link key={post.id} href={`/${locale}/blog/${post.slug}`} className="group">
              <article className="h-full border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-all bg-card">
                {/* Placeholder d'imatge si no en té */}
                <div className="h-48 bg-muted w-full relative">
                   {/* Aquí podries posar <Image /> si post.cover_image existeix */}
                   <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/20 font-bold text-4xl">
                      IMG
                   </div>
                </div>
                
                <div className="p-6">
                  <div className="text-xs font-medium text-primary mb-2">
                    {post.published_at ? format(new Date(post.published_at), 'dd MMM yyyy') : 'Recent'}
                  </div>
                  <h2 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors text-foreground line-clamp-2">
                    {post.title}
                  </h2>
                  <p className="text-muted-foreground text-sm line-clamp-3">
                    {post.description}
                  </p>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {posts.length === 0 && (
            <div className="text-center py-12 bg-muted/20 rounded-xl">
                <p className="text-muted-foreground">Encara no hi ha publicacions.</p>
            </div>
        )}
      </div>
    </div>
  );
}