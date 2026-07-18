import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '../api/orders.api';
import { LoadingSpinner } from '../components/LoadingSpinner';
export default function OrderDetailsPage() {
    var id = useParams().id;
    var orderQuery = useQuery({
        queryKey: ['order', id],
        queryFn: function () { return ordersApi.getById(id || ''); },
        enabled: !!id,
    });
    if (orderQuery.isLoading) {
        return _jsx(LoadingSpinner, {});
    }
    if (orderQuery.isError || !orderQuery.data) {
        return (_jsx("div", { className: "rounded-3xl bg-white p-10 text-center text-slate-600 shadow-sm", children: "Order not found." }));
    }
    var order = orderQuery.data;
    return (_jsxs("div", { className: "space-y-8 rounded-3xl bg-white p-8 shadow-sm", children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-4", children: [_jsxs("div", { children: [_jsxs("h1", { className: "text-3xl font-semibold text-slate-900", children: ["Order #", order._id.slice(-6).toUpperCase()] }), _jsxs("p", { className: "text-sm text-slate-500", children: ["Placed on ", new Date(order.createdAt).toLocaleDateString()] })] }), _jsx("span", { className: "rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700", children: order.status })] }), _jsxs("div", { className: "grid gap-6 md:grid-cols-[1.4fr_0.6fr]", children: [_jsx("div", { className: "space-y-4", children: order.items.map(function (item) { return (_jsx("div", { className: "rounded-3xl border border-slate-200 p-5", children: _jsxs("div", { className: "flex items-center justify-between gap-3", children: [_jsxs("div", { children: [_jsx("p", { className: "font-semibold text-slate-900", children: item.product.title || 'Product' }), _jsxs("p", { className: "text-sm text-slate-500", children: ["Qty: ", item.quantity] })] }), _jsxs("span", { className: "text-sm font-semibold text-slate-900", children: ["$", item.priceAtPurchase.toFixed(2)] })] }) }, item.product._id || item.product)); }) }), _jsxs("aside", { className: "rounded-3xl border border-slate-200 bg-slate-50 p-6", children: [_jsx("h2", { className: "text-xl font-semibold text-slate-900", children: "Order summary" }), _jsxs("div", { className: "mt-4 space-y-3 text-sm text-slate-600", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { children: "Items" }), _jsx("span", { children: order.items.length })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { children: "Total" }), _jsxs("span", { children: ["$", order.totalAmount.toFixed(2)] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { children: "Payment" }), _jsx("span", { children: "WhatsApp" })] })] })] })] })] }));
}
