import { useRouter } from 'next/router';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import IncomeVsExpensesLineChart from '@/components/charts/IncomeVsExpensesLineChart';
import MonthlyTotalsCards from '@/components/charts/MonthlyTotalsCards';
import ExpensesByCategoryChart from '@/components/charts/ExpensesByCategoryChart';
import { AuthGuard } from '@/components/guards/AuthGuard';



const AnalyticsPage = () => {

  const router = useRouter();

  const goDashboard = () => {
    router.replace('/dashboard')
  }

  return (
    <AuthGuard>
      <div className="w-full md:max-w-7xl m-auto px-2 py-4 md:p-6">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={goDashboard}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5" />
              <h1 className="md:text-3xl font-bold">Análisis Financiero</h1>
            </div>
          </div>

          {/* Filtros globales */}
          <div className="flex gap-2 ">
            <Select defaultValue="current-month">
              <SelectTrigger className="md:w-45 w-36">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current-month">Mes Actual</SelectItem>
                <SelectItem value="last-month">Mes Anterior</SelectItem>
                <SelectItem value="last-3-months">Últimos 3 meses</SelectItem>
                <SelectItem value="last-6-months">Últimos 6 meses</SelectItem>
                <SelectItem value="current-year">Año Actual</SelectItem>
                <SelectItem value="all-time">Todo el tiempo</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="all">
              <SelectTrigger className="md:w-45 w-36">
                <SelectValue placeholder="Cuenta/Tarjeta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="accounts">Solo Cuentas</SelectItem>
                <SelectItem value="cards">Solo Tarjetas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="space-y-6">
          {/* Resumen del Mes */}
          <MonthlyTotalsCards />

          {/* Line Chart - Tendencias */}
          <IncomeVsExpensesLineChart />

          {/* Pie Chart - Gastos por Categoría */}
          <ExpensesByCategoryChart />
        </div>
      </div>
    </AuthGuard>
  );
};

export default AnalyticsPage;