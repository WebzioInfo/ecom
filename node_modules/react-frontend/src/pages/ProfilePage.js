var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { usersApi } from '../api/users.api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { toast } from 'react-hot-toast';
export default function ProfilePage() {
    var _this = this;
    var _a;
    var _b = useState(''), name = _b[0], setName = _b[1];
    var _c = useState(''), email = _c[0], setEmail = _c[1];
    var profileQuery = useQuery({
        queryKey: ['profile'],
        queryFn: usersApi.profile,
    });
    useEffect(function () {
        if (profileQuery.data) {
            setName(profileQuery.data.name);
            setEmail(profileQuery.data.email);
        }
    }, [profileQuery.data]);
    var updateMutation = useMutation({
        mutationFn: function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, usersApi.updateProfile({ name: name, email: email })];
        }); }); },
        onSuccess: function () {
            toast.success('Profile updated successfully');
        },
        onError: function () {
            toast.error('Could not update profile.');
        },
    });
    if (profileQuery.isPending) {
        return _jsx(LoadingSpinner, {});
    }
    if (profileQuery.isError) {
        return (_jsx("div", { className: "rounded-3xl bg-white p-10 text-center text-slate-600 shadow-sm", children: "Unable to load profile." }));
    }
    return (_jsxs("div", { className: "grid gap-8 lg:grid-cols-[1.2fr_0.8fr]", children: [_jsxs("section", { className: "rounded-3xl bg-white p-8 shadow-sm", children: [_jsx("h1", { className: "text-3xl font-semibold text-slate-900", children: "My profile" }), _jsx("p", { className: "mt-2 text-sm text-slate-500", children: "Update your account details and keep your preferences up to date." }), _jsxs("form", { onSubmit: function (event) {
                            event.preventDefault();
                            updateMutation.mutate();
                        }, className: "mt-8 space-y-6", children: [_jsxs("div", { className: "grid gap-6 sm:grid-cols-2", children: [_jsxs("label", { className: "space-y-3", children: [_jsx("span", { className: "text-sm font-medium text-slate-700", children: "Name" }), _jsx("input", { value: name, onChange: function (event) { return setName(event.target.value); }, className: "w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none" })] }), _jsxs("label", { className: "space-y-3", children: [_jsx("span", { className: "text-sm font-medium text-slate-700", children: "Email" }), _jsx("input", { value: email, onChange: function (event) { return setEmail(event.target.value); }, type: "email", className: "w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none" })] })] }), _jsx("button", { type: "submit", disabled: updateMutation.isPending, className: "rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition disabled:cursor-not-allowed disabled:opacity-70", children: updateMutation.isPending ? 'Saving...' : 'Save changes' })] })] }), _jsx("aside", { className: "rounded-3xl bg-white p-8 shadow-sm", children: _jsxs("div", { className: "space-y-4", children: [_jsx("h2", { className: "text-xl font-semibold text-slate-900", children: "Account details" }), _jsxs("div", { className: "rounded-3xl bg-slate-50 p-5", children: [_jsx("p", { className: "text-sm text-slate-600", children: "Member since" }), _jsx("p", { className: "mt-2 text-lg font-semibold text-slate-900", children: "Premium shopper" })] }), _jsxs("div", { className: "rounded-3xl bg-slate-50 p-5", children: [_jsx("p", { className: "text-sm text-slate-600", children: "Email" }), _jsx("p", { className: "mt-2 text-lg font-semibold text-slate-900", children: (_a = profileQuery.data) === null || _a === void 0 ? void 0 : _a.email })] })] }) })] }));
}
