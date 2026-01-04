import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useUpdateCreditCard } from '@/lib/api/credit-cards';
import { useWallets } from '@/lib/api/wallets';
import { updateCreditCardSchema, UpdateCreditCardInput } from '@/lib/validations/credit-card';
import { CreditCard } from '@/types/database';

interface EditCreditCardDialogProps {
  card: CreditCard;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditCreditCardDialog: React.FC<EditCreditCardDialogProps> = ({
  card,
  open,
  onOpenChange,
}) => {
  const updateCard = useUpdateCreditCard();
  const { data: wallets } = useWallets();

  const form = useForm<UpdateCreditCardInput>({
    resolver: zodResolver(updateCreditCardSchema),
    defaultValues: {
      name: card.name,
      credit_limit: card.credit_limit,
      cashback_percentage: card.cashback_percentage,
      cashback_destination_account_id: card.cashback_destination_account_id,
    },
  });

  useEffect(() => {
    if (card) {
      form.reset({
        name: card.name,
        credit_limit: card.credit_limit,
        cashback_percentage: card.cashback_percentage,
        cashback_destination_account_id: card.cashback_destination_account_id,
      });
    }
  }, [card, form]);

  const onSubmit = async (data: UpdateCreditCardInput) => {
    try {
      await updateCard.mutateAsync({
        id: card.id,
        updates: data,
      });

      toast.success('Tarjeta actualizada', {
        description: `${data.name || card.name} ha sido actualizada exitosamente.`,
      });

      onOpenChange(false);
    } catch (error: any) {
      toast.error('Error al actualizar tarjeta', {
        description: error.message || 'Ocurrió un error inesperado.',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Tarjeta</DialogTitle>
          <DialogDescription>
            Modifica los datos de tu tarjeta de crédito.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Nombre */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Visa Bancolombia"
                      {...field}
                      disabled={updateCard.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Cupo */}
            <FormField
              control={form.control}
              name="credit_limit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cupo Total</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      step="1000"
                      min="0"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value === '' ? 0 : parseFloat(value));
                      }}
                      disabled={updateCard.isPending}
                    />
                  </FormControl>
                  <FormDescription>
                    No puede ser menor que la deuda actual: ${card.current_debt.toLocaleString()}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Cashback % */}
            <FormField
              control={form.control}
              name="cashback_percentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cashback (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      step="0.1"
                      min="0"
                      max="100"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value === '' ? 0 : parseFloat(value));
                      }}
                      disabled={updateCard.isPending}
                    />
                  </FormControl>
                  <FormDescription>
                    Cambiar esto afecta solo transacciones futuras.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Cuenta destino cashback */}
            <FormField
              control={form.control}
              name="cashback_destination_account_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cuenta Destino Cashback</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value === 'null' ? null : value)}
                    value={field.value || 'null'}
                    disabled={updateCard.isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Ninguna" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="null">Ninguna</SelectItem>
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
                onClick={() => onOpenChange(false)}
                disabled={updateCard.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={updateCard.isPending || !form.formState.isDirty}
              >
                {updateCard.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Guardar Cambios
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditCreditCardDialog;