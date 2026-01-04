import { useState } from 'react';
import { Plus, CreditCard as CreditCardIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';

import CreateCreditCardDialog from './CreateCreditCardDialog';
import EditCreditCardDialog from './EditCreditCardDialog';
import DeleteCreditCardDialog from './DeleteCreditCardDialog';
import PayCardDialog from './PayCardDialog';
import TransferCashbackDialog from './TransferCashbackDialog';
import { useCreditCards } from '@/lib/api/credit-cards';
import { CreditCard } from '@/types/database';
import CreditCardCard from '../cards/CreditCardCard';

const CreditCardsList = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null);
  const [deletingCard, setDeletingCard] = useState<CreditCard | null>(null);
  const [payingCard, setPayingCard] = useState<CreditCard | null>(null);
  const [transferringCashback, setTransferringCashback] = useState<CreditCard | null>(null);

  const { data: cards, isLoading } = useCreditCards();

  // Calcular totales
  const totalDebt = cards?.reduce((sum, c) => sum + c.current_debt, 0) || 0;
  const totalCashbackPending = cards?.reduce((sum, c) => sum + c.pending_cashback, 0) || 0;
  const cardsCount = cards?.length || 0;

  if (isLoading) {
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
          <CreditCardIcon className="h-5 w-5" />
          <h2 className="md:text-2xl font-bold">Tarjetas de Crédito ({cardsCount})</h2>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Tarjeta
        </Button>
      </div>

      {/* Total Debt Card */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Deuda Total</p>
            <p className="text-3xl font-bold text-red-600">{formatCurrency(totalDebt)}</p>
          </div>
          {totalCashbackPending > 0 && (
            <div>
              <p className="text-sm text-muted-foreground">Cashback Pendiente</p>
              <p className="text-3xl font-bold text-green-600">{formatCurrency(totalCashbackPending)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Cards Grid */}
      {cards && cards.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <CreditCardCard
              key={card.id}
              card={card}
              onEdit={() => setEditingCard(card)}
              onDelete={() => setDeletingCard(card)}
              onPay={() => setPayingCard(card)}
              onTransferCashback={() => setTransferringCashback(card)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
          <CreditCardIcon className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">No tienes tarjetas</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Agrega tus tarjetas de crédito para gestionar tu deuda y cashback
          </p>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Crear Tarjeta
          </Button>
        </div>
      )}

      {/* Dialogs */}
      <CreateCreditCardDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />

      {editingCard && (
        <EditCreditCardDialog
          card={editingCard}
          open={!!editingCard}
          onOpenChange={(open) => !open && setEditingCard(null)}
        />
      )}

      {deletingCard && (
        <DeleteCreditCardDialog
          card={deletingCard}
          open={!!deletingCard}
          onOpenChange={(open) => !open && setDeletingCard(null)}
        />
      )}

      {payingCard && (
        <PayCardDialog
          card={payingCard}
          open={!!payingCard}
          onOpenChange={(open) => !open && setPayingCard(null)}
        />
      )}

      {transferringCashback && (
        <TransferCashbackDialog
          card={transferringCashback}
          open={!!transferringCashback}
          onOpenChange={(open) => !open && setTransferringCashback(null)}
        />
      )}
    </div>
  );
};

export default CreditCardsList;