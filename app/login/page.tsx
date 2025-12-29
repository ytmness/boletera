"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al iniciar sesión");
      }

      toast.success("¡Bienvenido!");
      
      // Redirigir según el rol
      if (data.user.role === "ADMIN") {
        router.push("/admin");
      } else if (data.user.role === "VENDEDOR") {
        router.push("/vendedor");
      } else if (data.user.role === "SUPERVISOR") {
        router.push("/supervisor");
      } else {
        router.push("/accesos");
      }
      
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen regia-gradient flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="regia-card p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Grupo Regia
            </h1>
            <p className="text-white/70">Inicia sesión en tu cuenta</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-white mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-regia-gold"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-white mb-2"
              >
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-regia-gold"
                placeholder="••••••••"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full regia-button-primary"
            >
              {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-white/60 text-sm">
              ¿Olvidaste tu contraseña?{" "}
              <a href="#" className="text-regia-gold hover:underline">
                Contacta al administrador
              </a>
            </p>
          </div>
        </div>

        {/* Info de demo */}
        <div className="mt-8 regia-card p-4">
          <p className="text-white/70 text-sm text-center mb-2">
            <strong className="text-regia-gold">Demo:</strong> Usuarios de
            prueba
          </p>
          <div className="text-xs text-white/60 space-y-1">
            <p>
              <strong>Admin:</strong> admin@grupoRegia.com / admin123
            </p>
            <p>
              <strong>Vendedor:</strong> vendedor@grupoRegia.com / vendedor123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

