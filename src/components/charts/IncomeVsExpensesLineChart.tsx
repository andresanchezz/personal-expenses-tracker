import { LineChart } from '@mui/x-charts/LineChart';

// Datos dummy - últimos 6 meses
const DUMMY_DATA = {
  months: ['Ago', 'Sep', 'Oct', 'Nov', 'Dic', 'Ene', 'X', 'W', 'Ot', 'ov', 'ic', 'Ee'],
  income: [4200000, 3500000, 2200000, 4100000, 3800000, 3500000],
  expenses: [20000, 2800000, 200000, 3100000, 2900000, 5420000],
};

const IncomeVsExpensesLineChart = () => {
  return (
    <div className=" overflow-auto rounded-lg border bg-card p-6 shadow-sm">
      <h3 className="mb-6 text-lg font-semibold">Ingresos vs Egresos (Últimos 6 meses)</h3>

      <div className='overflow-auto'>
        <LineChart
          grid={{ vertical: true, horizontal: true }}
          xAxis={[
            {
              scaleType: 'point',
              data: DUMMY_DATA.months,
            },
          ]}
          series={[
            {
              label: 'Ingresos',
              data: DUMMY_DATA.income,
              color: '#10b981',
              curve: 'natural',
            },
            {
              label: 'Egresos',
              data: DUMMY_DATA.expenses,
              color: '#ef4444',
              curve: 'natural',
            },
          ]}
          height={400}
          width={1120}
          sx={{
            '& .MuiLineElement-root': {
              strokeWidth: 1,
            },
            '& .MuiMarkElement-root': {
              scale: '0.8',
              strokeWidth: 1,
            },
          }}
        />
      </div>

      {/* Stats debajo del gráfico */}
      <div className="mt-6 md:grid  md:space-y-0 space-y-4 grid-cols-3 gap-4">
        <div className="rounded-lg border p-4 text-center">
          <p className="text-sm text-muted-foreground">Ingreso Promedio</p>
          <p className="text-2xl font-bold text-green-600">
            ${(DUMMY_DATA.income.reduce((a, b) => a + b, 0) / DUMMY_DATA.income.length / 1000000).toFixed(1)}M
          </p>
        </div>
        <div className="rounded-lg border p-4 text-center">
          <p className="text-sm text-muted-foreground">Egreso Promedio</p>
          <p className="text-2xl font-bold text-red-600">
            ${(DUMMY_DATA.expenses.reduce((a, b) => a + b, 0) / DUMMY_DATA.expenses.length / 1000000).toFixed(1)}M
          </p>
        </div>
        <div className="rounded-lg border p-4 text-center">
          <p className="text-sm text-muted-foreground">Balance Neto</p>
          <p className="text-2xl font-bold text-blue-600">
            ${((DUMMY_DATA.income.reduce((a, b) => a + b, 0) - DUMMY_DATA.expenses.reduce((a, b) => a + b, 0)) / 1000000).toFixed(1)}M
          </p>
        </div>
      </div>
    </div>
  );
};

export default IncomeVsExpensesLineChart;