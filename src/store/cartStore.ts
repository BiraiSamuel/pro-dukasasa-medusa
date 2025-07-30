// store/cartStore.ts
import { create } from "zustand";

interface CartStore {
  quantity: number;
  setQuantity: (quantity: number) => void;
  fetchCart: () => Promise<void>;
}

export const useCartStore = create<CartStore>((set) => ({
  quantity: 0,

  setQuantity: (quantity) => set({ quantity }),

  fetchCart: async () => {
    try {
      const res = await fetch("/api/proxy/cart", { cache: "no-store" });
      const json = await res.json();
      const items = json.cart?.data?.items || [];
      const total = items.reduce((sum: number, item: any) => sum + item.quantity, 0);
      set({ quantity: total });
    } catch (error) {
      console.error("Failed to fetch cart");
      set({ quantity: 0 });
    }
  },
}));
