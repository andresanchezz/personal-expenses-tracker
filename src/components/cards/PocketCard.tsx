import { Pen, Trash, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Pocket } from '@/types/database';

interface PocketCardProps {
  pocket: Pocket;
  onEdit: () => void;
  onDelete: () => void;
  onMoveTo: () => void;
  onMoveFrom: () => void;
}

const PocketCard: React.FC<PocketCardProps> = ({
  pocket,
  onEdit,
  onDelete,
  onMoveTo,
  onMoveFrom,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Generar color basado en el nombre (consistente)
  const generateColor = (name: string): string => {
    const colors = [
      '#6366f1', // indigo
      '#8b5cf6', // violet
      '#ec4899', // pink
      '#f43f5e', // rose
      '#f59e0b', // amber
      '#10b981', // emerald
      '#14b8a6', // teal
      '#06b6d4', // cyan
    ];

    const hash = name.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);

    return colors[Math.abs(hash) % colors.length];
  };

  const color = generateColor(pocket.name);

  return (
    <div
      className="relative rounded-xl p-5 shadow-lg transition-transform hover:scale-105"
      style={{ backgroundColor: color }}
    >
      {/* Header con nombre y acciones */}
      <div className="mb-3 flex items-start justify-between">
        <h3 className="text-lg font-semibold text-white">{pocket.name}</h3>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-white hover:bg-white/20"
            onClick={onEdit}
            aria-label="Editar"
          >
            <Pen className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-white hover:bg-white/20"
            onClick={onDelete}
            aria-label="Eliminar"
          >
            <Trash className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Balance */}
      <div className="mb-4">
        <p className="text-2xl font-bold text-white">
          {formatCurrency(pocket.balance)}
        </p>
      </div>

      {/* Botones de movimiento */}
      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          className="flex-1 bg-white/20 text-white hover:bg-white/30"
          onClick={onMoveTo}
          title="Mover dinero desde la cuenta a este bolsillo"
        >
          <ArrowDownToLine className="mr-1 h-3.5 w-3.5" />
          Depositar
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="flex-1 bg-white/20 text-white hover:bg-white/30"
          onClick={onMoveFrom}
          disabled={pocket.balance <= 0}
          title="Sacar dinero de este bolsillo a la cuenta"
        >
          <ArrowUpFromLine className="mr-1 h-3.5 w-3.5" />
          Retirar
        </Button>
      </div>
    </div>
  );
};

export default PocketCard;