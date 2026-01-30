"use client";

import { Calendar, MapPin, DollarSign, Ticket, TrendingUp } from "lucide-react";

interface EventMetric {
  id: string;
  name: string;
  artist: string;
  eventDate: Date;
  venue: string;
  totalCapacity: number;
  totalSold: number;
  totalAvailable: number;
  percentageSold: number;
  totalRevenue: number;
  totalOrders: number;
}

interface EventMetricsTableProps {
  events: EventMetric[];
}

export function EventMetricsTable({ events }: EventMetricsTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-400 bg-green-500/20 border-green-500/30';
    if (percentage >= 50) return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
    return 'text-red-400 bg-red-500/20 border-red-500/30';
  };

  return (
    <div className="bg-regia-black rounded-xl border border-regia-gold-old/30">
      <div className="p-6 border-b border-regia-gold-old/20">
        <h2 className="regia-title-secondary text-xl">Métricas por Evento</h2>
        <p className="regia-text-muted text-sm mt-1">Estado de ventas de cada evento activo</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-regia-gold-old/5">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-regia-gold-bright uppercase tracking-wider">
                Evento
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-regia-gold-bright uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-regia-gold-bright uppercase tracking-wider">
                Vendidos
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-regia-gold-bright uppercase tracking-wider">
                % Vendido
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-regia-gold-bright uppercase tracking-wider">
                Ingresos
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-regia-gold-bright uppercase tracking-wider">
                Órdenes
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-regia-gold-old/10">
            {events.map((event) => (
              <tr key={event.id} className="hover:bg-regia-gold-old/5 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <Calendar className="w-10 h-10 text-regia-gold-bright bg-regia-gold-bright/10 p-2 rounded-lg" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-regia-cream">{event.name}</div>
                      <div className="text-sm text-regia-cream/70">{event.artist}</div>
                      <div className="flex items-center text-xs text-regia-cream/50 mt-1">
                        <MapPin className="w-3 h-3 mr-1" />
                        {event.venue}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-regia-cream">
                  {formatDate(event.eventDate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="text-sm font-medium text-regia-cream">
                    {event.totalSold.toLocaleString()} / {event.totalCapacity.toLocaleString()}
                  </div>
                  <div className="text-xs text-regia-cream/60">
                    {event.totalAvailable.toLocaleString()} disponibles
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPercentageColor(event.percentageSold)}`}>
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {event.percentageSold.toFixed(1)}%
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="text-sm font-semibold text-green-400">
                    {formatCurrency(event.totalRevenue)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-regia-cream">
                  {event.totalOrders}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {events.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-regia-gold-old" />
          <h3 className="mt-2 text-sm font-medium text-regia-cream">No hay eventos activos</h3>
          <p className="mt-1 text-sm text-regia-cream/70">Crea un evento para comenzar a vender boletos.</p>
        </div>
      )}
    </div>
  );
}
