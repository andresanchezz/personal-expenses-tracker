import { useState } from 'react';
import { ArrowLeft, Plus, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
;
import { usePockets, useCreatePocket } from '@/lib/api/pockets';
import { BankAccount, Pocket } from '@/types/database';
import EditPocketDialog from './EditPocketDialog';
import DeletePocketDialog from './DeletePocketDialog';
import MoveToPocketDialog from './MoveToPocketDialog';
import MoveFromPocketDialog from './MoveFromPocketDialog';
import PocketCard from '../cards/PocketCard';

interface PocketsViewProps {
  wallet: BankAccount;
  onBack: () => void;
}

const PocketsView: React.FC<PocketsViewProps> = ({ wallet, onBack }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newPocketName, setNewPocketName] = useState('');
  const [editingPocket, setEditingPocket] = useState<Pocket | null>(null);
  const [deletingPocket, setDeletingPocket] = useState<Pocket | null>(null);
  const [movingToPocket, setMovingToPocket] = useState<Pocket | null>(null);
  const [movingFromPocket, setMovingFromPocket] = useState<Pocket | null>(null);

  const { data: pockets, isLoading } = usePockets(wallet.id);
  const createPocket = useCreatePocket();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleCreatePocket = async () => {
    if (!newPocketName.trim()) {
      toast.error('El nombre del bolsillo es obligatorio');
      return;
    }

    if (newPocketName.trim().length < 2) {
      toast.error('El nombre debe tener al menos 2 caracteres');
      return;
    }

    try {
      await createPocket.mutateAsync({
        name: newPocketName.trim(),
        account_id: wallet.id,
      });

      toast.success('Bolsillo creado', {
        description: `${newPocketName} ha sido creado exitosamente.`,
      });

      setNewPocketName('');
      setIsCreating(false);
    } catch (error: any) {
      toast.error('Error al crear bolsillo', {
        description: error.message || 'Ocurrió un error inesperado.',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-32 w-full" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con botón volver */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="md:text-2xl font-bold">{wallet.name}</h2>
      </div>

      {/* Card de resumen */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-sm text-muted-foreground">Balance Total</p>
            <p className="text-2xl font-bold">{formatCurrency(wallet.balance_total)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Disponible (Suelto)</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(wallet.balance_available)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Intereses Generados (Total)
            </p>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(wallet.total_interest_generated || 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Botón crear / Form inline */}
      <div className="rounded-lg border bg-card p-4">
        {!isCreating ? (
          <Button
            onClick={() => setIsCreating(true)}
            variant="outline"
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Bolsillo
          </Button>
        ) : (
          <div className="flex gap-2">
            <Input
              placeholder="Nombre del bolsillo"
              value={newPocketName}
              onChange={(e) => setNewPocketName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreatePocket();
                if (e.key === 'Escape') {
                  setIsCreating(false);
                  setNewPocketName('');
                }
              }}
              disabled={createPocket.isPending}
              autoFocus
            />
            <Button
              variant="outline"
              onClick={() => {
                setIsCreating(false);
                setNewPocketName('');
              }}
              disabled={createPocket.isPending}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreatePocket}
              disabled={createPocket.isPending || !newPocketName.trim()}
            >
              Guardar
            </Button>
          </div>
        )}
      </div>

      {/* Lista de bolsillos */}
      {pockets && pockets.length > 0 ? (
        <div>
          <h3 className="mb-4 text-lg font-semibold">
            Bolsillos ({pockets.length})
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pockets.map((pocket) => (
              <PocketCard
                key={pocket.id}
                pocket={pocket}
                onEdit={() => setEditingPocket(pocket)}
                onDelete={() => setDeletingPocket(pocket)}
                onMoveTo={() => setMovingToPocket(pocket)}
                onMoveFrom={() => setMovingFromPocket(pocket)}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
          <div className="mb-4 rounded-full bg-muted p-3">
            <Plus className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">No tienes bolsillos</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Crea tu primer bolsillo para organizar tu dinero y generar intereses
          </p>
        </div>
      )}

      {/* Dialogs */}
      {editingPocket && (
        <EditPocketDialog
          pocket={editingPocket}
          open={!!editingPocket}
          onOpenChange={(open) => !open && setEditingPocket(null)}
        />
      )}

      {deletingPocket && (
        <DeletePocketDialog
          pocket={deletingPocket}
          open={!!deletingPocket}
          onOpenChange={(open) => !open && setDeletingPocket(null)}
        />
      )}

      {movingToPocket && (
        <MoveToPocketDialog
          pocket={movingToPocket}
          wallet={wallet}
          open={!!movingToPocket}
          onOpenChange={(open) => !open && setMovingToPocket(null)}
        />
      )}

      {movingFromPocket && (
        <MoveFromPocketDialog
          pocket={movingFromPocket}
          open={!!movingFromPocket}
          onOpenChange={(open) => !open && setMovingFromPocket(null)}
        />
      )}
    </div>
  );
};

export default PocketsView;