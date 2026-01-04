import { useRouter } from 'next/router';
import CategoriesList from '@/components/categories/CategoriesList';
import CreditCardsList from '@/components/credit-cards/CreditCardsList';
import { AuthGuard } from '@/components/guards/AuthGuard';
import { Button } from '@/components/ui/button';
import WalletsList from '@/components/wallets/WalletList';
import { useAuth } from '@/hooks/useAuth';


export default function DashboardPage() {
  const router = useRouter()
  const { signOut } = useAuth();

  return (
    <AuthGuard>
      <div className="w-full md:w-7xl m-auto px-2 py-4 md:p-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="md:text-3xl font-bold">Dashboard</h1>
          <div className='flex space-x-4'>
            <Button onClick={signOut} variant="outline">
              Cerrar sesión
            </Button>
            <Button onClick={() => { router.replace('/charts') }} variant="secondary">
              Gráficos
            </Button>
          </div>
        </div>

        {/* Sección de Billeteras */}
        <section className="mb-12">
          <WalletsList />
        </section>

        {/* Sección de Tarjetas de crédito */}
        <section className="mb-12">
          <CreditCardsList />
        </section>

        {/* Sección de Categorias */}
        <section className="mb-12">
          <CategoriesList />
        </section>

        {/* <section>
          <TransactionsList />
        </section> */}
      </div>
    </AuthGuard>
  );
}