'use client';

import { useActionState } from 'react'; // React 19 / Next 15
// Si uses Next 14, seria: import { useFormState } from 'react-dom';
import { createPostAction } from '@/features/blog/actions';

// Estat inicial del formulari
const initialState = {
  error: '',
};

export function CreatePostForm() {
  // Enllacem l'acció amb l'estat
  const [state, formAction, isPending] = useActionState(createPostAction, initialState);

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
          {state.error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1 text-foreground">Títol</label>
        <input name="title" required className="w-full p-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary outline-none" placeholder="Títol..." />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-foreground">Descripció SEO</label>
        <textarea name="description" rows={2} className="w-full p-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary outline-none" />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-foreground">Contingut</label>
        <textarea name="content" required rows={10} className="w-full p-3 rounded-lg border border-border bg-background text-foreground font-mono text-sm focus:ring-2 focus:ring-primary outline-none" />
      </div>

      <button 
        type="submit" 
        disabled={isPending}
        className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-lg hover:opacity-90 shadow-lg disabled:opacity-50 transition-all"
      >
        {isPending ? 'Publicant...' : 'Publicar Article'}
      </button>
    </form>
  );
}