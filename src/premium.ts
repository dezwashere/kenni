// kenni subscription configuration.
// IMPORTANT: Client-side state alone must never unlock a paid entitlement.
// Verify active subscriptions through StoreKit / a trusted entitlement provider.
export const PDF_READ_ALOUD_PRODUCT_ID = 'kenni.pdf_read_aloud.monthly';
export const PDF_READ_ALOUD_DISPLAY_PRICE = '$2.99/month';
export type Entitlement = { pdfReadAloud: boolean; verifiedAt?: number };
export function canReadPdfAloud(entitlement: Entitlement | null): boolean {
  return entitlement?.pdfReadAloud === true;
}
// The PDF reader itself remains free. Only speech synthesis for PDF text
// is gated behind the verified subscription entitlement.
