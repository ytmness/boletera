"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, AlertCircle, CreditCard } from "lucide-react";
import { toast } from "sonner";
import type { ClipSDKInstance, ClipCardElement, ClipError } from "@/types/clip";

interface ClipCheckoutFormProps {
  apiKey: string;
  saleId: string;
  amount: number; // Monto en centavos
  currency: string;
  buyerEmail: string; // Email del comprador (REQUERIDO por Clip)
  buyerPhone?: string; // Teléfono del comprador (OPCIONAL)
  onSuccess: (chargeId: string) => void;
  onError: (error: string) => void;
}

/**
 * Componente para el formulario de pago de Clip usando Checkout Transparente (SDK Oficial)
 * 
 * IMPORTANTE: NO requiere certificación PCI-DSS ya que Clip maneja el formulario
 * Necesitas verificar tu identidad con Clip y obtener una API Key
 * 
 * Documentación: https://developer.clip.mx/docs/api/checkout-transparente/sdk/inicio
 * SDK: https://sdk.clip.mx/js/clip-sdk.js
 */
export function ClipCheckoutForm({
  apiKey,
  saleId,
  amount,
  currency,
  buyerEmail,
  buyerPhone,
  onSuccess,
  onError,
}: ClipCheckoutFormProps) {
  const cardElementRef = useRef<ClipCardElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sdkLoaded, setSdkLoaded] = useState(false);

  // Cargar el SDK de Clip (OFICIAL)
  useEffect(() => {
    // Verificar si el SDK ya está cargado
    if (window.ClipSDK) {
      setSdkLoaded(true);
      setIsLoading(false);
      return;
    }

    // Cargar el script del SDK OFICIAL de Clip
    const script = document.createElement("script");
    script.src = "https://sdk.clip.mx/js/clip-sdk.js"; // SDK OFICIAL
    script.async = true;
    script.onload = () => {
      console.log("✅ SDK de Clip cargado exitosamente");
      setSdkLoaded(true);
      setIsLoading(false);
    };
    script.onerror = () => {
      console.error("❌ Error al cargar el SDK de Clip");
      setError("Error al cargar el SDK de Clip. Por favor recarga la página.");
      setIsLoading(false);
      onError("Error al cargar el SDK de Clip");
    };

    document.head.appendChild(script);

    return () => {
      // Limpiar script si el componente se desmonta
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [onError]);

  // Inicializar el SDK cuando esté cargado
  useEffect(() => {
    if (!sdkLoaded || !window.ClipSDK) {
      return;
    }

    try {
      console.log("🔧 Inicializando SDK de Clip con API Key:", apiKey.substring(0, 10) + "...");

      // Verificar que la API Key esté configurada
      if (!apiKey || apiKey === "XXXXXXXXXX") {
        throw new Error("API Key de Clip no configurada correctamente");
      }

      // Inicializar el SDK de Clip
      const clip: ClipSDKInstance = new window.ClipSDK(apiKey);

      // Crear el elemento Card con configuración
      const card = clip.element.create("Card", {
        theme: "light", // Mantener tema claro para mejor legibilidad
        locale: "es",
        paymentAmount: amount / 100, // Convertir de centavos a pesos
        terms: {
          enabled: false, // Desactivar MSI para evitar errores del SDK
        },
      });

      // Montar el formulario en el contenedor "checkout"
      card.mount("checkout");
      cardElementRef.current = card;

      console.log("✅ Formulario de Clip montado exitosamente");

      return () => {
        // Limpiar al desmontar
        try {
          if (cardElementRef.current && cardElementRef.current.unmount) {
            cardElementRef.current.unmount();
          }
        } catch (e) {
          console.warn("Error al desmontar card element:", e);
        }
      };
    } catch (err: any) {
      const errorMessage = err.message || "Error al inicializar el formulario de pago";
      console.error("❌ Error inicializando Clip SDK:", err);
      setError(errorMessage);
      onError(errorMessage);
    }
  }, [sdkLoaded, apiKey, amount, onError]);

  // Manejar el submit del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cardElementRef.current) {
      toast.error("El formulario de pago no está listo");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      console.log("🔄 Obteniendo token de tarjeta...");

      // Obtener el Card Token ID del SDK de Clip
      const cardToken = await cardElementRef.current.cardToken();
      const cardTokenId = cardToken.id;

      console.log("✅ Card Token obtenido:", cardTokenId.substring(0, 10) + "...");

      console.log("🔄 Enviando pago al servidor...");

      // Enviar el token al backend para crear el cargo
      const response = await fetch("/api/payments/clip/create-charge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          saleId,
          token: cardTokenId,
          customer: {
            email: buyerEmail, // REQUERIDO por Clip
            phone: buyerPhone, // OPCIONAL
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al procesar el pago");
      }

      if (!data.success || !data.data) {
        throw new Error("Respuesta inválida del servidor");
      }

      console.log("📋 Respuesta de Clip:", data.data);

      // Verificar si el pago fue rechazado
      if (data.data.paid === false || data.data.status === "rejected" || data.data.status === "declined") {
        const reasonRaw = data.data.declineReason || data.data.decline_reason;
        const code = data.data.declineCode || data.data.decline_code;
        const reason = typeof reasonRaw === "string" ? reasonRaw : (reasonRaw?.message || (reasonRaw ? JSON.stringify(reasonRaw) : null));
        let msg = "Tu pago fue rechazado.";
        if (reason === "Rejected" || reason === "rejected") {
          msg += " Si ya probaste en modo incógnito y con distintas tarjetas, es probable que tu cuenta Clip necesite verificación. Contacta a soporte@clip.mx para habilitar Checkout Transparente.";
        } else {
          msg += " Verifica los datos de tu tarjeta e intenta de nuevo.";
          if (reason) msg += ` (${reason})`;
          else if (code) msg += ` Código: ${typeof code === "string" ? code : String(code)}`;
        }
        throw new Error(msg);
      }

      // Verificar si requiere 3DS
      if (data.data.status === "pending" && data.data.pending_action?.url) {
        console.log("🔐 Requiere autenticación 3DS");
        // TODO: Implementar modal de 3DS si es necesario
        // NO mostrar toast aquí, manejar en el flujo principal
      }

      // Verificar que el pago fue aprobado
      if (!data.data.paid && data.data.status !== "approved") {
        throw new Error("El pago no pudo ser procesado. Por favor intenta de nuevo.");
      }

      // Pago procesado exitosamente
      // NO mostrar toast aquí para evitar duplicados
      onSuccess(data.data.chargeId);
    } catch (err: any) {
      console.error("❌ Error al procesar el pago:", err);

      // Determinar el mensaje de error apropiado
      let errorMessage = "Error al procesar el pago";
      
      if (err.code) {
        switch (err.code) {
          case "CL2200":
          case "CL2290":
            errorMessage = `Error de validación: ${err.message}`;
            break;
          case "AI1300":
            errorMessage = "Error de conexión. Por favor intenta de nuevo.";
            break;
          default:
            errorMessage = err.message || "Error al procesar el pago";
        }
      } else {
        errorMessage = err.message || "Error al procesar el pago";
      }

      // Mostrar error solo UNA vez (en el componente)
      setError(errorMessage);
      // NO llamar a toast.error aquí para evitar duplicados
      // Dejar que el componente padre lo maneje a través de onError
      onError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-regia-gold mb-4" />
        <p className="text-regia-text-body">Cargando formulario de pago...</p>
      </div>
    );
  }

  if (error && !sdkLoaded) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-red-50 dark:bg-red-900/20 rounded-lg">
        <AlertCircle className="w-8 h-8 text-red-500 mb-4" />
        <p className="text-red-700 dark:text-red-400 text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* CSS para ajustar el iframe de Clip */}
      <style jsx global>{`
        #checkout iframe {
          width: 100% !important;
          max-width: 100% !important;
        }
      `}</style>

      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg backdrop-blur-sm">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium regia-text-title">
                Error en el pago
              </p>
              <p className="text-sm regia-text-body mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {isProcessing && (
        <div className="mb-4 p-4 bg-regia-gold/10 border border-regia-gold/30 rounded-lg backdrop-blur-sm">
          <div className="flex items-center">
            <Loader2 className="w-5 h-5 text-regia-gold mr-2 animate-spin" />
            <p className="text-sm regia-text-body">
              Procesando tu pago...
            </p>
          </div>
        </div>
      )}

      {/* Tip para el usuario */}
      <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg backdrop-blur-sm">
        <div className="flex items-start">
          <CreditCard className="w-4 h-4 text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-blue-300">
              💡 <strong>Tip:</strong> Si el número de tarjeta no se valida al escribir, intenta <strong>copiarlo y pegarlo</strong> directamente en el campo.
            </p>
          </div>
        </div>
      </div>

      {/* Formulario con el elemento de Clip */}
      <form id="payment-form" onSubmit={handleSubmit}>
        {/* Contenedor donde se montará el formulario de Clip */}
        <div
          id="checkout"
          className="clip-checkout-form mb-6 bg-white rounded-lg p-3 shadow-xl overflow-hidden"
          style={{ 
            minHeight: "220px",
            width: "100%",
            maxWidth: "100%"
          }}
        />

        {/* Botón de pago */}
        <button
          type="submit"
          disabled={isProcessing || !sdkLoaded}
          className="w-full py-3 px-4 bg-regia-gold text-regia-black font-semibold rounded-lg hover:bg-regia-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              Pagar ${(amount / 100).toLocaleString("es-MX", {
                minimumFractionDigits: 2,
              })}{" "}
              {currency}
            </>
          )}
        </button>
      </form>

      <div className="mt-4 p-4 bg-regia-gold-old/10 backdrop-blur-sm rounded-lg border border-regia-gold-old/20">
        <p className="text-xs regia-text-body text-center">
          🔒 Tus datos de pago están protegidos y encriptados por Clip. No almacenamos información de tu tarjeta.
        </p>
      </div>
    </div>
  );
}
