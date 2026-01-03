import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, ArrowUpFromLine } from 'lucide-react';
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
import { useMoveFromPocket } from '@/lib/api/pockets';
import { moveFromPocketSchema, MoveFromPocketInput } from '@/lib/validations/pocket';
import { Pocket } from '@/types/database';

interface MoveFromPocketDialogProps {
  pocket: Pocket;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MoveFromPocketDialog: React.FC<MoveFromPocketDialogProps> = ({
  pocket,
  open,
  onOpenChange,
}) => {
  const moveFromPocket = useMoveFromPocket();

  const form = useForm<MoveFromPocketInput>({
    resolver: zodResolver(moveFromPocketSchema),
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

  const onSubmit = async (data: MoveFromPocketInput) => {
    try {
      await moveFromPocket.mutateAsync({
        ...data,
        accountId: pocket.account_id,
      });

      toast.success('Dinero retirado', {
        description: `${formatCurrency(data.amount)} movido de ${pocket.name} a tu cuenta.`,
      });

      form.reset();
      onOpenChange(false);
    } catch (error: any) {
      toast.error('Error al retirar', {
        description: error.message || 'Ocurrió un error inesperado.',
      });
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && !moveFromPocket.isPending) {
      form.reset();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowUpFromLine className="h-5 w-5" />
            Retirar de {pocket.name}
          </DialogTitle>
          <DialogDescription>
            Mueve dinero desde este bolsillo a tu cuenta (suelto).
          </DialogDescription>
        </DialogHeader>

        {/* Info de saldo */}
        <div className="rounded-lg border bg-muted/50 p-3 text-sm">
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
                      max={pocket.balance}
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value === '' ? 0 : parseFloat(value));
                      }}
                      disabled={moveFromPocket.isPending}
                    />
                  </FormControl>
                  <FormDescription>
                    Máximo: {formatCurrency(pocket.balance)}
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
                disabled={moveFromPocket.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={moveFromPocket.isPending || !form.watch('amount') || form.watch('amount') <= 0}
              >
                {moveFromPocket.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Retirar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default MoveFromPocketDialog;