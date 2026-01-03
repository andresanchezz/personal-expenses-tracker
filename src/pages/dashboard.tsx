import { AuthGuard } from '@/components/guards/AuthGuard';
import { Button } from '@/components/ui/button';
import WalletsList from '@/components/wallets/WalletList';
import { useAuth } from '@/hooks/useAuth';


export default function DashboardPage() {
  const { signOut } = useAuth();

  return (
    <AuthGuard>
      <div className="w-full md:w-7xl m-auto px-2 py-4 md:p-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Button onClick={signOut} variant="outline">
            Cerrar sesión
          </Button>
        </div>

        {/* Sección de Billeteras */}
        <section className="mb-12">
          <WalletsList />
        </section>

        {/* TODO: Próximas secciones */}
        {/* <section className="mb-12">
          <CreditCardsList />
        </section>
        
        <section>
          <TransactionsList />
        </section> */}
      </div>
    </AuthGuard>
  );
}