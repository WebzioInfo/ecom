import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useQuery } from '@tanstack/react-query';
import { productsApi } from '../api/products.api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Link } from 'react-router-dom';
export default function AdminProductsPage() {
    var _a;
    var productsQuery = useQuery({
        queryKey: ['adminProducts'],
        queryFn: function () { return productsApi.list({ limit: 50 }); },
    });
    if (productsQuery.isLoading) {
        return _jsx(LoadingSpinner, {});
    }
    if (productsQuery.isError) {
        return (_jsx("div", { className: "rounded-3xl bg-white p-10 text-center text-slate-600 shadow-sm", children: "Unable to load products." }));
    }
    var products = ((_a = productsQuery.data) === null || _a === void 0 ? void 0 : _a.data) || [];
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "rounded-3xl bg-white p-8 shadow-sm", children: [_jsx("h1", { className: "text-3xl font-semibold text-slate-900", children: "Product catalog" }), _jsx("p", { className: "mt-2 text-sm text-slate-500", children: "Edit and manage product listings from a single view." })] }), _jsx("div", { className: "grid gap-6", children: products.map(function (product) { return (_jsx(Link, { to: "/admin/products/".concat(product._id), className: "rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5", children: _jsxs("div", { className: "flex items-center justify-between gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-lg font-semibold text-slate-900", children: product.title }), _jsxs("p", { className: "text-sm text-slate-500", children: [product.brand, " \u00B7 ", product.category] })] }), _jsxs("span", { className: "text-sm font-semibold text-indigo-600", children: ["$", product.price.toFixed(2)] })] }) }, product._id)); }) })] }));
}
