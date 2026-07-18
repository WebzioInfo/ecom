import { create } from 'zustand';
export var useCartStore = create(function (set) { return ({
    cart: null,
    setCart: function (cart) { return set({ cart: cart }); },
    clearCart: function () { return set({ cart: null }); },
}); });
