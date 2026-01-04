import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, TrendingUp } from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import { useTransferCashback } from '@/lib/api/credit-cards';
import { useWallets } from '@/lib/api/wallets';
import { transferCashbackSchema, TransferCashbackInput } from '@/lib/validations/credit-card';
import { CreditCard } from '@/types/database';

interface TransferCashbackDialogProps {
  card: CreditCard;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TransferCashbackDialog: React.FC<TransferCashbackDialogProps> = ({
  card,
  open,
  onOpenChange,
}) => {
  const transferCashback = useTransferCashback();
  const { data: wallets } = useWallets();

  const form = useForm<TransferCashbackInput>({
    resolver: zodResolver(transferCashbackSchema),
    defaultValues: {
      card_id: card.id,
      account_id: card.cashback_destination_account_id || '',
    },
  });

  const onSubmit = async (data: TransferCashbackInput) => {
    try {
      const result = await transferCashback.mutateAsync(data);

      toast.success('Cashback transferido', {
        description: `${formatCurrency(result.amount)} transferido a tu cuenta.`,
      });

      form.reset();
      onOpenChange(false);
    } catch (error: any) {
      toast.error('Error al transferir cashback', {
        description: error.message || 'Ocurrió un error inesperado.',
      });
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && !transferCashback.isPending) {
      form.reset();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Transferir Cashback
          </DialogTitle>
          <DialogDescription>
            Transfiere el cashback acumulado de {card.name} a una cuenta.
          </DialogDescription>
        </DialogHeader>

        {/* Info de cashback */}
        <div className="rounded-lg border bg-green-50 p-4 text-center">
          <p className="text-sm text-muted-foreground">Cashback Pendiente</p>
          <p className="text-3xl font-bold text-green-600">
            {formatCurrency(card.pending_cashback)}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Cuenta destino */}
            <FormField
              control={form.control}
              name="account_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transferir a *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={transferCashback.isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una cuenta" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {wallets?.map((wallet) => (
                        <SelectItem key={wallet.id} value={wallet.id}>
                          {wallet.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={transferCashback.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={transferCashback.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {transferCashback.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Transferir
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default TransferCashbackDialog;