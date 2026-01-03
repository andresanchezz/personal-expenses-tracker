import { useState } from 'react';
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
import { useCreateWallet } from '@/lib/api/wallets';
import { createWalletSchema, CreateWalletInput, validateWalletInterest } from '@/lib/validations/wallet';

interface CreateWalletDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateWalletDialog: React.FC<CreateWalletDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const createWallet = useCreateWallet();
  const [customError, setCustomError] = useState<string>('');

  const form = useForm<CreateWalletInput>({
    resolver: zodResolver(createWalletSchema),
    defaultValues: {
      name: '',
      interest_rate: 0,
      interest_payment_frequency: null,
      balance_available: 0
    },
  });

  const interestRate = form.watch('interest_rate');

  const onSubmit = async (data: CreateWalletInput) => {
    setCustomError('');

    // Validación adicional de intereses
    const validation = validateWalletInterest(data);
    if (!validation.valid) {
      setCustomError(validation.error!);
      return;
    }

    try {
      await createWallet.mutateAsync(data);
      
      toast.success('Billetera creada', {
        description: `${data.name} ha sido creada exitosamente.`,
      });
      
      form.reset();
      onOpenChange(false);
    } catch (error: any) {
      toast.error('Error al crear billetera', {
        description: error.message || 'Ocurrió un error inesperado.',
      });
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && !createWallet.isPending) {
      form.reset();
      setCustomError('');
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Nueva Billetera</DialogTitle>
          <DialogDescription>
            Crea una nueva billetera para gestionar tu dinero.
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
                      placeholder="Ej: Nequi Principal" 
                      {...field} 
                      disabled={createWallet.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/*Balance inicial*/}
            <FormField
              control={form.control}
              name="balance_available"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Balance inicial</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      step="1"
                      max={100000000}
                      min="0"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      disabled={createWallet.isPending}
                    />
                  </FormControl>
                  <FormDescription>
                    ¿Cuánto dinero tienes actualmente en esta cuenta?
                  </FormDescription>
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
                      disabled={createWallet.isPending}
                    />
                  </FormControl>
                  <FormDescription>
                    Tasa Efectiva Anual. Deja en 0 si no genera intereses.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Periodicidad (solo si hay tasa > 0) */}
            {interestRate > 0 && (
              <FormField
                control={form.control}
                name="interest_payment_frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Periodicidad de Pago *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || undefined}
                      disabled={createWallet.isPending}
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
                    <FormDescription>
                      ¿Con qué frecuencia se pagan los intereses?
                    </FormDescription>
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
                disabled={createWallet.isPending}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={createWallet.isPending || !form.formState.isValid}
              >
                {createWallet.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Crear Billetera
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateWalletDialog;