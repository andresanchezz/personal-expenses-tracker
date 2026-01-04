import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, CreditCard as CreditCardIcon } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { usePayCard } from '@/lib/api/credit-cards';
import { useWallets } from '@/lib/api/wallets';
import { payCardSchema, PayCardInput } from '@/lib/validations/credit-card';
import { CreditCard } from '@/types/database';
import { z } from 'zod';

interface PayCardDialogProps {
  card: CreditCard;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PayCardDialog: React.FC<PayCardDialogProps> = ({
  card,
  open,
  onOpenChange,
}) => {
  const payCard = usePayCard();
  const { data: wallets } = useWallets();

  const form = useForm<PayCardInput>({
    resolver: zodResolver(payCardSchema),
    defaultValues: {
      card_id: card.id,
      account_id: '',
      amount: 0,
    },
  });

  const selectedAccountId = form.watch('account_id');
  const selectedAccount = wallets?.find(w => w.id === selectedAccountId);

  const onSubmit = async (data: PayCardInput) => {
    try {
      await payCard.mutateAsync(data);

      toast.success('Pago realizado', {
        description: `Se pagaron ${formatCurrency(data.amount)} a ${card.name}.`,
      });

      form.reset();
      onOpenChange(false);
    } catch (error: any) {
      toast.error('Error al pagar tarjeta', {
        description: error.message || 'Ocurrió un error inesperado.',
      });
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && !payCard.isPending) {
      form.reset();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCardIcon className="h-5 w-5" />
            Pagar {card.name}
          </DialogTitle>
          <DialogDescription>
            Paga la deuda de tu tarjeta desde una cuenta bancaria.
          </DialogDescription>
        </DialogHeader>

        {/* Info de deuda */}
        <div className="rounded-lg border bg-muted/50 p-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Deuda actual:</span>
            <span className="font-semibold text-red-600">{formatCurrency(card.current_debt)}</span>
          </div>
          {selectedAccount && (
            <div className="flex justify-between mt-2">
              <span className="text-muted-foreground">Disponible en cuenta:</span>
              <span className="font-semibold">{formatCurrency(selectedAccount.balance_available)}</span>
            </div>
          )}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Cuenta origen */}
            <FormField
              control={form.control}
              name="account_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pagar desde *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={payCard.isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una cuenta" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {wallets?.map((wallet) => (
                        <SelectItem key={wallet.id} value={wallet.id}>
                          {wallet.name} - {formatCurrency(wallet.balance_available)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Monto */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monto *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      step="1"
                      min="0"
                      max={card.current_debt}
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value === '' ? 0 : parseFloat(value));
                      }}
                      disabled={payCard.isPending}
                    />
                  </FormControl>
                  <FormDescription>
                    Máximo: {formatCurrency(card.current_debt)}
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
                disabled={payCard.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={payCard.isPending || !form.watch('amount') || form.watch('amount') <= 0}
              >
                {payCard.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Pagar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default PayCardDialog;