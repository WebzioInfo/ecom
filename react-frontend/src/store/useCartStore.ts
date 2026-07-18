import { create } from 'zustand';
import { CartState } from '../types';

interface CartStore {
  cart: CartState | null;
  setCart: (cart: CartState) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>((set) => ({
  cart: null,
  setCart: (cart) => set({ cart }),
  clearCart: () => set({ cart: null }),
}));
