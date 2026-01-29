"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { ClipCheckoutForm } from "@/components/payments/ClipCheckoutForm";
import { toast } from "sonner";
import Image from "next/image";

interface Sale {
  id: string;
  total: number;
  currency: string;
  status: string;
  paymentStatus: string;
  event: {
    name: string;
    artist: string;
    eventDate: Date;
  };
  saleItems: Array<{
    quantity: number;
    ticketType: {
      name: string;
      price: number;
    };
  }>;
}

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const saleId = params.saleId as string;

  const [sale, setSale] = useState<Sale | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  useEffect(() => {
    if (!saleId) {
      toast.error("No se encontró información de la venta");
      router.push("/");
      return;
    }

    // Cargar información de la venta
    const loadSale = async () => {
      try {
        const response = await fetch(`/api/sales/${saleId}`);
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Error al cargar la venta");
        }

        setSale(data.data);

        // Si el pago ya está completado, mostrar mensaje de éxito
        if (data.data.paymentStatus === "PAID" || data.data.status === "COMPLETED") {
          setPaymentCompleted(true);
        }
      } catch (error: any) {
        toast.error(error.message || "Error al cargar la información de la venta");
        router.push("/");
      } finally {
        setIsLoading(false);
      }
    };

    loadSale();
  }, [saleId, router]);

  const handlePaymentSuccess = (chargeId: string) => {
    setPaymentCompleted(true);
    toast.success("¡Pago procesado exitosamente!");
    
    // Redirigir a la página de éxito después de un breve delay
    setTimeout(() => {
      router.push(`/checkout/success?saleId=${saleId}`);
    }, 2000);
  };

  const handlePaymentError = (error: string) => {
    toast.error(error);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen regia-bg-main flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-regia-gold mx-auto mb-4" />
          <p className="regia-text-body">Cargando información de pago...</p>
        </div>
      </div>
    );
  }

  if (!sale) {
    return (
      <div className="min-h-screen regia-bg-main flex items-center justify-center p-4">
        <div className="text-center">
          <p className="regia-text-body text-lg mb-4">Venta no encontrada</p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-2 bg-regia-gold text-regia-black rounded-lg font-semibold hover:bg-regia-gold/90 transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  if (paymentCompleted) {
    return (
      <div className="min-h-screen regia-bg-main flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 text-center">
            <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold regia-text-title mb-4">
              ¡Pago confirmado!
            </h1>
            <p className="regia-text-body mb-6">
              Tu pago ha sido procesado exitosamente. Redirigiendo...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Verificar que la venta esté pendiente
  if (sale.status !== "PENDING") {
    return (
      <div className="min-h-screen regia-bg-main flex items-center justify-center p-4">
        <div className="text-center">
          <p className="regia-text-body text-lg mb-4">
            Esta venta ya ha sido procesada
          </p>
          <button
            onClick={() => router.push(`/checkout/success?saleId=${saleId}`)}
            className="px-6 py-2 bg-regia-gold text-regia-black rounded-lg font-semibold hover:bg-regia-gold/90 transition-colors"
          >
            Ver detalles
          </button>
        </div>
      </div>
    );
  }

  const totalAmount = Math.round((Number(sale.total) + 2) * 100); // Convertir a centavos (incluye cargo de servicio de $2)
  const clipApiKey = process.env.NEXT_PUBLIC_CLIP_API_KEY || "";

  if (!clipApiKey) {
    return (
      <div className="min-h-screen regia-bg-main flex items-center justify-center p-4">
        <div className="text-center">
          <p className="regia-text-body text-lg mb-4 text-red-500">
            Error de configuración: NEXT_PUBLIC_CLIP_API_KEY no está configurada
          </p>
          <p className="regia-text-body text-sm mb-4">
            Por favor contacta al administrador del sistema.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen regia-bg-main">
      {/* Header */}
      <header className="sticky top-0 z-30 px-4 sm:px-6 lg:px-12 py-4 sm:py-6 bg-regia-black/80 backdrop-blur-md border-b border-regia-gold-old/20">
        <div className="w-full flex items-center justify-between">
          <div className="flex-shrink-0">
            <Image
              src="/assets/logo-grupo-regia.png"
              alt="Grupo Regia"
              width={110}
              height={65}
              className="opacity-90 cursor-pointer"
              onClick={() => router.push("/")}
            />
          </div>
          <button
            onClick={() => router.back()}
            className="flex items-center text-regia-text-body hover:text-regia-gold transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Resumen de la compra */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-6">
              Resumen de tu compra
            </h2>

            <div className="space-y-4 mb-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {sale.event.name}
                </h3>
                {sale.event.artist && (
                  <p className="text-gray-200 text-base mb-2">
                    Artista: {sale.event.artist}
                  </p>
                )}
                {sale.event.eventDate && (
                  <p className="text-gray-200 text-base">
                    Fecha:{" "}
                    {new Date(sale.event.eventDate).toLocaleDateString("es-MX", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                )}
              </div>

              <div className="border-t border-white/20 pt-4">
                <h4 className="font-semibold text-white text-lg mb-3">Boletos:</h4>
                <div className="space-y-2">
                  {sale.saleItems.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between text-gray-200 text-base"
                    >
                      <span>
                        {item.quantity}x {item.ticketType.name}
                      </span>
                      <span className="font-medium">
                        ${(item.ticketType.price * item.quantity).toLocaleString("es-MX", {
                          minimumFractionDigits: 2,
                        })}{" "}
                        {sale.currency}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-white/20 pt-4 space-y-3">
                <div className="flex justify-between items-center text-gray-200 text-base">
                  <span>Subtotal:</span>
                  <span className="font-medium">
                    ${sale.total.toLocaleString("es-MX", {
                      minimumFractionDigits: 2,
                    })}{" "}
                    {sale.currency}
                  </span>
                </div>
                <div className="flex justify-between items-center text-gray-200 text-base">
                  <span>Cargo de servicio:</span>
                  <span className="font-medium">
                    ${(2).toLocaleString("es-MX", {
                      minimumFractionDigits: 2,
                    })}{" "}
                    {sale.currency}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-white/10">
                  <span className="text-xl font-bold text-white">Total:</span>
                  <span className="text-2xl font-bold text-regia-gold">
                    ${(sale.total + 2).toLocaleString("es-MX", {
                      minimumFractionDigits: 2,
                    })}{" "}
                    {sale.currency}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Formulario de pago */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-6">
              Información de pago
            </h2>

            <ClipCheckoutForm
              apiKey={clipApiKey}
              saleId={saleId}
              amount={totalAmount}
              currency={sale.currency}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
