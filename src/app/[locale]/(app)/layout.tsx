import { AdminSidebar } from '@/components/modules/dashboard/admin-sidebar';
import { UserSidebar } from '@/components/modules/dashboard/user-sidebar';
import { AppMobileBar } from '@/components/layout/app-mobile-bar';
import { createClient } from '@/lib/supabase/server';
import { authService } from '@/services/container';
import { redirect } from 'next/navigation';

function getOrgId() {
  const orgId = process.env.NEXT_PUBLIC_ORG_ID;
  if (!orgId) throw new Error("Missing ORG_ID");
  return orgId;
}

export default async function DashboardLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();
  const orgId = getOrgId();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/auth/login`);
  }

  const profile = await authService.getProfile(user.id, orgId);

  const userData = {
    email: user.email!,
    full_name: profile?.full_name,
    role: profile?.role
  };
  const isAdmin = userData.role === 'admin';
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">

      {/* Sidebar Intel·ligent */}
      <div className="hidden md:block w-64 shrink-0 fixed h-full">
        {isAdmin ? <AdminSidebar user={userData} /> : <UserSidebar user={userData} />}
      </div>

      {/* Bottom Bar Intel·ligent */}
      <AppMobileBar user={userData} />

      <main className="flex-1 lg:pl-64 transition-all duration-300 pb-20 md:pb-8">
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}