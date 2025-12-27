import Link from 'next/link';
import { getPostsAction, deletePostAction } from '@/features/blog/actions';
import { Plus, Trash2, Eye } from 'lucide-react';

export default async function BlogDashboard({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const posts = await getPostsAction();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Gestió del Blog</h1>
        <Link href={`/${locale}/blog-manager/new`}>
          <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:opacity-90">
            <Plus className="w-4 h-4" /> Nou Article
          </button>
        </Link>
      </div>

      <div className="bg-background border border-border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted text-muted-foreground font-medium border-b border-border">
            <tr>
              <th className="px-6 py-3">Títol</th>
              <th className="px-6 py-3">Estat</th>
              <th className="px-6 py-3">Data</th>
              <th className="px-6 py-3 text-right">Accions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {posts.map((post) => (
              <tr key={post.id} className="hover:bg-muted/50">
                <td className="px-6 py-4 font-medium text-foreground">
                  {post.title}
                  <div className="text-xs text-muted-foreground">/{post.slug}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    post.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {post.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-muted-foreground">
                  {new Date(post.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  <Link href={`/${locale}/blog/${post.slug}`} target="_blank">
                    <button className="p-2 text-slate-400 hover:text-blue-500"><Eye className="w-4 h-4" /></button>
                  </Link>
                  <form action={deletePostAction}>
                    <input type="hidden" name="id" value={post.id} />
                    <button className="p-2 text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}