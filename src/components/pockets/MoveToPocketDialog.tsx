import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, ArrowDownToLine } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useMoveToPocket } from '@/lib/api/pockets';
import { moveToPocketSchema, MoveToPocketInput } from '@/lib/validations/pocket';
import { Pocket, BankAccount } from '@/types/database';

interface MoveToPocketDialogProps {
  pocket: Pocket;
  wallet: BankAccount;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MoveToPocketDialog: React.FC<MoveToPocketDialogProps> = ({
  pocket,
  wallet,
  open,
  onOpenChange,
}) => {
  const moveToPocket = useMoveToPocket();

  const form = useForm<MoveToPocketInput>({
    resolver: zodResolver(moveToPocketSchema),
    defaultValues: {
      pocket_id: pocket.id,
      amount: 0,
    },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const onSubmit = async (data: MoveToPocketInput) => {
    try {
      await moveToPocket.mutateAsync({
        ...data,
        accountId: wallet.id,
      });

      toast.success('Dinero depositado', {
        description: `${formatCurrency(data.amount)} movido a ${pocket.name}.`,
      });

      form.reset();
      onOpenChange(false);
    } catch (error: any) {
      toast.error('Error al depositar', {
        description: error.message || 'Ocurrió un error inesperado.',
      });
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && !moveToPocket.isPending) {
      form.reset();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowDownToLine className="h-5 w-5" />
            Depositar a {pocket.name}
          </DialogTitle>
          <DialogDescription>
            Mueve dinero desde tu cuenta (suelto) a este bolsillo.
          </DialogDescription>
        </DialogHeader>

        {/* Info de saldos */}
        <div className="rounded-lg border bg-muted/50 p-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Disponible en cuenta:</span>
            <span className="font-semibold">{formatCurrency(wallet.balance_available)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Balance en bolsillo:</span>
            <span className="font-semibold">{formatCurrency(pocket.balance)}</span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monto</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      step="1"
                      min="0"
                      max={wallet.balance_available}
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value === '' ? 0 : parseFloat(value));
                      }}
                      disabled={moveToPocket.isPending}
                    />
                  </FormControl>
                  <FormDescription>
                    Máximo: {formatCurrency(wallet.balance_available)}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={moveToPocket.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={moveToPocket.isPending || !form.watch('amount') || form.watch('amount') <= 0}
              >
                {moveToPocket.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Depositar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default MoveToPocketDialog;