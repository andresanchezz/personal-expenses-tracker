import { useState } from 'react';
import { Plus, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import WalletCard from '@/components/cards/WalletCard';
import CreateWalletDialog from './CreateWalletDialog';
import EditWalletDialog from './EditWalletDialog';
import DeleteWalletDialog from './DeleteWalletDialog';

import { useWallets, usePocketsCounts } from '@/lib/api/wallets';
import { BankAccount } from '@/types/database';
import PocketsView from '../pockets/PocketView';
import { formatCurrency } from '@/lib/utils';

const WalletsList = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<BankAccount | null>(null);
  const [deletingWallet, setDeletingWallet] = useState<BankAccount | null>(null);
  const [viewingPockets, setViewingPockets] = useState<BankAccount | null>(null);

  const { data: wallets, isLoading: walletsLoading } = useWallets();
  const { data: pocketsCounts } = usePocketsCounts();

  // Calcular totales
  const totalBalance = wallets?.reduce((sum, w) => sum + w.balance_total, 0) || 0;
  const walletsCount = wallets?.length || 0;

  // Si estamos viendo bolsillos, mostrar esa vista
  if (viewingPockets) {
    return (
      <PocketsView
        wallet={viewingPockets}
        onBack={() => setViewingPockets(null)}
      />
    );
  }

  if (walletsLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        <Skeleton className="h-20 w-full" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Wallet className="h-5 w-5" />
          <h2 className="md:text-2xl font-bold">Billeteras ({walletsCount})</h2>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Billetera
        </Button>
      </div>

      {/* Total Balance Card */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">Balance Total</p>
        <p className="text-3xl font-bold">{formatCurrency(totalBalance)}</p>
      </div>

      {/* Wallets Grid */}
      {wallets && wallets.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {wallets.map((wallet) => (
            <WalletCard
              key={wallet.id}
              wallet={wallet}
              pocketsCount={pocketsCounts?.[wallet.id] || 0}
              onEdit={() => setEditingWallet(wallet)}
              onDelete={() => setDeletingWallet(wallet)}
              onViewPockets={() => setViewingPockets(wallet)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
          <Wallet className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">No tienes billeteras</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Crea tu primera billetera para comenzar a gestionar tu dinero
          </p>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Crear Billetera
          </Button>
        </div>
      )}

      {/* Dialogs */}
      <CreateWalletDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />

      {editingWallet && (
        <EditWalletDialog
          wallet={editingWallet}
          open={!!editingWallet}
          onOpenChange={(open) => !open && setEditingWallet(null)}
        />
      )}

      {deletingWallet && (
        <DeleteWalletDialog
          wallet={deletingWallet}
          open={!!deletingWallet}
          onOpenChange={(open) => !open && setDeletingWallet(null)}
        />
      )}
    </div>
  );
};

export default WalletsList;