"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Loader2, XCircle, Ticket, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

// Hacer la página dinámica para evitar prerenderizado
export const dynamic = 'force-dynamic';

function CheckoutSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const saleId = searchParams.get("saleId");

  const [sale, setSale] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pollingCount, setPollingCount] = useState(0);
  const maxPollingAttempts = 30; // 30 intentos = ~1 minuto (cada 2 segundos)

  useEffect(() => {
    if (!saleId) {
      toast.error("No se encontró información de la venta");
      router.push("/");
      return;
    }

    // Polling para verificar el estado del pago
    const pollSaleStatus = async () => {
      try {
        const response = await fetch(`/api/sales/${saleId}`);
        const data = await response.json();

        if (data.success && data.data) {
          setSale(data.data);

          // Si el pago está confirmado, detener polling
          if (data.data.paymentStatus === "PAID" || data.data.status === "COMPLETED") {
            setIsLoading(false);
            toast.success("¡Pago confirmado! Tus boletos están listos.");
            return;
          }

          // Si falló o canceló, detener polling
          if (
            data.data.paymentStatus === "FAILED" ||
            data.data.paymentStatus === "CANCELED" ||
            data.data.status === "CANCELLED"
          ) {
            setIsLoading(false);
            return;
          }

          // Si expiró, detener polling
          if (data.data.isExpired) {
            setIsLoading(false);
            toast.error("La reserva ha expirado");
            return;
          }

          // Continuar polling si aún está pendiente
          if (pollingCount < maxPollingAttempts) {
            setPollingCount((prev) => prev + 1);
            setTimeout(pollSaleStatus, 2000); // Poll cada 2 segundos
          } else {
            setIsLoading(false);
            toast.warning("El pago está tomando más tiempo de lo esperado. Te notificaremos cuando se confirme.");
          }
        }
      } catch (error) {
        console.error("Error polling sale status:", error);
        setIsLoading(false);
      }
    };

    pollSaleStatus();
  }, [saleId, pollingCount, router]);

  if (!saleId) {
    return null;
  }

  if (isLoading && !sale) {
    return (
      <div className="min-h-screen regia-bg-main flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <Loader2 className="w-16 h-16 text-regia-gold-bright animate-spin mx-auto mb-4" />
          <h1 className="text-2xl font-bold regia-text-title mb-2">
            Procesando tu pago...
          </h1>
          <p className="regia-text-body">
            Estamos verificando el estado de tu pago. Por favor espera unos momentos.
          </p>
        </div>
      </div>
    );
  }

  if (!sale) {
    return (
      <div className="min-h-screen regia-bg-main flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold regia-text-title mb-2">
            Venta no encontrada
          </h1>
          <p className="regia-text-body mb-6">
            No pudimos encontrar la información de tu venta.
          </p>
          <Link href="/">
            <Button>Volver al inicio</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Pago confirmado
  if (sale.paymentStatus === "PAID" || sale.status === "COMPLETED") {
    return (
      <div className="min-h-screen regia-bg-main flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 text-center">
            <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold regia-text-title mb-4">
              ¡Pago confirmado!
            </h1>
            <p className="regia-text-body mb-6">
              Tu pago ha sido procesado exitosamente. Tus boletos están listos.
            </p>

            <div className="bg-white/5 rounded-lg p-6 mb-6 text-left">
              <h2 className="text-xl font-semibold regia-text-title mb-4">
                Detalles de tu compra
              </h2>
              <div className="space-y-2 regia-text-body">
                <p>
                  <span className="font-semibold">Evento:</span> {sale.event?.name}
                </p>
                <p>
                  <span className="font-semibold">Artista:</span> {sale.event?.artist}
                </p>
                <p>
                  <span className="font-semibold">Fecha:</span>{" "}
                  {sale.event?.eventDate
                    ? new Date(sale.event.eventDate).toLocaleDateString("es-MX", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "N/A"}
                </p>
                <p>
                  <span className="font-semibold">Total:</span>{" "}
                  ${sale.total?.toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN
                </p>
                <p>
                  <span className="font-semibold">Boletos:</span> {sale.tickets?.length || 0}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/mis-boletos">
                <Button className="w-full sm:w-auto">
                  <Ticket className="w-4 h-4 mr-2" />
                  Ver mis boletos
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="w-full sm:w-auto">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver al inicio
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Pago fallido o cancelado
  if (
    sale.paymentStatus === "FAILED" ||
    sale.paymentStatus === "CANCELED" ||
    sale.status === "CANCELLED" ||
    sale.isExpired
  ) {
    return (
      <div className="min-h-screen regia-bg-main flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-8">
            <XCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold regia-text-title mb-4">
              {sale.isExpired ? "Reserva expirada" : "Pago no completado"}
            </h1>
            <p className="regia-text-body mb-6">
              {sale.isExpired
                ? "Tu reserva ha expirado. Por favor inicia una nueva compra."
                : sale.paymentStatus === "FAILED"
                ? "Tu pago no pudo ser procesado. Por favor intenta nuevamente."
                : "Tu pago fue cancelado. No se realizó ningún cargo."}
            </p>
            <Link href="/">
              <Button>Volver al inicio</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Aún pendiente (último estado antes de timeout)
  return (
    <div className="min-h-screen regia-bg-main flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <Loader2 className="w-16 h-16 text-regia-gold-bright animate-spin mx-auto mb-4" />
        <h1 className="text-2xl font-bold regia-text-title mb-2">
          Verificando pago...
        </h1>
        <p className="regia-text-body mb-6">
          Tu pago está siendo procesado. Te notificaremos cuando se confirme.
        </p>
        <p className="text-sm regia-text-body/70 mb-6">
          Si el pago tarda más de lo esperado, revisa tu correo electrónico o contacta a soporte.
        </p>
        <Link href="/mis-boletos">
          <Button variant="outline">Ver mis boletos</Button>
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen regia-bg-main flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-regia-gold-bright animate-spin mx-auto mb-4" />
          <p className="regia-text-body">Cargando...</p>
        </div>
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
