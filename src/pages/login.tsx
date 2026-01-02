import { GuestGuard } from "@/components/guards/GuestGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { FormEvent, useState } from "react";

export default function LoginPage() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { isLoading, signIn } = useAuth();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            await signIn(email, password)
        } catch (err: any) {
            setError(err.message ?? 'Error al iniciar sesión');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <GuestGuard>
            <div className="m-auto px-2 flex flex-col justify-center items-center h-screen">
                <form
                    className="space-y-4 w-full md:w-lg"
                    onSubmit={handleSubmit}
                >
                    <legend className="text-center text-xl">Expense Tracker</legend>

                    <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Correo"
                    />

                    <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Contraseña"
                    />

                    {error && (
                        <p className="text-sm text-destructive">
                            {error}
                        </p>
                    )}

                    <Button
                        type="submit"
                        variant="secondary"
                        className="w-full"
                        disabled={isLoading}
                    >
                        {isSubmitting ? 'Entrando...' : 'Ingresar'}
                    </Button>
                </form>
            </div>
        </GuestGuard>
    );
}
