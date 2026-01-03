import BaseCard from './BaseCard';
import { BankAccount } from '@/types/database';

interface WalletCardProps {
  wallet: BankAccount;
  pocketsCount: number;
  onEdit: () => void;
  onDelete: () => void;
  onViewPockets: () => void;
}

const WalletCard: React.FC<WalletCardProps> = ({
  wallet,
  pocketsCount,
  onEdit,
  onDelete,
  onViewPockets,
}) => {
  // Generar color basado en el nombre (consistente)
  const generateColor = (name: string): string => {
    const colors = [
      '#ef4444', // red
      '#f59e0b', // amber
      '#10b981', // emerald
      '#3b82f6', // blue
      '#8b5cf6', // violet
      '#ec4899', // pink
      '#14b8a6', // teal
      '#f97316', // orange
    ];
    
    const hash = name.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <BaseCard
      type="wallet"
      name={wallet.name}
      balance={wallet.balance_total}
      color={generateColor(wallet.name)}
      interestRate={wallet.interest_rate}
      pocketsCount={pocketsCount}
      onEdit={onEdit}
      onDelete={onDelete}
      onViewPockets={onViewPockets}
    />
  );
};

export default WalletCard;