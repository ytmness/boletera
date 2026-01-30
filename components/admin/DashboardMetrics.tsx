"use client";

import { TrendingUp, DollarSign, Ticket, ShoppingCart } from "lucide-react";

interface MetricsProps {
  totalRevenue: number;
  totalTicketsSold: number;
  totalOrders: number;
  totalEvents: number;
}

export function DashboardMetrics({ totalRevenue, totalTicketsSold, totalOrders, totalEvents }: MetricsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  };

  const metrics = [
    {
      title: "Ingresos Totales",
      value: formatCurrency(totalRevenue),
      icon: DollarSign,
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Boletos Vendidos",
      value: totalTicketsSold.toLocaleString(),
      icon: Ticket,
      color: "from-blue-500 to-cyan-600",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Órdenes Completadas",
      value: totalOrders.toLocaleString(),
      icon: ShoppingCart,
      color: "from-purple-500 to-pink-600",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Eventos Activos",
      value: totalEvents.toLocaleString(),
      icon: TrendingUp,
      color: "from-orange-500 to-red-600",
      bgColor: "bg-orange-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <div
            key={metric.title}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{metric.value}</p>
              </div>
              <div className={`${metric.bgColor} p-3 rounded-lg`}>
                <Icon className={`w-6 h-6 bg-gradient-to-br ${metric.color} text-transparent bg-clip-text`} strokeWidth={2.5} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
