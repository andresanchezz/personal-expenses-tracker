import { useState, useMemo } from 'react';
import { Plus, Tag, Pen, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import CreateCategoryDialog from './CreateCategoryDialog';
import EditCategoryDialog from './EditCategoryDialog';
import DeleteCategoryDialog from './DeleteCategoryDialog';
import { useCategories } from '@/lib/api/categories';
import { Category } from '@/types/database';

const CategoriesList = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  const { data: categories, isLoading } = useCategories();

  // Agrupar categorías
  const grouped = useMemo(() => {
    if (!categories) return { parents: [], orphans: [] };

    const parents = categories.filter(c => c.type === 'parent');
    const children = categories.filter(c => c.type === 'child' && c.parent_id);
    const orphans = categories.filter(c => c.type === 'child' && !c.parent_id);

    return {
      parents: parents.map(parent => ({
        ...parent,
        children: children.filter(child => child.parent_id === parent.id),
      })),
      orphans,
    };
  }, [categories]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  const totalCategories = categories?.length || 0;
  const totalParents = grouped.parents.length;
  const totalChildren = categories?.filter(c => c.type === 'child').length || 0;

  const CategoryChip = ({ category, onEdit, onDelete }: { 
    category: Category; 
    onEdit: () => void; 
    onDelete: () => void;
  }) => (
    <Badge
      className="gap-2 px-3 py-1.5 text-sm font-medium"
      style={{ backgroundColor: category.color, color: '#fff' }}
    >
      <button
        onClick={onDelete}
        className="hover:opacity-70 transition-opacity"
        aria-label="Eliminar"
      >
        <X className="h-3.5 w-3.5" />
      </button>
      <span>{category.name}</span>
      <button
        onClick={onEdit}
        className="hover:opacity-70 transition-opacity"
        aria-label="Editar"
      >
        <Pen className="h-3.5 w-3.5" />
      </button>
    </Badge>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Tag className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Categorías ({totalCategories})</h2>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Categoría
        </Button>
      </div>

      {categories && categories.length > 0 ? (
        <div className="space-y-8">
          {/* Todas las categorías PADRE */}
          {grouped.parents.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">
                Categorías ({grouped.parents.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {grouped.parents.map((parent) => (
                  <CategoryChip
                    key={parent.id}
                    category={parent}
                    onEdit={() => setEditingCategory(parent)}
                    onDelete={() => setDeletingCategory(parent)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Todas las SUBCATEGORÍAS (hijas con padre) */}
          {grouped.parents.some(p => p.children && p.children.length > 0) && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">
                Subcategorías ({grouped.parents.reduce((sum, p) => sum + (p.children?.length || 0), 0)})
              </h3>
              <div className="flex flex-wrap gap-2">
                {grouped.parents.map((parent) =>
                  parent.children?.map((child) => (
                    <CategoryChip
                      key={child.id}
                      category={child}
                      onEdit={() => setEditingCategory(child)}
                      onDelete={() => setDeletingCategory(child)}
                    />
                  ))
                )}
              </div>
            </div>
          )}

          {/* Categorías SIN padre (huérfanas) */}
          {grouped.orphans.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">
                Sin categoría padre ({grouped.orphans.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {grouped.orphans.map((category) => (
                  <CategoryChip
                    key={category.id}
                    category={category}
                    onEdit={() => setEditingCategory(category)}
                    onDelete={() => setDeletingCategory(category)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
          <Tag className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">No tienes categorías</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Crea categorías para organizar tus transacciones
          </p>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Crear Categoría
          </Button>
        </div>
      )}

      {/* Dialogs */}
      <CreateCategoryDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />

      {editingCategory && (
        <EditCategoryDialog
          category={editingCategory}
          open={!!editingCategory}
          onOpenChange={(open) => !open && setEditingCategory(null)}
        />
      )}

      {deletingCategory && (
        <DeleteCategoryDialog
          category={deletingCategory}
          open={!!deletingCategory}
          onOpenChange={(open) => !open && setDeletingCategory(null)}
        />
      )}
    </div>
  );
};

export default CategoriesList;