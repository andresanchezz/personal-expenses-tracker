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
import { useDeletePocket } from '@/lib/api/pockets';
import { Pocket } from '@/types/database';

interface DeletePocketDialogProps {
  pocket: Pocket;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DeletePocketDialog: React.FC<DeletePocketDialogProps> = ({
  pocket,
  open,
  onOpenChange,
}) => {
  const deletePocket = useDeletePocket();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const hasBalance = pocket.balance > 0;

  const handleDelete = async () => {
    try {
      await deletePocket.mutateAsync({
        id: pocket.id,
        accountId: pocket.account_id,
      });

      toast.success('Bolsillo eliminado', {
        description: hasBalance
          ? `${pocket.name} eliminado. ${formatCurrency(pocket.balance)} transferido a tu cuenta.`
          : `${pocket.name} ha sido eliminado exitosamente.`,
      });

      onOpenChange(false);
    } catch (error: any) {
      toast.error('Error al eliminar bolsillo', {
        description: error.message || 'Ocurrió un error inesperado.',
      });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            ¿Eliminar bolsillo?
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Estás a punto de eliminar el bolsillo <strong>{pocket.name}</strong>.
            </p>
            {hasBalance ? (
              <p className="rounded-md bg-amber-50 p-3 text-amber-900">
                <strong>Nota:</strong> El saldo de {formatCurrency(pocket.balance)}{' '}
                será transferido automáticamente al balance disponible de tu cuenta.
              </p>
            ) : (
              <p className="text-muted-foreground">
                Esta acción no se puede deshacer.
              </p>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deletePocket.isPending}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deletePocket.isPending}
            className="bg-destructive hover:bg-destructive/90"
          >
            {deletePocket.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeletePocketDialog;