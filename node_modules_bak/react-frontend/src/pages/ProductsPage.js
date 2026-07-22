var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { productsApi } from '../api/products.api';
import { ProductCard } from '../components/ProductCard';
import { SectionHeader } from '../components/SectionHeader';
import { LoadingSpinner } from '../components/LoadingSpinner';
var sortOptions = [
    { value: 'priceAsc', label: 'Price low to high' },
    { value: 'priceDesc', label: 'Price high to low' },
    { value: 'rating', label: 'Top rated' },
    { value: 'newest', label: 'Newest' },
];
export default function ProductsPage() {
    var _a, _b, _c, _d, _e;
    var _f = useState({ page: 1, limit: 12 }), query = _f[0], setQuery = _f[1];
    var _g = useState(''), search = _g[0], setSearch = _g[1];
    var _h = useState(''), filterCategory = _h[0], setFilterCategory = _h[1];
    var _j = useState(''), filterBrand = _j[0], setFilterBrand = _j[1];
    var _k = useState('priceAsc'), sortBy = _k[0], setSortBy = _k[1];
    var _l = useState(true), inStock = _l[0], setInStock = _l[1];
    var filtersQuery = useQuery({
        queryKey: ['productFilters'],
        queryFn: productsApi.getFilters,
    });
    var productsQuery = useQuery({
        queryKey: ['productList', query, filterCategory, filterBrand, sortBy, search, inStock],
        queryFn: function () { return productsApi.list(__assign(__assign({}, query), { search: search || undefined, category: filterCategory || undefined, brand: filterBrand || undefined, sortBy: sortBy, inStock: inStock })); },
    });
    useEffect(function () {
        setQuery(function (current) { return (__assign(__assign({}, current), { page: 1 })); });
    }, [filterCategory, filterBrand, search, sortBy, inStock]);
    var products = ((_a = productsQuery.data) === null || _a === void 0 ? void 0 : _a.data) || [];
    var totalPages = ((_b = productsQuery.data) === null || _b === void 0 ? void 0 : _b.meta.pages) || 1;
    return (_jsxs("div", { className: "space-y-12", children: [_jsx(SectionHeader, { title: "Shop products", subtitle: "Discover premium items, filter by brand, category, price, and rating." }), _jsxs("div", { className: "grid gap-8 xl:grid-cols-[280px_1fr]", children: [_jsxs("aside", { className: "space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm", children: [_jsxs("div", { className: "space-y-3", children: [_jsx("h3", { className: "text-lg font-semibold text-slate-900", children: "Search" }), _jsx("input", { value: search, onChange: function (event) { return setSearch(event.target.value); }, placeholder: "Search products", className: "w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "text-lg font-semibold text-slate-900", children: "Filters" }), _jsxs("div", { className: "space-y-3", children: [_jsx("label", { className: "block text-sm font-medium text-slate-600", children: "Category" }), _jsxs("select", { value: filterCategory, onChange: function (event) { return setFilterCategory(event.target.value); }, className: "w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none", children: [_jsx("option", { value: "", children: "All categories" }), (_c = filtersQuery.data) === null || _c === void 0 ? void 0 : _c.categories.map(function (category) { return (_jsx("option", { value: category, children: category }, category)); })] })] }), _jsxs("div", { className: "space-y-3", children: [_jsx("label", { className: "block text-sm font-medium text-slate-600", children: "Brand" }), _jsxs("select", { value: filterBrand, onChange: function (event) { return setFilterBrand(event.target.value); }, className: "w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none", children: [_jsx("option", { value: "", children: "All brands" }), (_d = filtersQuery.data) === null || _d === void 0 ? void 0 : _d.brands.map(function (brand) { return (_jsx("option", { value: brand, children: brand }, brand)); })] })] }), _jsxs("div", { className: "space-y-3", children: [_jsx("label", { className: "block text-sm font-medium text-slate-600", children: "Sort by" }), _jsx("select", { value: sortBy, onChange: function (event) { return setSortBy(event.target.value); }, className: "w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none", children: sortOptions.map(function (option) { return (_jsx("option", { value: option.value, children: option.label }, option.value)); }) })] }), _jsxs("label", { className: "inline-flex items-center gap-3 text-sm text-slate-700", children: [_jsx("input", { type: "checkbox", checked: inStock, onChange: function (event) { return setInStock(event.target.checked); }, className: "h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" }), "In stock only"] })] })] }), _jsxs("section", { className: "space-y-6", children: [productsQuery.isLoading ? (_jsx(LoadingSpinner, {})) : productsQuery.isError ? (_jsx("div", { className: "rounded-3xl bg-white p-10 text-center text-slate-600 shadow-sm", children: "Unable to load products." })) : (_jsx("div", { className: "grid gap-6 sm:grid-cols-2 xl:grid-cols-3", children: products.map(function (product) { return (_jsx(ProductCard, { product: product }, product._id)); }) })), _jsxs("div", { className: "flex items-center justify-between rounded-3xl bg-white p-5 shadow-sm", children: [_jsxs("p", { className: "text-sm text-slate-600", children: ["Showing ", products.length, " of ", ((_e = productsQuery.data) === null || _e === void 0 ? void 0 : _e.meta.total) || 0, " products"] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { disabled: query.page === 1, onClick: function () { return setQuery(function (current) { return (__assign(__assign({}, current), { page: Math.max(1, (current.page || 1) - 1) })); }); }, className: "rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-50", children: "Prev" }), _jsxs("span", { className: "text-sm text-slate-600", children: ["Page ", query.page, " of ", totalPages] }), _jsx("button", { disabled: query.page === totalPages, onClick: function () { return setQuery(function (current) { return (__assign(__assign({}, current), { page: Math.min(totalPages, (current.page || 1) + 1) })); }); }, className: "rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-50", children: "Next" })] })] })] })] })] }));
}
