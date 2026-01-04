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
import { useUpdateCategory, useCategories } from '@/lib/api/categories';
import { updateCategorySchema, UpdateCategoryInput } from '@/lib/validations/category';
import { Category } from '@/types/database';

interface EditCategoryDialogProps {
  category: Category;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditCategoryDialog: React.FC<EditCategoryDialogProps> = ({
  category,
  open,
  onOpenChange,
}) => {
  const updateCategory = useUpdateCategory();
  const { data: categories } = useCategories();

  const form = useForm<UpdateCategoryInput>({
    resolver: zodResolver(updateCategorySchema),
    defaultValues: {
      name: category.name,
      color: category.color,
      parent_id: category.parent_id,
    },
  });

  useEffect(() => {
    if (category) {
      form.reset({
        name: category.name,
        color: category.color,
        parent_id: category.parent_id,
      });
    }
  }, [category, form]);

  const selectedParentId = form.watch('parent_id');

  // Filtrar solo padres (excluyendo la categoría actual si es padre)
  const parentCategories = categories?.filter(
    c => c.type === 'parent' && c.id !== category.id
  ) || [];

  const onSubmit = async (data: UpdateCategoryInput) => {
    try {
      await updateCategory.mutateAsync({
        id: category.id,
        updates: data,
      });

      toast.success('Categoría actualizada', {
        description: `${data.name || category.name} ha sido actualizada exitosamente.`,
      });

      onOpenChange(false);
    } catch (error: any) {
      toast.error('Error al actualizar categoría', {
        description: error.message || 'Ocurrió un error inesperado.',
      });
    }
  };

  const canEditColor = category.type === 'parent' || !selectedParentId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Categoría</DialogTitle>
          <DialogDescription>
            Modifica los datos de tu categoría.
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
                      placeholder="Ej: Transporte"
                      {...field}
                      disabled={updateCategory.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Padre (solo si es child) */}
            {category.type === 'child' && (
              <FormField
                control={form.control}
                name="parent_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría Padre</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value === 'null' ? null : value)}
                      value={field.value || 'null'}
                      disabled={updateCategory.isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sin padre" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="null">Sin padre</SelectItem>
                        {parentCategories.map((parent) => (
                          <SelectItem key={parent.id} value={parent.id}>
                            {parent.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Cambiar el padre actualizará el color automáticamente.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Color (solo si es padre o hija sin padre) */}
            {canEditColor && (
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <FormControl>
                      <Input
                        type="color"
                        {...field}
                        disabled={updateCategory.isPending}
                        className="h-12 w-full cursor-pointer"
                      />
                    </FormControl>
                    {category.type === 'parent' && (
                      <FormDescription>
                        Cambiar el color actualizará todas las subcategorías.
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={updateCategory.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={updateCategory.isPending || !form.formState.isDirty}
              >
                {updateCategory.isPending && (
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

export default EditCategoryDialog;