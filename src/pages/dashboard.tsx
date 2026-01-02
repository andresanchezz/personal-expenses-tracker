import { AuthGuard } from '@/components/guards/AuthGuard';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';


export default function DashboardPage() {

  const { signOut } = useAuth()

  return (
    <AuthGuard>
      <div className='w-full md:w-7xl m-auto
      px-2 py-4 md:p-6'>
        <Button onClick={signOut} className='float-end'>Log out</Button>
        <h1>Dashboard</h1>
      </div>
    </AuthGuard>
  );
}
