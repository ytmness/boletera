/**
 * Tipos TypeScript para el SDK de Clip Checkout Transparente (OFICIAL)
 * 
 * Documentación: https://developer.clip.mx/docs/api/checkout-transparente/sdk/inicio
 * SDK URL: https://sdk.clip.mx/js/clip-sdk.js
 */

declare global {
  interface Window {
    ClipSDK?: ClipSDKConstructor;
  }
}

/**
 * Constructor del SDK de Clip
 */
export interface ClipSDKConstructor {
  new (apiKey: string): ClipSDKInstance;
}

/**
 * Instancia del SDK de Clip
 */
export interface ClipSDKInstance {
  /**
   * Objeto para crear elementos de pago
   */
  element: {
    /**
     * Crea un elemento de formulario de tarjeta
     * @param type Tipo de elemento ("Card")
     * @param options Opciones de configuración
     */
    create(type: "Card", options?: ClipCardOptions): ClipCardElement;
  };
}

/**
 * Opciones para el elemento Card
 */
export interface ClipCardOptions {
  /**
   * Tema del formulario
   * @default "light"
   */
  theme?: "light" | "dark";

  /**
   * Idioma del formulario
   * @default "es" (o el idioma del navegador)
   */
  locale?: "es" | "en";

  /**
   * Monto del pago (en centavos) - requerido para MSI
   */
  paymentAmount?: number;

  /**
   * Configuración de términos (MSI)
   */
  terms?: {
    /**
     * Habilita el selector de Meses Sin Intereses
     */
    enabled?: boolean;
  };
}

/**
 * Elemento de formulario de tarjeta
 */
export interface ClipCardElement {
  /**
   * Monta el formulario en el contenedor especificado
   * @param containerId ID del elemento HTML (sin "#")
   */
  mount(containerId: string): void;

  /**
   * Tokeniza la tarjeta y retorna el Card Token ID
   * @returns Promise con el objeto CardToken
   * @throws ClipError si hay errores de validación
   */
  cardToken(): Promise<ClipCardToken>;

  /**
   * Obtiene el valor de los installments (MSI) seleccionados
   * @returns Promise con el número de cuotas
   */
  installments(): Promise<number>;

  /**
   * Desmonta el formulario (opcional, no documentado oficialmente)
   */
  unmount?(): void;
}

/**
 * Token de tarjeta generado por el SDK
 */
export interface ClipCardToken {
  /**
   * ID del token de tarjeta (válido por 15 minutos, un solo uso)
   */
  id: string;
}

/**
 * Error del SDK de Clip
 */
export interface ClipError {
  /**
   * Código de error
   * - CL2200: Error de validación de campos
   * - CL2290: Error de tokenización
   * - AI1300: Error de red/conexión
   */
  code: string;

  /**
   * Mensaje de error
   */
  message: string;

  /**
   * Detalles adicionales del error (opcional)
   */
  details?: any;
}

/**
 * Respuesta de la API de Payments de Clip
 */
export interface ClipPaymentResponse {
  /**
   * ID del pago
   */
  id: string;

  /**
   * Monto del pago en centavos
   */
  amount: number;

  /**
   * Moneda del pago
   */
  currency: string;

  /**
   * Estado del pago
   * - approved: Pago aprobado
   * - rejected: Pago rechazado
   * - pending: Pago pendiente (puede requerir 3DS)
   * - authorized: Pago autorizado (pendiente de captura)
   * - refunded: Pago reembolsado
   * - cancelled: Pago cancelado
   */
  status: string;

  /**
   * Detalles del estado
   */
  status_detail: {
    code: string;
    message: string;
  };

  /**
   * Acción pendiente (ej: 3DS)
   */
  pending_action?: {
    type: "open_modal";
    url: string;
  };

  /**
   * Información del método de pago
   */
  payment_method?: {
    id: string;
    type: string;
    card?: {
      bin: string;
      issuer: string;
      name: string;
      country: string;
      last_digits: string;
      exp_year: string;
      exp_month: string;
    };
    token: string;
  };

  /**
   * Información del cliente
   */
  customer?: {
    email: string;
    phone: string;
  };

  /**
   * Fecha de creación
   */
  created_at: string;

  /**
   * Fecha de aprobación (si aplica)
   */
  approved_at?: string;

  /**
   * Respuesta completa (raw)
   */
  [key: string]: any;
}

export {};
