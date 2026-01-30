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
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const metrics = [
    {
      title: "Ingresos Totales",
      value: formatCurrency(totalRevenue),
      icon: DollarSign,
      iconColor: "text-green-500",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/30",
    },
    {
      title: "Boletos Vendidos",
      value: totalTicketsSold.toLocaleString(),
      icon: Ticket,
      iconColor: "text-regia-gold-bright",
      bgColor: "bg-regia-gold-bright/10",
      borderColor: "border-regia-gold-bright/30",
    },
    {
      title: "Órdenes Completadas",
      value: totalOrders.toLocaleString(),
      icon: ShoppingCart,
      iconColor: "text-blue-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/30",
    },
    {
      title: "Eventos Activos",
      value: totalEvents.toLocaleString(),
      icon: TrendingUp,
      iconColor: "text-regia-gold-old",
      bgColor: "bg-regia-gold-old/10",
      borderColor: "border-regia-gold-old/30",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <div
            key={metric.title}
            className={`bg-regia-black rounded-xl border ${metric.borderColor} p-6 hover:border-regia-gold-bright/50 transition-all`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="regia-text-muted text-sm">{metric.title}</p>
                <p className="text-3xl font-bold text-regia-cream mt-2">{metric.value}</p>
              </div>
              <div className={`${metric.bgColor} p-4 rounded-lg`}>
                <Icon className={`w-8 h-8 ${metric.iconColor}`} strokeWidth={2} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
