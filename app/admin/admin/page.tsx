"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, LogOut, Calendar, Ticket, Users } from "lucide-react";
import { EventsTable } from "@/components/admin/EventsTable";
import { CreateEventModal } from "@/components/admin/CreateEventModal";
import { toast } from "sonner";

interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/session");
      const data = await response.json();

      if (!data.user || data.user.role !== "ADMIN") {
        router.push("/login");
        return;
      }

      setUser(data.user);
    } catch (error) {
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      toast.success("Sesión cerrada");
      router.push("/login");
    } catch (error) {
      toast.error("Error al cerrar sesión");
    }
  };

  const handleEventCreated = () => {
    setShowCreateModal(false);
    setRefreshKey((prev) => prev + 1);
    toast.success("Evento creado exitosamente");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen regia-gradient flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen regia-gradient">
      {/* Header */}
      <header className="bg-black/20 border-b border-regia-gold/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-regia-gold rounded-lg flex items-center justify-center">
                <span className="text-regia-dark font-bold text-xl">GR</span>
              </div>
              <div>
                <h1 className="text-white font-bold text-lg">GRUPO REGIA</h1>
                <p className="text-regia-gold text-xs">Panel de Administración</p>
              </div>
            </div>

            {/* User Info */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-white font-medium">{user?.name}</p>
                <p className="text-white/60 text-sm">{user?.role}</p>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="border-regia-gold/50 text-white hover:bg-regia-gold hover:text-regia-dark"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Salir
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="regia-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm mb-1">Total Eventos</p>
                <p className="text-3xl font-bold text-white">12</p>
              </div>
              <div className="w-12 h-12 bg-regia-gold/20 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-regia-gold" />
              </div>
            </div>
          </div>

          <div className="regia-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm mb-1">Boletos Vendidos</p>
                <p className="text-3xl font-bold text-white">2,450</p>
              </div>
              <div className="w-12 h-12 bg-regia-gold/20 rounded-lg flex items-center justify-center">
                <Ticket className="w-6 h-6 text-regia-gold" />
              </div>
            </div>
          </div>

          <div className="regia-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm mb-1">Usuarios Activos</p>
                <p className="text-3xl font-bold text-white">8</p>
              </div>
              <div className="w-12 h-12 bg-regia-gold/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-regia-gold" />
              </div>
            </div>
          </div>
        </div>

        {/* Events Section */}
        <div className="regia-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Gestión de Eventos</h2>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="regia-button-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Crear Evento
            </Button>
          </div>

          <EventsTable key={refreshKey} />
        </div>
      </main>

      {/* Create Event Modal */}
      {showCreateModal && (
        <CreateEventModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleEventCreated}
        />
      )}
    </div>
  );
}
