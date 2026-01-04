import { Pen, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Category } from '@/types/database';

interface CategoryCardProps {
  category: Category;
  onEdit: () => void;
  onDelete: () => void;
  isChild?: boolean;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onEdit,
  onDelete,
  isChild = false,
}) => {
  return (
    <div
      className={`flex items-center justify-between rounded-lg border bg-card p-4 transition-shadow hover:shadow-md ${
        isChild ? 'border-l-4' : ''
      }`}
      style={isChild ? { borderLeftColor: category.color } : undefined}
    >
      <div className="flex items-center gap-3">
        {/* Color badge */}
        <div
          className="h-10 w-10 rounded-full border-2 border-background shadow-sm"
          style={{ backgroundColor: category.color }}
          title={category.color}
        />

        {/* Info */}
        <div>
          <h3 className="font-semibold">{category.name}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant={category.type === 'parent' ? 'default' : 'secondary'}>
              {category.type === 'parent' ? 'Padre' : 'Hija'}
            </Badge>
            {!isChild && category.type === 'parent' && (
              <span className="text-xs">
                (Solo para agrupar)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onEdit}
          aria-label="Editar"
        >
          <Pen className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          aria-label="Eliminar"
        >
          <Trash className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default CategoryCard;