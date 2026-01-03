import { Pen, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";

type CardType = 'wallet' | 'credit_card';

interface BaseCardProps {
  type: CardType;
  name: string;
  balance: number;
  color?: string;
  onEdit: () => void;
  onDelete: () => void;
  
  // Wallet specific
  interestRate?: number;
  pocketsCount?: number;
  onViewPockets?: () => void;
  
  // Credit card specific
  cashbackPercentage?: number;
  totalCashbackGenerated?: number;
}

const BaseCard: React.FC<BaseCardProps> = ({
  type,
  name,
  balance,
  color = "#ef4444",
  onEdit,
  onDelete,
  interestRate,
  pocketsCount,
  onViewPockets,
  cashbackPercentage,
  totalCashbackGenerated,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const isWallet = type === 'wallet';

  return (
    <div
      className="relative rounded-xl p-6 shadow-lg transition-transform hover:scale-105"
      style={{ backgroundColor: color }}
    >
      {/* Header con nombre y acciones */}
      <div className="mb-4 flex items-start justify-between">
        <h3 className="text-lg font-semibold text-white">{name}</h3>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white hover:bg-white/20"
            onClick={onEdit}
            aria-label="Editar"
          >
            <Pen className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white hover:bg-white/20"
            onClick={onDelete}
            aria-label="Eliminar"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Balance principal */}
      <div className="mb-4">
        <p className="text-3xl font-bold text-white">{formatCurrency(balance)}</p>
      </div>

      {/* Info específica por tipo */}
      <div className="space-y-1 text-sm text-white/90">
        {isWallet ? (
          // Wallet info
          <>
            {interestRate !== undefined && interestRate > 0 ? 
              <p>{interestRate}% E.A</p> : <p>No genera interés</p>
            }
            {pocketsCount !== undefined && (
              <p>{pocketsCount} {pocketsCount === 1 ? 'Bolsillo' : 'Bolsillos'}</p>
            )}
          </>
        ) : (
          // Credit card info
          <>
            {cashbackPercentage !== undefined && cashbackPercentage > 0 && (
              <p>{cashbackPercentage}% Cashback</p>
            )}
            {totalCashbackGenerated !== undefined && totalCashbackGenerated > 0 && (
              <p>Cashback total: {formatCurrency(totalCashbackGenerated)}</p>
            )}
          </>
        )}
      </div>

      {/* Botón Ver Bolsillos (solo para wallets) */}
      {isWallet && onViewPockets && (
        <Button
          variant="secondary"
          size="sm"
          className="mt-4 w-full bg-white/20 text-white hover:bg-white/30"
          onClick={onViewPockets}
        >
          Ver bolsillos
        </Button>
      )}
    </div>
  );
};

export default BaseCard;