import { Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
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
import { useDeleteWallet } from '@/lib/api/wallets';
import { BankAccount } from '@/types/database';

interface DeleteWalletDialogProps {
  wallet: BankAccount;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DeleteWalletDialog: React.FC<DeleteWalletDialogProps> = ({
  wallet,
  open,
  onOpenChange,
}) => {
  const deleteWallet = useDeleteWallet();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const hasBalance = wallet.balance_total > 0;

  const handleDelete = async () => {
    try {
      await deleteWallet.mutateAsync(wallet.id);
      
      toast.success('Billetera eliminada', {
        description: `${wallet.name} ha sido eliminada exitosamente.`,
      });
      
      onOpenChange(false);
    } catch (error: any) {
      toast.error('Error al eliminar billetera', {
        description: error.message || 'Ocurrió un error inesperado.',
      });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            {hasBalance ? '¿No puedes eliminar esta billetera' : '¿Eliminar billetera?'}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            {hasBalance ? (
              <>
                <p>
                  La billetera <strong>{wallet.name}</strong> tiene un saldo de{' '}
                  <strong>{formatCurrency(wallet.balance_total)}</strong>.
                </p>
                <p className="text-destructive font-medium">
                  No puedes eliminar una billetera con saldo. Debe estar en $0.
                </p>
              </>
            ) : (
              <>
                <p>
                  Estás a punto de eliminar la billetera <strong>{wallet.name}</strong>.
                </p>
                <p className="text-muted-foreground">
                  Esta acción no se puede deshacer.
                </p>
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {hasBalance ? (
            <AlertDialogAction onClick={() => onOpenChange(false)}>
              Entendido
            </AlertDialogAction>
          ) : (
            <>
              <AlertDialogCancel disabled={deleteWallet.isPending}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={deleteWallet.isPending}
                className="bg-destructive hover:bg-destructive/90"
              >
                {deleteWallet.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Eliminar
              </AlertDialogAction>
            </>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteWalletDialog;