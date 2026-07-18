import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
export function AdminLayout() {
    var logout = useAuthStore(function (state) { return state.logout; });
    return (_jsxs("div", { className: "min-h-screen bg-slate-50 text-slate-900", children: [_jsx("header", { className: "sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur", children: _jsxs("div", { className: "mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8", children: [_jsx(Link, { to: "/admin", className: "text-xl font-semibold text-slate-900", children: "Admin Hub" }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Link, { to: "/admin/products", className: "text-sm font-medium text-slate-600 hover:text-slate-900 transition", children: "Products" }), _jsx(Link, { to: "/admin/orders", className: "text-sm font-medium text-slate-600 hover:text-slate-900 transition", children: "Orders" }), _jsx("button", { onClick: logout, className: "rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition", children: "Sign out" })] })] }) }), _jsx("main", { className: "mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8", children: _jsx(Outlet, {}) })] }));
}
