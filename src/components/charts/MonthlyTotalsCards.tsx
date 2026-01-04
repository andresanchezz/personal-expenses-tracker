import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

// Datos dummy
const DUMMY_DATA = {
  income: 3500000,
  expenses: 2420000,
  balance: 1080000,
};

const MonthlyTotalsCards = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Resumen del Mes</h3>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Ingresos */}
        <div className="rounded-lg border bg-gradient-to-br from-green-50 to-emerald-50 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Total Ingresos</p>
              <p className="mt-2 text-3xl font-bold text-green-700">
                {formatCurrency(DUMMY_DATA.income)}
              </p>
            </div>
            <div className="rounded-full bg-green-100 p-3">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <p className="mt-4 text-sm text-green-600">
            +12% vs mes anterior
          </p>
        </div>

        {/* Egresos */}
        <div className="rounded-lg border bg-gradient-to-br from-red-50 to-rose-50 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Total Egresos</p>
              <p className="mt-2 text-3xl font-bold text-red-700">
                {formatCurrency(DUMMY_DATA.expenses)}
              </p>
            </div>
            <div className="rounded-full bg-red-100 p-3">
              <TrendingDown className="h-5 w-5 text-red-600" />
            </div>
          </div>
          <p className="mt-4 text-sm text-red-600">
            -5% vs mes anterior
          </p>
        </div>

        {/* Balance */}
        <div className="rounded-lg border bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Balance Neto</p>
              <p className="mt-2 text-3xl font-bold text-blue-700">
                {formatCurrency(DUMMY_DATA.balance)}
              </p>
            </div>
            <div className="rounded-full bg-blue-100 p-3">
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <p className="mt-4 text-sm text-blue-600">
            {((DUMMY_DATA.balance / DUMMY_DATA.income) * 100).toFixed(0)}% de ahorro
          </p>
        </div>
      </div>

      {/* Barra de progreso de gastos */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Gastos del mes</span>
          <span className="text-sm text-muted-foreground">
            {((DUMMY_DATA.expenses / DUMMY_DATA.income) * 100).toFixed(0)}% del ingreso
          </span>
        </div>
        <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-green-500 via-yellow-500 to-red-500 transition-all"
            style={{ width: `${(DUMMY_DATA.expenses / DUMMY_DATA.income) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default MonthlyTotalsCards;