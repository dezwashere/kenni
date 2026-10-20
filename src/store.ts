import { requireNativeModule } from 'expo-modules-core';
type Status = { pdfReadAloud: boolean };
type Offer = { id: string; price: string; name: string };
type StoreModule = { status(): Promise<Status>; offer(): Promise<Offer>; purchase(): Promise<Status>; restore(): Promise<Status> };
const store = requireNativeModule<StoreModule>('KenniStore');
export const subscriptionStatus = () => store.status();
export const subscriptionOffer = () => store.offer();
export const purchaseSubscription = () => store.purchase();
export const restoreSubscription = () => store.restore();
