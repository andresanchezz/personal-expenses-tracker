import { useState } from 'react';
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
import { useCreateCategory, useCategories } from '@/lib/api/categories';
import { createCategorySchema, CreateCategoryInput, validateCategoryColor } from '@/lib/validations/category';

interface CreateCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateCategoryDialog: React.FC<CreateCategoryDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const createCategory = useCreateCategory();
  const { data: categories } = useCategories();
  const [customError, setCustomError] = useState<string>('');

  const form = useForm<CreateCategoryInput>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      name: '',
      type: 'child',
      color: '#3b82f6',
      parent_id: null,
    },
  });

  const selectedType = form.watch('type');
  const selectedParentId = form.watch('parent_id');

  // Filtrar solo padres para el selector
  const parentCategories = categories?.filter(c => c.type === 'parent') || [];

  const onSubmit = async (data: CreateCategoryInput) => {
    setCustomError('');

    // Validación de color
    const validation = validateCategoryColor(data);
    if (!validation.valid) {
      setCustomError(validation.error!);
      return;
    }

    try {
      await createCategory.mutateAsync(data);

      toast.success('Categoría creada', {
        description: `${data.name} ha sido creada exitosamente.`,
      });

      form.reset();
      onOpenChange(false);
    } catch (error: any) {
      toast.error('Error al crear categoría', {
        description: error.message || 'Ocurrió un error inesperado.',
      });
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && !createCategory.isPending) {
      form.reset();
      setCustomError('');
    }
    onOpenChange(open);
  };

  const needsColor = selectedType === 'parent' || !selectedParentId;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nueva Categoría</DialogTitle>
          <DialogDescription>
            Crea una categoría para organizar tus transacciones.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Tipo */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={createCategory.isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="parent">Padre (solo agrupa)</SelectItem>
                      <SelectItem value="child">Hija (asignable)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Las categorías padre solo agrupan. Las hijas se asignan a transacciones.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Nombre */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Transporte"
                      {...field}
                      disabled={createCategory.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Padre (solo si es child) */}
            {selectedType === 'child' && (
              <FormField
                control={form.control}
                name="parent_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría Padre (opcional)</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || undefined}
                      disabled={createCategory.isPending}
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
                      Si tiene padre, heredará su color automáticamente.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Color (solo si es padre o hija sin padre) */}
            {needsColor && (
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color *</FormLabel>
                    <FormControl>
                      <Input
                        type="color"
                        {...field}
                        disabled={createCategory.isPending}
                        className="h-12 w-full cursor-pointer"
                      />
                    </FormControl>
                    <FormDescription>
                      Elige un color para identificar esta categoría.
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
                disabled={createCategory.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createCategory.isPending}
              >
                {createCategory.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Crear Categoría
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCategoryDialog;