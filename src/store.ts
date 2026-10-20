import { requireNativeModule } from 'expo-modules-core';
type Status = { pdfReadAloud: boolean };
export type SubscriptionOffer = { id: string; price: string; name: string };
type StoreModule = { status(): Promise<Status>; offers(): Promise<SubscriptionOffer[]>; purchase(productId: string): Promise<Status>; restore(): Promise<Status> };
const store = requireNativeModule<StoreModule>('KenniStore');
export const subscriptionStatus = () => store.status();
export const subscriptionOffers = () => store.offers();
export const purchaseSubscription = (productId: string) => store.purchase(productId);
export const restoreSubscription = () => store.restore();
