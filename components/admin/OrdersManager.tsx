"use client";

import { useState } from "react";
import { Search, Eye, EyeOff, DollarSign, Calendar, Mail, Phone, Ticket, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface OrderTicket {
  id: string;
  ticketNumber: string;
  isQrVisible: boolean;
  status: string;
}

interface Order {
  id: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string | null;
  event: {
    id: string;
    name: string;
    artist: string;
    eventDate: Date;
  };
  total: number;
  paymentStatus: string;
  paymentReference: string | null;
  createdAt: Date;
  paidAt: Date | null;
  tickets: OrderTicket[];
  ticketCount: number;
  visibleQrCount: number;
}

interface OrdersManagerProps {
  initialOrders: Order[];
  events: Array<{ id: string; name: string }>;
}

export function OrdersManager({ initialOrders, events }: OrdersManagerProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [selectedEvent, setSelectedEvent] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      PAID: 'bg-green-500/20 text-green-400 border-green-500/30',
      PENDING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      FAILED: 'bg-red-500/20 text-red-400 border-red-500/30',
      CANCELED: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      EXPIRED: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    };
    const labels = {
      PAID: '✅ Pagado',
      PENDING: '⏳ Pendiente',
      FAILED: '❌ Fallido',
      CANCELED: '🚫 Cancelado',
      EXPIRED: '⏱️ Expirado',
    };
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const handleToggleAllQRs = async (orderId: string, isVisible: boolean) => {
    setIsUpdating(true);
    try {
      const response = await fetch('/api/admin/tickets/visibility', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ saleId: orderId, isVisible }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar');
      }

      setOrders(prev => prev.map(order => {
        if (order.id === orderId) {
          return {
            ...order,
            tickets: order.tickets.map(t => ({ ...t, isQrVisible: isVisible })),
            visibleQrCount: isVisible ? order.ticketCount : 0,
          };
        }
        return order;
      }));

      toast.success(isVisible ? '✅ QRs mostrados exitosamente' : '🔒 QRs ocultados exitosamente');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleSingleQR = async (ticketId: string, isVisible: boolean, orderId: string) => {
    setIsUpdating(true);
    try {
      const response = await fetch('/api/admin/tickets/visibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketIds: [ticketId], isVisible }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar');
      }

      setOrders(prev => prev.map(order => {
        if (order.id === orderId) {
          const updatedTickets = order.tickets.map(t => 
            t.id === ticketId ? { ...t, isQrVisible: isVisible } : t
          );
          return {
            ...order,
            tickets: updatedTickets,
            visibleQrCount: updatedTickets.filter(t => t.isQrVisible).length,
          };
        }
        return order;
      }));

      toast.success('QR actualizado');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (selectedEvent !== 'all' && order.event.id !== selectedEvent) return false;
    if (selectedStatus !== 'all' && order.paymentStatus !== selectedStatus) return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        order.buyerName.toLowerCase().includes(search) ||
        order.buyerEmail.toLowerCase().includes(search) ||
        order.id.toLowerCase().includes(search)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Alerta informativa */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 flex items-start space-x-3">
        <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm text-blue-300 font-medium">
            ℹ️ Los botones de control de QR solo aparecen en órdenes PAGADAS (estado ✅ Pagado)
          </p>
          <p className="text-xs text-blue-400/80 mt-1">
            Las órdenes en estado ⏳ Pendiente no pueden mostrar QR hasta que el pago se confirme.
            Usa el botón "Limpiar Expiradas" en el header para eliminar órdenes pendientes viejas.
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-regia-black rounded-xl border border-regia-gold-old/30 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-regia-cream/50 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nombre, email o ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-regia-cream/5 border border-regia-gold-old/30 rounded-lg text-regia-cream placeholder-regia-cream/50 focus:outline-none focus:border-regia-gold-bright"
            />
          </div>

          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            className="px-4 py-2 bg-regia-cream/5 border border-regia-gold-old/30 rounded-lg text-regia-cream focus:outline-none focus:border-regia-gold-bright"
          >
            <option value="all">Todos los eventos</option>
            {events.map(event => (
              <option key={event.id} value={event.id}>{event.name}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 bg-regia-cream/5 border border-regia-gold-old/30 rounded-lg text-regia-cream focus:outline-none focus:border-regia-gold-bright"
          >
            <option value="all">Todos los estados</option>
            <option value="PAID">✅ Pagado</option>
            <option value="PENDING">⏳ Pendiente</option>
            <option value="FAILED">❌ Fallido</option>
            <option value="CANCELED">🚫 Cancelado</option>
            <option value="EXPIRED">⏱️ Expirado</option>
          </select>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-regia-cream/70">
          <div>
            Mostrando <span className="font-semibold text-regia-gold-bright">{filteredOrders.length}</span> de <span className="font-semibold text-regia-gold-bright">{orders.length}</span> órdenes
          </div>
        </div>
      </div>

      {/* Lista de órdenes */}
      <div className="space-y-4">
        {filteredOrders.map(order => (
          <div key={order.id} className="bg-regia-black rounded-xl border border-regia-gold-old/30 overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="regia-title-secondary text-lg">{order.buyerName}</h3>
                    {getStatusBadge(order.paymentStatus)}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                    <div className="flex items-center text-regia-cream/80">
                      <Mail className="w-4 h-4 mr-2 text-regia-gold-old" />
                      {order.buyerEmail}
                    </div>
                    {order.buyerPhone && (
                      <div className="flex items-center text-regia-cream/80">
                        <Phone className="w-4 h-4 mr-2 text-regia-gold-old" />
                        {order.buyerPhone}
                      </div>
                    )}
                    <div className="flex items-center text-regia-cream/80">
                      <Calendar className="w-4 h-4 mr-2 text-regia-gold-old" />
                      {formatDate(order.createdAt)}
                    </div>
                    <div className="flex items-center text-green-400 font-semibold">
                      <DollarSign className="w-4 h-4 mr-1" />
                      {formatCurrency(order.total)}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center space-x-4">
                    <div className="text-sm">
                      <span className="font-medium text-regia-cream">Evento:</span>
                      <span className="ml-2 text-regia-cream/90">{order.event.name}</span>
                      <span className="ml-1 text-regia-cream/60">• {order.event.artist}</span>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center space-x-4 text-sm">
                    <div className="flex items-center">
                      <Ticket className="w-4 h-4 mr-1 text-regia-gold-bright" />
                      <span className="font-medium text-regia-cream">{order.ticketCount} boletos</span>
                    </div>
                    <div className="flex items-center">
                      {order.visibleQrCount > 0 ? (
                        <>
                          <Eye className="w-4 h-4 mr-1 text-green-500" />
                          <span className="text-green-400 font-medium">
                            {order.visibleQrCount} QR{order.visibleQrCount !== 1 ? 's' : ''} visible{order.visibleQrCount !== 1 ? 's' : ''}
                          </span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-4 h-4 mr-1 text-gray-500" />
                          <span className="text-gray-400">Sin QR visible</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Botones de control - SOLO para PAID */}
                {order.paymentStatus === 'PAID' && (
                  <div className="flex flex-col space-y-2 ml-4">
                    <button
                      onClick={() => handleToggleAllQRs(order.id, true)}
                      disabled={isUpdating || order.visibleQrCount === order.ticketCount}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium whitespace-nowrap"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Mostrar Todos
                    </button>
                    <button
                      onClick={() => handleToggleAllQRs(order.id, false)}
                      disabled={isUpdating || order.visibleQrCount === 0}
                      className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium whitespace-nowrap"
                    >
                      <EyeOff className="w-4 h-4 mr-2" />
                      Ocultar Todos
                    </button>
                    <button
                      onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                      className="flex items-center px-4 py-2 bg-regia-gold-bright text-regia-black rounded-lg hover:bg-regia-gold-old text-sm font-medium whitespace-nowrap"
                    >
                      <Ticket className="w-4 h-4 mr-2" />
                      Ver Tickets
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Detalles expandidos - SOLO si PAID */}
            {expandedOrder === order.id && order.paymentStatus === 'PAID' && (
              <div className="border-t border-regia-gold-old/20 bg-regia-gold-old/5 p-6">
                <h4 className="text-sm font-semibold text-regia-cream mb-4">
                  Tickets de esta orden ({order.tickets.length})
                </h4>
                <div className="space-y-2">
                  {order.tickets.map(ticket => (
                    <div
                      key={ticket.id}
                      className="flex items-center justify-between bg-regia-black/50 p-4 rounded-lg border border-regia-gold-old/20"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${ticket.isQrVisible ? 'bg-green-500/20' : 'bg-gray-500/20'}`}>
                          {ticket.isQrVisible ? (
                            <Eye className="w-5 h-5 text-green-400" />
                          ) : (
                            <EyeOff className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <div className="font-mono text-sm font-semibold text-regia-cream">
                            #{ticket.ticketNumber}
                          </div>
                          <div className="text-xs text-regia-cream/60">
                            Estado: {ticket.status}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleToggleSingleQR(ticket.id, !ticket.isQrVisible, order.id)}
                        disabled={isUpdating}
                        className={`px-4 py-2 rounded-lg text-sm font-medium ${
                          ticket.isQrVisible
                            ? 'bg-gray-600 text-white hover:bg-gray-700'
                            : 'bg-green-600 text-white hover:bg-green-700'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {ticket.isQrVisible ? 'Ocultar QR' : 'Mostrar QR'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="bg-regia-black rounded-xl border border-regia-gold-old/30 p-12 text-center">
          <Ticket className="mx-auto h-12 w-12 text-regia-gold-old" />
          <h3 className="mt-2 text-sm font-medium text-regia-cream">No se encontraron órdenes</h3>
          <p className="mt-1 text-sm text-regia-cream/70">
            {searchTerm || selectedEvent !== 'all' || selectedStatus !== 'all'
              ? 'Intenta ajustar los filtros de búsqueda'
              : 'Las órdenes aparecerán aquí cuando los clientes realicen compras'}
          </p>
        </div>
      )}
    </div>
  );
}
