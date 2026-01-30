"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, BarChart3, ShoppingCart, Plus } from "lucide-react";
import { toast } from "sonner";
import { DashboardMetrics } from "@/components/admin/DashboardMetrics";
import { EventMetricsTable } from "@/components/admin/EventMetricsTable";
import { OrdersManager } from "@/components/admin/OrdersManager";
import { CreateEventModal } from "@/components/admin/CreateEventModal";

interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

type TabType = 'dashboard' | 'orders' | 'events';

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Dashboard data
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [ordersData, setOrdersData] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  useEffect(() => {
    if (user && activeTab === 'orders' && ordersData.length === 0) {
      loadOrders();
    }
  }, [activeTab, user]);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/session");
      const data = await response.json();

      if (!data.success || !data.data?.user || data.data.user.role !== "ADMIN") {
        router.push("/login");
        return;
      }

      setUser(data.data.user);
    } catch (error) {
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  };

  const loadDashboardData = async () => {
    setIsLoadingData(true);
    try {
      const response = await fetch("/api/admin/dashboard");
      const data = await response.json();

      if (data.success) {
        setDashboardData(data.data);
      } else {
        toast.error("Error al cargar dashboard");
      }
    } catch (error) {
      toast.error("Error al cargar datos");
    } finally {
      setIsLoadingData(false);
    }
  };

  const loadOrders = async () => {
    setIsLoadingData(true);
    try {
      const response = await fetch("/api/admin/orders");
      const data = await response.json();

      if (data.success) {
        setOrdersData(data.data);
      } else {
        toast.error("Error al cargar órdenes");
      }
    } catch (error) {
      toast.error("Error al cargar órdenes");
    } finally {
      setIsLoadingData(false);
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
    loadDashboardData();
    toast.success("Evento creado exitosamente");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard' as TabType, name: 'Dashboard', icon: BarChart3 },
    { id: 'orders' as TabType, name: 'Órdenes', icon: ShoppingCart },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
              <p className="text-sm text-gray-600 mt-1">Bienvenido, {user?.name}</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push("/")}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Ver Sitio
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-1 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoadingData && !dashboardData ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando datos...</p>
          </div>
        ) : (
          <>
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && dashboardData && (
              <div className="space-y-8">
                {/* Métricas principales */}
                <DashboardMetrics
                  totalRevenue={dashboardData.overview.totalRevenue}
                  totalTicketsSold={dashboardData.overview.totalTicketsSold}
                  totalOrders={dashboardData.overview.totalOrders}
                  totalEvents={dashboardData.overview.totalEvents}
                />

                {/* Botón para crear evento */}
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900">Eventos Activos</h2>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Crear Evento
                  </button>
                </div>

                {/* Tabla de métricas por evento */}
                <EventMetricsTable events={dashboardData.eventMetrics} />
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Gestión de Órdenes</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Controla qué boletos se muestran a los clientes
                  </p>
                </div>
                
                {ordersData.length > 0 && dashboardData ? (
                  <OrdersManager
                    initialOrders={ordersData}
                    events={dashboardData.eventMetrics.map((e: any) => ({
                      id: e.id,
                      name: e.name,
                    }))}
                  />
                ) : (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No hay órdenes</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Las órdenes aparecerán aquí cuando los clientes realicen compras
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Create Event Modal */}
      {showCreateModal && (
        <CreateEventModal
          onClose={() => setShowCreateModal(false)}
          onEventCreated={handleEventCreated}
        />
      )}
    </div>
  );
}
