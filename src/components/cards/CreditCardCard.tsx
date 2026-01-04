import BaseCard from '@/components/cards/BaseCard';
import { CreditCard } from '@/types/database';

interface CreditCardCardProps {
  card: CreditCard;
  onEdit: () => void;
  onDelete: () => void;
  onPay: () => void;
  onTransferCashback: () => void;
}

const CreditCardCard: React.FC<CreditCardCardProps> = ({
  card,
  onEdit,
  onDelete,
  onPay,
  onTransferCashback,
}) => {
  // Generar color basado en el nombre
  const generateColor = (name: string): string => {
    const colors = [
      '#6366f1', // indigo
      '#8b5cf6', // violet
      '#d946ef', // fuchsia
      '#ec4899', // pink
      '#f43f5e', // rose
      '#f97316', // orange
      '#eab308', // yellow
      '#84cc16', // lime
    ];

    const hash = name.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);

    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <BaseCard
      type="credit_card"
      name={card.name}
      balance={card.current_debt}
      color={generateColor(card.name)}
      cashbackPercentage={card.cashback_percentage}
      totalCashbackGenerated={card.total_cashback_generated}
      onEdit={onEdit}
      onDelete={onDelete}
      onPay={onPay}
      onTransferCashback={card.pending_cashback > 0 ? onTransferCashback : undefined}
    />
  );
};

export default CreditCardCard;