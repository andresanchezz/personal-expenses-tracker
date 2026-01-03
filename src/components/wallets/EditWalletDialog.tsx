import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
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
import { toast } from 'sonner';
import { useUpdateWallet } from '@/lib/api/wallets';
import { updateWalletSchema, UpdateWalletInput, validateWalletInterest } from '@/lib/validations/wallet';
import { BankAccount } from '@/types/database';

interface EditWalletDialogProps {
  wallet: BankAccount;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditWalletDialog: React.FC<EditWalletDialogProps> = ({
  wallet,
  open,
  onOpenChange,
}) => {
  const updateWallet = useUpdateWallet();
  const [customError, setCustomError] = useState<string>('');

  const form = useForm<UpdateWalletInput>({
    resolver: zodResolver(updateWalletSchema),
    defaultValues: {
      name: wallet.name,
      interest_rate: wallet.interest_rate,
      interest_payment_frequency: wallet.interest_payment_frequency,

    },
  });

  // Actualizar valores cuando cambia la wallet
  useEffect(() => {
    if (wallet) {
      form.reset({
        name: wallet.name,
        interest_rate: wallet.interest_rate,
        interest_payment_frequency: wallet.interest_payment_frequency,
      });
    }
  }, [wallet, form]);

  const interestRate = form.watch('interest_rate');

  const onSubmit = async (data: UpdateWalletInput) => {
    setCustomError('');

    // Validación adicional de intereses
    const validation = validateWalletInterest(data);
    if (!validation.valid) {
      setCustomError(validation.error!);
      return;
    }

    try {
      await updateWallet.mutateAsync({
        id: wallet.id,
        updates: data,
      });
      
      toast.success('Billetera actualizada', {
        description: `${data.name || wallet.name} ha sido actualizada exitosamente.`,
      });
      
      onOpenChange(false);
    } catch (error: any) {
      toast.error('Error al actualizar billetera', {
        description: error.message || 'Ocurrió un error inesperado.',
      });
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && !updateWallet.isPending) {
      setCustomError('');
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Billetera</DialogTitle>
          <DialogDescription>
            Modifica los datos de tu billetera. Los cambios en la tasa de interés afectan solo cálculos futuros.
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
                      placeholder="Ej: Nequi Principal" 
                      {...field} 
                      disabled={updateWallet.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tasa de Interés */}
            <FormField
              control={form.control}
              name="interest_rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tasa de Interés (% E.A.)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      step="0.1"
                      min="0"
                      max="100"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      disabled={updateWallet.isPending}
                    />
                  </FormControl>
                  <FormDescription>
                    Cambiar esto afecta solo cálculos futuros.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Periodicidad (solo si hay tasa > 0) */}
            {(interestRate ?? 0) > 0 && (
              <FormField
                control={form.control}
                name="interest_payment_frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Periodicidad de Pago</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || undefined}
                      disabled={updateWallet.isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="daily">Diario</SelectItem>
                        <SelectItem value="monthly">Mensual</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Error personalizado */}
            {customError && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {customError}
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={updateWallet.isPending}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={updateWallet.isPending || !form.formState.isDirty}
              >
                {updateWallet.isPending && (
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

export default EditWalletDialog;