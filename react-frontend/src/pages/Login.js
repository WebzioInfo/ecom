import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
export default function Login() {
    var navigate = useNavigate();
    var loginMutation = useAuth().loginMutation;
    var _a = useState(''), email = _a[0], setEmail = _a[1];
    var _b = useState(''), password = _b[0], setPassword = _b[1];
    var onSuccess = function () {
        toast.success('Welcome back!');
        navigate('/');
    };
    var handleSubmit = function (e) {
        e.preventDefault();
        loginMutation.mutate({ email: email, password: password }, { onSuccess: onSuccess });
    };
    return (_jsx("div", { className: "flex min-h-[calc(100vh-6rem)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8", children: _jsxs("div", { className: "w-full max-w-md space-y-8 rounded-[2rem] bg-white p-10 shadow-xl shadow-slate-200/50 border border-slate-100", children: [_jsxs("div", { className: "space-y-3 text-center", children: [_jsx("h2", { className: "text-3xl font-semibold text-slate-900", children: "Sign in to Commerce Pro" }), _jsx("p", { className: "text-sm text-slate-500", children: "Secure access for shoppers and store managers." })] }), _jsxs("form", { className: "space-y-6", onSubmit: handleSubmit, children: [loginMutation.isError && (_jsx("div", { className: "rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-100", children: "Invalid credentials." })), _jsxs("div", { className: "space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-5", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "email", className: "block text-sm font-medium text-slate-700", children: "Email address" }), _jsx("input", { id: "email", type: "email", value: email, onChange: function (event) { return setEmail(event.target.value); }, required: true, className: "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "password", className: "block text-sm font-medium text-slate-700", children: "Password" }), _jsx("input", { id: "password", type: "password", value: password, onChange: function (event) { return setPassword(event.target.value); }, required: true, className: "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" })] })] }), _jsx("button", { type: "submit", disabled: loginMutation.isPending, className: "w-full rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition disabled:cursor-not-allowed disabled:opacity-70", children: loginMutation.isPending ? 'Signing in...' : 'Sign in' })] }), _jsxs("p", { className: "text-center text-sm text-slate-500", children: ["New user?", ' ', _jsx(Link, { to: "/register", className: "font-semibold text-indigo-600 hover:text-indigo-500", children: "Create an account" })] })] }) }));
}
