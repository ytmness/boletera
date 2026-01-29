/**
 * Tipos TypeScript para el SDK de Clip Checkout Transparente
 * 
 * Documentación: https://developer.clip.mx/docs/api/checkout-transparente/sdk/inicio
 */

declare global {
  interface Window {
    ClipCheckout?: ClipCheckoutConstructor;
  }
}

export interface ClipCheckoutConstructor {
  new (config: ClipCheckoutConfig): ClipCheckoutInstance;
}

export interface ClipCheckoutConfig {
  /**
   * API Key pública de Clip (obtenida desde el panel de Clip)
   */
  apiKey: string;

  /**
   * Callback que se ejecuta cuando se crea exitosamente un token
   * @param token Token generado por el SDK que debe enviarse al backend
   */
  onTokenCreated?: (token: string) => void;

  /**
   * Callback que se ejecuta cuando ocurre un error
   * @param error Objeto con información del error
   */
  onError?: (error: ClipError) => void;

  /**
   * Idioma del formulario (opcional)
   * @default "es"
   */
  locale?: "es" | "en";

  /**
   * Estilo personalizado del formulario (opcional)
   */
  style?: ClipCheckoutStyle;
}

export interface ClipCheckoutInstance {
  /**
   * Monta el formulario de pago en el elemento especificado
   * @param elementId ID del elemento HTML o elemento DOM donde se montará el formulario
   */
  mount(elementId: string | HTMLElement): void;

  /**
   * Desmonta el formulario de pago
   */
  unmount(): void;

  /**
   * Actualiza la configuración del checkout
   * @param config Nueva configuración
   */
  update?(config: Partial<ClipCheckoutConfig>): void;
}

export interface ClipError {
  /**
   * Mensaje de error
   */
  message: string;

  /**
   * Código de error (opcional)
   */
  code?: string;

  /**
   * Detalles adicionales del error (opcional)
   */
  details?: any;
}

export interface ClipCheckoutStyle {
  /**
   * Color principal del formulario
   */
  primaryColor?: string;

  /**
   * Color de fondo del formulario
   */
  backgroundColor?: string;

  /**
   * Color del texto
   */
  textColor?: string;

  /**
   * Color del borde
   */
  borderColor?: string;

  /**
   * Radio de borde
   */
  borderRadius?: string;

  /**
   * Fuente personalizada
   */
  fontFamily?: string;
}

export {};
