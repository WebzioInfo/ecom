import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ordersApi } from '../api/orders.api';
import { cartApi } from '../api/cart.api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useCartStore } from '../store/useCartStore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
export default function CheckoutPage() {
    var _a;
    var navigate = useNavigate();
    var _b = useState(''), name = _b[0], setName = _b[1];
    var _c = useState(''), address = _c[0], setAddress = _c[1];
    var _d = useState(''), phone = _d[0], setPhone = _d[1];
    var _e = useState(''), notes = _e[0], setNotes = _e[1];
    var cart = useCartStore().cart;
    var cartQuery = useQuery({
        queryKey: ['cart'],
        queryFn: cartApi.get,
    });
    var createOrderMutation = useMutation({
        mutationFn: ordersApi.create,
        onSuccess: function (data) {
            window.location.href = data.whatsappUrl;
        },
        onError: function () {
            toast.error('Unable to place order.');
        },
    });
    if (cartQuery.isLoading) {
        return _jsx(LoadingSpinner, {});
    }
    var items = (cart === null || cart === void 0 ? void 0 : cart.items) || ((_a = cartQuery.data) === null || _a === void 0 ? void 0 : _a.items) || [];
    var subtotal = items.reduce(function (sum, item) { return sum + Number(item.product.price || 0) * item.quantity; }, 0);
    return (_jsxs("div", { className: "grid gap-8 lg:grid-cols-[1.3fr_0.7fr]", children: [_jsxs("section", { className: "rounded-3xl bg-white p-8 shadow-sm", children: [_jsx("h1", { className: "text-3xl font-semibold text-slate-900", children: "Checkout" }), _jsxs("div", { className: "mt-8 grid gap-6", children: [_jsxs("div", { className: "space-y-3", children: [_jsx("label", { className: "block text-sm font-medium text-slate-700", children: "Full name" }), _jsx("input", { value: name, onChange: function (event) { return setName(event.target.value); }, className: "w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none" })] }), _jsxs("div", { className: "space-y-3", children: [_jsx("label", { className: "block text-sm font-medium text-slate-700", children: "Shipping address" }), _jsx("textarea", { value: address, onChange: function (event) { return setAddress(event.target.value); }, className: "w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none", rows: 4 })] }), _jsxs("div", { className: "grid gap-6 sm:grid-cols-2", children: [_jsxs("div", { className: "space-y-3", children: [_jsx("label", { className: "block text-sm font-medium text-slate-700", children: "Phone" }), _jsx("input", { value: phone, onChange: function (event) { return setPhone(event.target.value); }, className: "w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none" })] }), _jsxs("div", { className: "space-y-3", children: [_jsx("label", { className: "block text-sm font-medium text-slate-700", children: "Notes" }), _jsx("input", { value: notes, onChange: function (event) { return setNotes(event.target.value); }, className: "w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none" })] })] }), _jsx("button", { onClick: function () { return createOrderMutation.mutate({
                                    items: items.map(function (item) { return ({
                                        productId: item.product._id || item.product,
                                        quantity: item.quantity,
                                        priceAtPurchase: item.product.price || 0,
                                    }); }),
                                    customerName: name,
                                    shippingAddress: address,
                                    phone: phone,
                                    paymentMethod: 'whatsapp',
                                    returnUrl: window.location.href,
                                }); }, className: "mt-6 rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition", children: "Place order via WhatsApp" })] })] }), _jsxs("aside", { className: "rounded-3xl bg-white p-8 shadow-sm", children: [_jsx("h2", { className: "text-xl font-semibold text-slate-900", children: "Order summary" }), _jsx("div", { className: "mt-6 space-y-4", children: items.map(function (item) { return (_jsxs("div", { className: "flex items-center justify-between gap-4", children: [_jsx("span", { className: "text-sm text-slate-700", children: item.product.title }), _jsxs("span", { className: "text-sm font-semibold text-slate-900", children: ["$", ((item.product.price || 0) * item.quantity).toFixed(2)] })] }, item.product._id || item.product)); }) }), _jsxs("div", { className: "mt-6 border-t border-slate-200 pt-4 text-sm text-slate-600", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { children: "Subtotal" }), _jsxs("span", { children: ["$", subtotal.toFixed(2)] })] }), _jsxs("div", { className: "mt-3 flex items-center justify-between", children: [_jsx("span", { children: "Shipping" }), _jsx("span", { children: "$5.00" })] }), _jsxs("div", { className: "mt-3 flex items-center justify-between", children: [_jsx("span", { children: "Tax" }), _jsx("span", { children: "$2.50" })] }), _jsxs("div", { className: "mt-4 flex items-center justify-between text-lg font-semibold text-slate-900", children: [_jsx("span", { children: "Total" }), _jsxs("span", { children: ["$", (subtotal + 7.5).toFixed(2)] })] })] })] })] }));
}
