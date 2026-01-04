import { Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useDeleteCategory, useCategories } from '@/lib/api/categories';
import { Category } from '@/types/database';

interface DeleteCategoryDialogProps {
  category: Category;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DeleteCategoryDialog: React.FC<DeleteCategoryDialogProps> = ({
  category,
  open,
  onOpenChange,
}) => {
  const deleteCategory = useDeleteCategory();
  const { data: categories } = useCategories();

  // Contar hijos si es padre
  const childrenCount = category.type === 'parent'
    ? categories?.filter(c => c.parent_id === category.id).length || 0
    : 0;

  const handleDelete = async () => {
    try {
      await deleteCategory.mutateAsync(category.id);

      toast.success('Categoría eliminada', {
        description: childrenCount > 0
          ? `${category.name} y ${childrenCount} subcategorías eliminadas.`
          : `${category.name} ha sido eliminada exitosamente.`,
      });

      onOpenChange(false);
    } catch (error: any) {
      toast.error('Error al eliminar categoría', {
        description: error.message || 'Ocurrió un error inesperado.',
      });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            ¿Eliminar categoría?
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Estás a punto de eliminar la categoría <strong>{category.name}</strong>.
            </p>
            
            {childrenCount > 0 && (
              <div className="rounded-md bg-amber-50 p-3 text-amber-900">
                <p className="font-medium">
                  ⚠️ Esta categoría tiene {childrenCount} subcategoría{childrenCount > 1 ? 's' : ''}.
                </p>
                <p className="mt-1 text-sm">
                  Todas serán eliminadas también.
                </p>
              </div>
            )}

            <p className="text-muted-foreground">
              Esta acción no se puede deshacer.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteCategory.isPending}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteCategory.isPending}
            className="bg-destructive hover:bg-destructive/90"
          >
            {deleteCategory.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteCategoryDialog;