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
import { useCreateCreditCard } from '@/lib/api/credit-cards';
import { useWallets } from '@/lib/api/wallets';
import { createCreditCardSchema, CreateCreditCardInput } from '@/lib/validations/credit-card';

interface CreateCreditCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateCreditCardDialog: React.FC<CreateCreditCardDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const createCard = useCreateCreditCard();
  const { data: wallets } = useWallets();

  const form = useForm<CreateCreditCardInput>({
    resolver: zodResolver(createCreditCardSchema),
    defaultValues: {
      name: '',
      credit_limit: 0,
      cashback_percentage: 0,
      cashback_destination_account_id: null,
    },
  });

  const onSubmit = async (data: CreateCreditCardInput) => {
    try {
      await createCard.mutateAsync(data);

      toast.success('Tarjeta creada', {
        description: `${data.name} ha sido creada exitosamente.`,
      });

      form.reset();
      onOpenChange(false);
    } catch (error: any) {
      toast.error('Error al crear tarjeta', {
        description: error.message || 'Ocurrió un error inesperado.',
      });
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && !createCard.isPending) {
      form.reset();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nueva Tarjeta de Crédito</DialogTitle>
          <DialogDescription>
            Agrega una nueva tarjeta para gestionar tu deuda y cashback.
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
                  <FormLabel>Nombre *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Visa Bancolombia"
                      {...field}
                      disabled={createCard.isPending}
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
                  <FormLabel>Cupo Total *</FormLabel>
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
                      disabled={createCard.isPending}
                    />
                  </FormControl>
                  <FormDescription>
                    Límite de crédito de la tarjeta.
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
                      disabled={createCard.isPending}
                    />
                  </FormControl>
                  <FormDescription>
                    Porcentaje de cashback. Deja en 0 si no aplica.
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
                  <FormLabel>Cuenta Destino Cashback (opcional)</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value === 'null' ? null : value)}
                    value={field.value || 'null'}
                    disabled={createCard.isPending}
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
                  <FormDescription>
                    Cuenta por defecto para transferir el cashback.
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
                disabled={createCard.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createCard.isPending}
              >
                {createCard.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Crear Tarjeta
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCreditCardDialog;