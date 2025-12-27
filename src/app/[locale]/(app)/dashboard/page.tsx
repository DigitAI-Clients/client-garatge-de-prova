

export default function DashboardPage() {
  // En un futur afegirem traduccions "Dashboard" al json
  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Panell de Control</h1>
        <p className="text-muted-foreground">Benvingut al teu sistema de gestió.</p>
      </header>

      {/* Grid d'exemple */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-background p-6 rounded-xl border border-border shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground uppercase">Usuaris Totals</h3>
          <p className="text-3xl font-bold text-foreground mt-2">1,234</p>
        </div>
        {/* Més widgets aquí... */}
      </div>
    </div>
  );
}