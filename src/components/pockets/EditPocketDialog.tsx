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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useUpdatePocket } from '@/lib/api/pockets';
import { updatePocketSchema, UpdatePocketInput } from '@/lib/validations/pocket';
import { Pocket } from '@/types/database';

interface EditPocketDialogProps {
  pocket: Pocket;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditPocketDialog: React.FC<EditPocketDialogProps> = ({
  pocket,
  open,
  onOpenChange,
}) => {
  const updatePocket = useUpdatePocket();

  const form = useForm<UpdatePocketInput>({
    resolver: zodResolver(updatePocketSchema),
    defaultValues: {
      name: pocket.name,
    },
  });

  useEffect(() => {
    if (pocket) {
      form.reset({ name: pocket.name });
    }
  }, [pocket, form]);

  const onSubmit = async (data: UpdatePocketInput) => {
    try {
      await updatePocket.mutateAsync({
        id: pocket.id,
        accountId: pocket.account_id,
        updates: data,
      });

      toast.success('Bolsillo actualizado', {
        description: `${data.name} ha sido actualizado exitosamente.`,
      });

      onOpenChange(false);
    } catch (error: any) {
      toast.error('Error al actualizar bolsillo', {
        description: error.message || 'Ocurrió un error inesperado.',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Bolsillo</DialogTitle>
          <DialogDescription>
            Modifica el nombre de tu bolsillo.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Vacaciones"
                      {...field}
                      disabled={updatePocket.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={updatePocket.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={updatePocket.isPending || !form.formState.isDirty}
              >
                {updatePocket.isPending && (
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

export default EditPocketDialog;