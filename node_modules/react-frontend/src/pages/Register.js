import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
export default function Register() {
    var navigate = useNavigate();
    var registerMutation = useAuth().registerMutation;
    var _a = useState(''), name = _a[0], setName = _a[1];
    var _b = useState(''), email = _b[0], setEmail = _b[1];
    var _c = useState(''), password = _c[0], setPassword = _c[1];
    var handleSubmit = function (e) {
        e.preventDefault();
        registerMutation.mutate({ name: name, email: email, password: password }, {
            onSuccess: function () {
                toast.success('Account created successfully. Please log in.');
                navigate('/login');
            },
            onError: function () {
                toast.error('Could not create account. Please try again.');
            },
        });
    };
    return (_jsx("div", { className: "flex min-h-[calc(100vh-6rem)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8", children: _jsxs("div", { className: "w-full max-w-md space-y-8 rounded-[2rem] bg-white p-10 shadow-xl shadow-slate-200/50 border border-slate-100", children: [_jsxs("div", { className: "space-y-3 text-center", children: [_jsx("h2", { className: "text-3xl font-semibold text-slate-900", children: "Create your Commerce Pro account" }), _jsx("p", { className: "text-sm text-slate-500", children: "Secure signup for customers and team members." })] }), _jsxs("form", { className: "space-y-6", onSubmit: handleSubmit, children: [registerMutation.isError && (_jsx("div", { className: "rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-100", children: "Registration failed." })), _jsxs("div", { className: "space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-5", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "name", className: "block text-sm font-medium text-slate-700", children: "Full name" }), _jsx("input", { id: "name", type: "text", value: name, onChange: function (event) { return setName(event.target.value); }, required: true, className: "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "email", className: "block text-sm font-medium text-slate-700", children: "Email address" }), _jsx("input", { id: "email", type: "email", value: email, onChange: function (event) { return setEmail(event.target.value); }, required: true, className: "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "password", className: "block text-sm font-medium text-slate-700", children: "Password" }), _jsx("input", { id: "password", type: "password", value: password, onChange: function (event) { return setPassword(event.target.value); }, required: true, className: "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200" })] })] }), _jsx("button", { type: "submit", disabled: registerMutation.isPending, className: "w-full rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition disabled:cursor-not-allowed disabled:opacity-70", children: registerMutation.isPending ? 'Creating account...' : 'Create account' })] }), _jsxs("p", { className: "text-center text-sm text-slate-500", children: ["Already registered?", ' ', _jsx(Link, { to: "/login", className: "font-semibold text-indigo-600 hover:text-indigo-500", children: "Sign in" })] })] }) }));
}
