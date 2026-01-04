import { PieChart } from '@mui/x-charts/PieChart';
import { formatCurrency } from '@/lib/utils';

// Datos dummy - luego reemplazar con datos reales
const DUMMY_DATA = [
  { id: 1, label: 'Transporte', value: 850000, color: '#3b82f6' },
  { id: 2, label: 'Comida', value: 650000, color: '#ef4444' },
  { id: 3, label: 'Entretenimiento', value: 320000, color: '#8b5cf6' },
  { id: 4, label: 'Servicios', value: 420000, color: '#10b981' },
  { id: 5, label: 'Salud', value: 180000, color: '#f59e0b' },
];

const ExpensesByCategoryChart = () => {
  const total = DUMMY_DATA.reduce((sum, item) => sum + item.value, 0);

  const chartData = DUMMY_DATA.map(item => ({
    id: item.id,
    value: item.value,
    label: item.label,
    color: item.color,
  }));

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <h3 className="mb-6 text-lg font-semibold">Gastos por Categoría</h3>
      
      <div className="flex flex-col lg:flex-row gap-8 items-center">
        {/* Pie Chart */}
        <div className="shrink-0">
          <PieChart
            series={[
              {
                data: chartData,
                innerRadius: 30,
                outerRadius: 100,
                paddingAngle: 5,
                cornerRadius: 5,
                startAngle: -45,
                endAngle: 225,
                cx: 150,
                cy: 150,
              },
            ]}
            width={300}
            height={300}
            hideLegend
          />
        </div>

        {/* Legend con % y valores */}
        <div className="flex-1 w-full">
          <div className="space-y-3">
            {DUMMY_DATA.map((item) => {
              const percentage = ((item.value / total) * 100).toFixed(1);
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">{percentage}%</span>
                    <span className="font-semibold min-w-[120px] text-right">
                      {formatCurrency(item.value)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Total */}
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-lg">Total</span>
              <span className="font-bold text-lg">
                {formatCurrency(total)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpensesByCategoryChart;