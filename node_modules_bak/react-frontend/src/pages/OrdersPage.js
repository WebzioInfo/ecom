import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '../api/orders.api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Link } from 'react-router-dom';
export default function OrdersPage() {
    var ordersQuery = useQuery({
        queryKey: ['orders'],
        queryFn: ordersApi.list,
    });
    if (ordersQuery.isLoading) {
        return _jsx(LoadingSpinner, {});
    }
    if (ordersQuery.isError) {
        return (_jsx("div", { className: "rounded-3xl bg-white p-10 text-center text-slate-600 shadow-sm", children: "Unable to load orders." }));
    }
    var orders = ordersQuery.data || [];
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "rounded-3xl bg-white p-8 shadow-sm", children: [_jsx("h1", { className: "text-3xl font-semibold text-slate-900", children: "My orders" }), _jsx("p", { className: "mt-2 text-sm text-slate-500", children: "Track new purchases and revisit completed orders." })] }), orders.length === 0 ? (_jsx("div", { className: "rounded-3xl bg-white p-10 text-center text-slate-600 shadow-sm", children: "No orders yet." })) : (_jsx("div", { className: "grid gap-6", children: orders.map(function (order) { return (_jsxs(Link, { to: "/orders/".concat(order._id), className: "rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5", children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-4", children: [_jsxs("div", { children: [_jsxs("p", { className: "text-lg font-semibold text-slate-900", children: ["Order #", order._id.slice(-6).toUpperCase()] }), _jsx("p", { className: "text-sm text-slate-500", children: new Date(order.createdAt).toLocaleDateString() })] }), _jsx("span", { className: "rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700", children: order.status })] }), _jsxs("div", { className: "mt-4 grid gap-3 text-sm text-slate-600", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { children: "Items" }), _jsx("span", { children: order.items.length })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { children: "Total" }), _jsxs("span", { children: ["$", order.totalAmount.toFixed(2)] })] })] })] }, order._id)); }) }))] }));
}
