/**
 * Cliente para integración con Clip (payclip.com)
 * Documentación: https://docs.payclip.com
 * 
 * IMPORTANTE: Este cliente usa el método "Checkout redireccionado" que crea
 * un link de pago y redirige al usuario a Clip para completar el pago.
 */

const CLIP_API_BASE_URL = "https://api.payclip.com";
const CLIP_API_VERSION = "v2"; // Para endpoints legacy
const CLIP_PAYMENTS_API_URL = "https://api.payclip.com"; // Para Checkout Transparente

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
    // Para Checkout Transparente, usar CLIP_API_KEY (misma que NEXT_PUBLIC_CLIP_API_KEY)
    // Para endpoints legacy, usar CLIP_AUTH_TOKEN
    this.authToken = authToken || process.env.CLIP_API_KEY || process.env.CLIP_AUTH_TOKEN || "";
    this.baseUrl = CLIP_API_BASE_URL;

    if (!this.authToken) {
      throw new Error("CLIP_API_KEY o CLIP_AUTH_TOKEN no está configurado en las variables de entorno");
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

      console.log("Clip API Request:", {
        url,
        payload,
        authToken: this.authToken ? `${this.authToken.substring(0, 10)}...` : "MISSING",
      });

      // Probar diferentes formatos de headers según documentación de Clip
      // Clip puede requerir "Token" en lugar de "Bearer", o un formato diferente
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      // Intentar con "Token" primero (formato común en algunas APIs)
      headers["Authorization"] = `Token ${this.authToken}`;
      
      // Si Clip requiere Accept header específico, agregarlo
      // headers["Accept"] = "application/json";

      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorData: any = {};
        let errorText = "";
        try {
          errorText = await response.text();
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { raw: errorText };
        }
        
        console.error("Clip API Error Details:", {
          status: response.status,
          statusText: response.statusText,
          url,
          payload,
          errorData,
          errorText,
        });
        
        throw new Error(
          `Clip API error: ${response.status} - ${errorData.message || errorData.error || response.statusText || "Unknown error"}`
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

  /**
   * Crea un pago usando Checkout Transparente (token generado por el SDK)
   * POST https://api.payclip.com/payments
   * 
   * Referencia: Documentación oficial de Clip Checkout Transparente
   * https://developer.clip.mx/docs/api/checkout-transparente/sdk/realizar-pago
   * 
   * IMPORTANTE: NO requiere certificación PCI-DSS ya que Clip maneja el formulario
   * Necesitas verificar tu identidad con Clip y obtener una API Key
   */
  async createCharge(params: {
    amount: number; // Monto en PESOS (no centavos) según documentación
    currency: string; // "MXN"
    token: string; // Card Token ID generado por el SDK de Clip
    description: string; // Descripción del pago
    reference?: string; // Referencia única (saleId) - opcional
    customer?: {
      email?: string;
      phone?: string;
    };
    installments?: number; // Para MSI (Meses Sin Intereses)
  }): Promise<{
    id: string;
    status: string;
    amount: number;
    currency: string;
    paid: boolean;
    pending_action?: {
      type: string;
      url: string;
    };
    raw?: any;
  }> {
    try {
      // Usar el endpoint de payments según documentación oficial
      const url = `${CLIP_PAYMENTS_API_URL}/payments`;

      // Construir payload según documentación oficial de Clip
      const payload: any = {
        amount: params.amount, // En PESOS, no centavos
        currency: params.currency,
        description: params.description,
        payment_method: {
          token: params.token, // Card Token ID del SDK
        },
      };

      // Agregar customer si está presente
      if (params.customer) {
        payload.customer = params.customer;
      }

      // Agregar reference si está presente (external_reference en Clip)
      if (params.reference) {
        payload.external_reference = params.reference;
      }

      // Agregar installments para MSI si está presente
      if (params.installments && params.installments > 1) {
        payload.installments = params.installments;
      }

      console.log("Clip API Create Charge Request:", {
        url,
        payload: {
          ...payload,
          payment_method: {
            token: `${params.token.substring(0, 10)}...`,
          },
        },
        authToken: this.authToken ? `${this.authToken.substring(0, 10)}...` : "MISSING",
      });

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.authToken}`, // API Key con prefijo Bearer según documentación
      };

      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorData: any = {};
        let errorText = "";
        try {
          errorText = await response.text();
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { raw: errorText };
        }
        
        console.error("Clip API Create Charge Error:", {
          status: response.status,
          statusText: response.statusText,
          url,
          headers: {
            ...headers,
            Authorization: `Bearer ${this.authToken.substring(0, 10)}...`,
          },
          payload: {
            ...payload,
            payment_method: {
              token: `${params.token.substring(0, 10)}...`,
            },
          },
          errorData,
          errorText,
        });
        
        throw new Error(
          `Clip API error: ${response.status} - ${errorData.message || errorData.error || response.statusText || "Unknown error"}`
        );
      }

      const data = await response.json();

      console.log("✅ Clip API Response:", {
        id: data.id,
        status: data.status,
        status_detail: data.status_detail,
        amount: data.amount,
        pending_action: data.pending_action,
      });

      return {
        id: data.id || "",
        status: data.status || "unknown",
        amount: data.amount || params.amount,
        currency: data.currency || params.currency,
        paid: data.status === "approved" || data.status === "paid",
        pending_action: data.pending_action,
        raw: data,
      };
    } catch (error) {
      console.error("❌ Error creating Clip charge:", error);
      throw error instanceof Error
        ? error
        : new Error("Error desconocido al crear cargo en Clip");
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

/**
 * Helper para crear un cargo con token (Checkout Transparente)
 */
export async function createClipCharge(params: {
  amount: number;
  currency: string;
  token: string;
  description: string;
  reference: string;
}): Promise<{
  id: string;
  status: string;
  amount: number;
  currency: string;
  paid: boolean;
  raw?: any;
}> {
  const client = getClipClient();
  return client.createCharge(params);
}
