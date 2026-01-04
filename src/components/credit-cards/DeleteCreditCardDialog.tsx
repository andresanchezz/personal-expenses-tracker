import { Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useDeleteCreditCard } from '@/lib/api/credit-cards';
import { CreditCard } from '@/types/database';

interface DeleteCreditCardDialogProps {
  card: CreditCard;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DeleteCreditCardDialog: React.FC<DeleteCreditCardDialogProps> = ({
  card,
  open,
  onOpenChange,
}) => {
  const deleteCard = useDeleteCreditCard();

  const hasDebt = card.current_debt > 0;
  const hasCashback = card.pending_cashback > 0;
  const canDelete = !hasDebt && !hasCashback;

  const handleDelete = async () => {
    try {
      await deleteCard.mutateAsync(card.id);

      toast.success('Tarjeta eliminada', {
        description: `${card.name} ha sido eliminada exitosamente.`,
      });

      onOpenChange(false);
    } catch (error: any) {
      toast.error('Error al eliminar tarjeta', {
        description: error.message || 'Ocurrió un error inesperado.',
      });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className={`h-5 w-5 ${canDelete ? 'text-destructive' : 'text-amber-500'}`} />
            {canDelete ? '¿Eliminar tarjeta?' : 'No puedes eliminar esta tarjeta'}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            {canDelete ? (
              <>
                <p>
                  Estás a punto de eliminar la tarjeta <strong>{card.name}</strong>.
                </p>
                <p className="text-muted-foreground">
                  Esta acción no se puede deshacer.
                </p>
              </>
            ) : (
              <>
                <p>
                  La tarjeta <strong>{card.name}</strong> no se puede eliminar por los siguientes motivos:
                </p>
                {hasDebt && (
                  <div className="rounded-md bg-red-50 p-3 text-red-900">
                    <p className="font-medium">
                      💳 Tiene deuda pendiente: {formatCurrency(card.current_debt)}
                    </p>
                    <p className="mt-1 text-sm">
                      Paga la tarjeta completamente antes de eliminarla.
                    </p>
                  </div>
                )}
                {hasCashback && (
                  <div className="rounded-md bg-amber-50 p-3 text-amber-900">
                    <p className="font-medium">
                      💰 Tiene cashback pendiente: {formatCurrency(card.pending_cashback)}
                    </p>
                    <p className="mt-1 text-sm">
                      Transfiere el cashback a una cuenta antes de eliminar.
                    </p>
                  </div>
                )}
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {canDelete ? (
            <>
              <AlertDialogCancel disabled={deleteCard.isPending}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={deleteCard.isPending}
                className="bg-destructive hover:bg-destructive/90"
              >
                {deleteCard.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Eliminar
              </AlertDialogAction>
            </>
          ) : (
            <AlertDialogAction onClick={() => onOpenChange(false)}>
              Entendido
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteCreditCardDialog;