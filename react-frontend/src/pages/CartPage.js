import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { cartApi } from '../api/cart.api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useCartStore } from '../store/useCartStore';
import { toast } from 'react-hot-toast';
export default function CartPage() {
    var _a;
    var navigate = useNavigate();
    var _b = useCartStore(), cart = _b.cart, setCart = _b.setCart;
    var cartQuery = useQuery({
        queryKey: ['cart'],
        queryFn: cartApi.get,
    });
    var updateMutation = useMutation({
        mutationFn: cartApi.update,
        onSuccess: function (data) {
            setCart(data);
            toast.success('Cart updated');
        },
    });
    var removeMutation = useMutation({
        mutationFn: cartApi.remove,
        onSuccess: function (data) {
            setCart(data);
            toast.success('Item removed');
        },
    });
    useEffect(function () {
        if (cartQuery.data) {
            setCart(cartQuery.data);
        }
    }, [cartQuery.data, setCart]);
    if (cartQuery.isPending) {
        return _jsx(LoadingSpinner, {});
    }
    if (cartQuery.isError) {
        return (_jsx("div", { className: "rounded-3xl bg-white p-10 text-center text-slate-600 shadow-sm", children: "Could not load cart." }));
    }
    if (!((_a = cart === null || cart === void 0 ? void 0 : cart.items) === null || _a === void 0 ? void 0 : _a.length)) {
        return (_jsx("div", { className: "rounded-3xl bg-white p-10 text-center text-slate-600 shadow-sm", children: "Your cart is empty." }));
    }
    var total = cart.items.reduce(function (sum, item) { return sum + Number(item.product.price || 0) * item.quantity; }, 0);
    return (_jsxs("div", { className: "grid gap-8 lg:grid-cols-[1.2fr_0.8fr]", children: [_jsxs("section", { className: "space-y-6 rounded-3xl bg-white p-8 shadow-sm", children: [_jsx("h1", { className: "text-3xl font-semibold text-slate-900", children: "Shopping cart" }), cart.items.map(function (item) {
                        var _a;
                        return (_jsxs("div", { className: "grid gap-4 rounded-3xl border border-slate-200 p-5 sm:grid-cols-[1fr_0.35fr]", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("img", { src: ((_a = item.product.images) === null || _a === void 0 ? void 0 : _a[0]) || 'https://via.placeholder.com/120', alt: item.product.title || 'Product', className: "h-24 w-24 rounded-3xl object-cover" }), _jsxs("div", { children: [_jsx("p", { className: "text-lg font-semibold text-slate-900", children: item.product.title }), _jsxs("p", { className: "text-sm text-slate-500", children: ["Qty: ", item.quantity] }), _jsx("button", { onClick: function () { return removeMutation.mutate(item.product._id || item.product); }, className: "mt-2 text-sm font-medium text-indigo-600 hover:text-indigo-500", children: "Remove" })] })] }), _jsxs("div", { className: "space-y-3 text-right", children: [_jsxs("p", { className: "text-lg font-semibold text-slate-900", children: ["$", (item.product.price || 0 * item.quantity).toFixed(2)] }), _jsxs("div", { className: "grid gap-2 sm:grid-cols-2", children: [_jsx("button", { className: "rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700", onClick: function () { return updateMutation.mutate({ productId: item.product._id || item.product, quantity: item.quantity + 1 }); }, children: "+" }), _jsx("button", { className: "rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700", onClick: function () { return updateMutation.mutate({ productId: item.product._id || item.product, quantity: Math.max(1, item.quantity - 1) }); }, children: "-" })] })] })] }, item.product._id || item.product));
                    })] }), _jsxs("aside", { className: "space-y-6 rounded-3xl bg-white p-8 shadow-sm", children: [_jsxs("div", { className: "space-y-4", children: [_jsx("h2", { className: "text-xl font-semibold text-slate-900", children: "Order summary" }), _jsxs("div", { className: "flex items-center justify-between text-sm text-slate-600", children: [_jsx("span", { children: "Items" }), _jsx("span", { children: cart.items.length })] }), _jsxs("div", { className: "flex items-center justify-between text-sm text-slate-600", children: [_jsx("span", { children: "Subtotal" }), _jsxs("span", { children: ["$", total.toFixed(2)] })] })] }), _jsx("button", { onClick: function () { return navigate('/checkout'); }, className: "w-full rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition", children: "Continue to checkout" })] })] }));
}
