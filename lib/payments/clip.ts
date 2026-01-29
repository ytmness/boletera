/**
 * Cliente para integración con Clip (payclip.com)
 * Documentación: https://docs.payclip.com
 * 
 * IMPORTANTE: Este cliente usa el método "Checkout redireccionado" que crea
 * un link de pago y redirige al usuario a Clip para completar el pago.
 */

const CLIP_API_BASE_URL = "https://api.payclip.com";
const CLIP_API_VERSION = "v2";

interface CreateCheckoutLinkParams {
  amount: number; // Monto en centavos (MXN)
  currency: string; // "MXN"
  description: string; // Descripción del pago
  reference: string; // Referencia única (saleId)
  successUrl: string; // URL de retorno exitoso
  cancelUrl: string; // URL de cancelación
  webhookUrl?: string; // URL del webhook (opcional)
  expiresAt?: Date; // Fecha de expiración del link
}

interface CreateCheckoutLinkResponse {
  checkoutId: string; // ID del checkout en Clip
  paymentUrl: string; // URL para redirigir al usuario
  paymentRequestCode?: string; // Código alternativo del payment request
  raw?: any; // Respuesta completa de la API
}

interface ClipError {
  message: string;
  code?: string;
  details?: any;
}

/**
 * Cliente para interactuar con la API de Clip
 */
export class ClipClient {
  private authToken: string;
  private baseUrl: string;

  constructor(authToken?: string) {
    this.authToken = authToken || process.env.CLIP_AUTH_TOKEN || "";
    this.baseUrl = CLIP_API_BASE_URL;

    if (!this.authToken) {
      throw new Error("CLIP_AUTH_TOKEN no está configurado en las variables de entorno");
    }
  }

  /**
   * Crea un link de pago redireccionado
   * POST https://api.payclip.com/v2/checkout
   * 
   * Referencia: https://docs.payclip.com/api-reference/checkout-redireccionado
   */
  async createCheckoutLink(params: CreateCheckoutLinkParams): Promise<CreateCheckoutLinkResponse> {
    try {
      const url = `${this.baseUrl}/${CLIP_API_VERSION}/checkout`;

      // Preparar payload según documentación de Clip
      // TODO: Ajustar campos según la documentación oficial de Clip cuando esté disponible
      // Por ahora usamos estructura estándar basada en APIs similares
      const payload: any = {
        amount: params.amount,
        currency: params.currency,
        description: params.description,
        reference: params.reference,
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
      };

      if (params.webhookUrl) {
        payload.webhook_url = params.webhookUrl;
      }

      if (params.expiresAt) {
        // Clip puede requerir formato ISO 8601 o timestamp
        payload.expires_at = params.expiresAt.toISOString();
      }

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.authToken}`, // O "Token ${this.authToken}" según docs
          "Content-Type": "application/json",
          "Accept": "application/vnd.com.payclip.v2+json", // Header específico para v2
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Clip API error: ${response.status} - ${errorData.message || response.statusText}`
        );
      }

      const data = await response.json();

      // Mapear respuesta según estructura de Clip
      // TODO: Ajustar según la estructura real de la respuesta de Clip
      // Por ahora asumimos estructura común:
      // { id, payment_url, payment_request_code, ... }
      return {
        checkoutId: data.id || data.checkout_id || data.payment_request_code || "",
        paymentUrl: data.payment_url || data.url || data.checkout_url || "",
        paymentRequestCode: data.payment_request_code || data.code || data.id,
        raw: data,
      };
    } catch (error) {
      console.error("Error creating Clip checkout link:", error);
      throw error instanceof Error
        ? error
        : new Error("Error desconocido al crear link de pago en Clip");
    }
  }

  /**
   * Verifica el estado de un pago
   * GET https://api.payclip.com/v2/checkout/{checkoutId}
   * 
   * Referencia: https://docs.payclip.com/api-reference/verificar-estado-pago
   */
  async getPaymentStatus(checkoutId: string): Promise<{
    status: string;
    paid: boolean;
    amount?: number;
    paidAt?: Date;
    raw?: any;
  }> {
    try {
      const url = `${this.baseUrl}/${CLIP_API_VERSION}/checkout/${checkoutId}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${this.authToken}`,
          "Accept": "application/vnd.com.payclip.v2+json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Clip API error: ${response.status} - ${errorData.message || response.statusText}`
        );
      }

      const data = await response.json();

      // Mapear estados comunes: "paid", "pending", "failed", "cancelled"
      const status = data.status || data.payment_status || "unknown";
      const paid = status === "paid" || status === "approved" || data.paid === true;

      return {
        status,
        paid,
        amount: data.amount,
        paidAt: data.paid_at ? new Date(data.paid_at) : undefined,
        raw: data,
      };
    } catch (error) {
      console.error("Error checking Clip payment status:", error);
      throw error instanceof Error
        ? error
        : new Error("Error desconocido al verificar estado de pago en Clip");
    }
  }
}

/**
 * Instancia singleton del cliente Clip
 */
let clipClientInstance: ClipClient | null = null;

export function getClipClient(): ClipClient {
  if (!clipClientInstance) {
    clipClientInstance = new ClipClient();
  }
  return clipClientInstance;
}

/**
 * Helper para crear un link de pago
 */
export async function createClipCheckoutLink(
  params: CreateCheckoutLinkParams
): Promise<CreateCheckoutLinkResponse> {
  const client = getClipClient();
  return client.createCheckoutLink(params);
}
