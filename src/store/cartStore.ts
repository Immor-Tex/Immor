import { create } from 'zustand';
import { CartItem } from '../types/product';

interface CartStore {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string, selectedSize: string, selectedColor: string) => void;
  updateQuantity: (productId: string, selectedSize: string, selectedColor: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>((set) => ({
  items: [],
  
  addToCart: (item) => {
    set((state) => {
      const existingItemIndex = state.items.findIndex(
        (i) => 
          i.product.id === item.product.id && 
          i.selectedSize === item.selectedSize && 
          i.selectedColor === item.selectedColor
      );

      if (existingItemIndex > -1) {
        // Item exists, update quantity
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex].quantity += item.quantity;
        return { items: updatedItems };
      } else {
        // New item, add to cart
        return { items: [...state.items, item] };
      }
    });
  },
  
  removeFromCart: (productId, selectedSize, selectedColor) => {
    set((state) => ({
      items: state.items.filter(
        (item) => 
          !(item.product.id === productId && 
            item.selectedSize === selectedSize && 
            item.selectedColor === selectedColor)
      ),
    }));
  },
  
  updateQuantity: (productId, selectedSize, selectedColor, quantity) => {
    set((state) => ({
      items: state.items.map((item) => {
        if (
          item.product.id === productId && 
          item.selectedSize === selectedSize && 
          item.selectedColor === selectedColor
        ) {
          return { ...item, quantity };
        }
        return item;
      }),
    }));
  },
  
  clearCart: () => {
    set({ items: [] });
  },
}));