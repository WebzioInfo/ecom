import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productsApi } from '../api/products.api';
import { LoadingSpinner } from '../components/LoadingSpinner';
export default function AdminProductDetailsPage() {
    var _a;
    var id = useParams().id;
    var productQuery = useQuery({
        queryKey: ['adminProduct', id],
        queryFn: function () { return productsApi.getById(id || ''); },
        enabled: !!id,
    });
    if (productQuery.isLoading) {
        return _jsx(LoadingSpinner, {});
    }
    if (productQuery.isError || !productQuery.data) {
        return (_jsx("div", { className: "rounded-3xl bg-white p-10 text-center text-slate-600 shadow-sm", children: "Product not found." }));
    }
    var product = productQuery.data;
    return (_jsxs("div", { className: "space-y-8 rounded-3xl bg-white p-8 shadow-sm", children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-semibold text-slate-900", children: product.title }), _jsxs("p", { className: "text-sm text-slate-500", children: [product.brand, " \u2022 ", product.category] })] }), _jsx("span", { className: "rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700", children: product.isActive ? 'Active' : 'Inactive' })] }), _jsxs("div", { className: "grid gap-6 md:grid-cols-[1.3fr_0.7fr]", children: [_jsxs("div", { className: "space-y-4", children: [_jsx("img", { src: ((_a = product.images) === null || _a === void 0 ? void 0 : _a[0]) || 'https://via.placeholder.com/700x400', alt: product.title, className: "w-full rounded-3xl object-cover" }), _jsxs("div", { className: "rounded-3xl border border-slate-200 p-6", children: [_jsx("h2", { className: "text-lg font-semibold text-slate-900", children: "Description" }), _jsx("p", { className: "mt-3 text-sm text-slate-600", children: product.description })] })] }), _jsxs("aside", { className: "space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-6", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-slate-500", children: "Price" }), _jsxs("p", { className: "mt-2 text-2xl font-semibold text-slate-900", children: ["$", product.price.toFixed(2)] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-slate-500", children: "Stock" }), _jsx("p", { className: "mt-2 text-lg font-semibold text-slate-900", children: product.stock })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-slate-500", children: "Rating" }), _jsx("p", { className: "mt-2 text-lg font-semibold text-slate-900", children: product.rating.toFixed(1) })] })] })] })] }));
}
