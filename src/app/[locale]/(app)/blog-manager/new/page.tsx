import { CreatePostForm } from '@/components/modules/blog/post-form';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function NewPostPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return (
    <div className="max-w-3xl mx-auto">
      <Link href={`/${locale}/blog-manager`} className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" /> Tornar
      </Link>

      <div className="bg-background border border-border rounded-xl p-8 shadow-sm">
        <h1 className="text-2xl font-bold mb-6 text-foreground">Escriure nou article</h1>
        {/* Renderitzem el component client */}
        <CreatePostForm />
      </div>
    </div>
  );
}