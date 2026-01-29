"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import type { ClipCheckoutInstance, ClipError } from "@/types/clip";

interface ClipCheckoutFormProps {
  apiKey: string;
  saleId: string;
  amount: number; // Monto en centavos
  currency: string;
  onSuccess: (chargeId: string) => void;
  onError: (error: string) => void;
}

/**
 * Componente para el formulario de pago de Clip usando Checkout Transparente
 * 
 * IMPORTANTE: NO requiere certificación PCI-DSS ya que Clip maneja el formulario
 * Necesitas verificar tu identidad con Clip y obtener una API Key
 * 
 * Documentación: https://developer.clip.mx/docs/api/checkout-transparente/sdk/inicio
 */
export function ClipCheckoutForm({
  apiKey,
  saleId,
  amount,
  currency,
  onSuccess,
  onError,
}: ClipCheckoutFormProps) {
  const formRef = useRef<HTMLDivElement>(null);
  const checkoutInstanceRef = useRef<ClipCheckoutInstance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sdkLoaded, setSdkLoaded] = useState(false);

  // Cargar el SDK de Clip
  useEffect(() => {
    // Verificar si el SDK ya está cargado
    if (window.ClipCheckout) {
      setSdkLoaded(true);
      setIsLoading(false);
      return;
    }

    // Cargar el script del SDK
    const script = document.createElement("script");
    script.src = "https://js.clip.mx/checkout/sdk.js";
    script.async = true;
    script.onload = () => {
      setSdkLoaded(true);
      setIsLoading(false);
    };
    script.onerror = () => {
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

  // Inicializar el checkout cuando el SDK esté cargado
  useEffect(() => {
    if (!sdkLoaded || !window.ClipCheckout || !formRef.current) {
      return;
    }

    try {
      // Limpiar instancia anterior si existe
      if (checkoutInstanceRef.current) {
        try {
          checkoutInstanceRef.current.unmount?.();
        } catch (e) {
          console.warn("Error al desmontar instancia anterior:", e);
        }
      }

      // Crear nueva instancia del checkout
      const checkout = new window.ClipCheckout({
        apiKey,
        onTokenCreated: async (token: string) => {
          setIsProcessing(true);
          setError(null);

          try {
            // Enviar el token al backend para crear el cargo
            const response = await fetch("/api/payments/clip/create-charge", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                saleId,
                token,
              }),
            });

            const data = await response.json();

            if (!response.ok) {
              throw new Error(data.error || "Error al procesar el pago");
            }

            if (data.success && data.data) {
              // Pago procesado exitosamente
              onSuccess(data.data.chargeId);
            } else {
              throw new Error("Respuesta inválida del servidor");
            }
          } catch (err: any) {
            const errorMessage = err.message || "Error al procesar el pago";
            setError(errorMessage);
            onError(errorMessage);
            toast.error(errorMessage);
            setIsProcessing(false);
          }
        },
        onError: (err: ClipError) => {
          const errorMessage = err.message || "Error al crear el token de pago";
          console.error("Clip SDK Error:", err);
          setError(errorMessage);
          onError(errorMessage);
          toast.error(errorMessage);
          setIsProcessing(false);
        },
      });

      checkoutInstanceRef.current = checkout;

      // Montar el formulario en el contenedor
      checkout.mount(formRef.current);

      return () => {
        // Limpiar al desmontar
        try {
          if (checkoutInstanceRef.current) {
            checkoutInstanceRef.current.unmount?.();
          }
        } catch (e) {
          console.warn("Error al desmontar checkout:", e);
        }
      };
    } catch (err: any) {
      const errorMessage = err.message || "Error al inicializar el formulario de pago";
      console.error("Error inicializando Clip Checkout:", err);
      setError(errorMessage);
      onError(errorMessage);
    }
  }, [sdkLoaded, apiKey, saleId, onSuccess, onError]);

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
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                Error en el pago
              </p>
              <p className="text-sm text-red-600 dark:text-red-300 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {isProcessing && (
        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center">
            <Loader2 className="w-5 h-5 text-blue-500 mr-2 animate-spin" />
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Procesando tu pago...
            </p>
          </div>
        </div>
      )}

      {/* Contenedor donde se montará el formulario de Clip */}
      <div
        ref={formRef}
        className="clip-checkout-form"
        style={{ minHeight: "400px" }}
      />

      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
          🔒 Tus datos de pago están protegidos y encriptados. No almacenamos información de tu tarjeta.
        </p>
      </div>
    </div>
  );
}
