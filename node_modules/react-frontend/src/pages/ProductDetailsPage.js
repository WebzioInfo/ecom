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
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { productsApi } from '../api/products.api';
import { cartApi } from '../api/cart.api';
import { usersApi } from '../api/users.api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
export default function ProductDetailsPage() {
    var _this = this;
    var _a;
    var id = useParams().id;
    var navigate = useNavigate();
    var _b = useState(1), quantity = _b[0], setQuantity = _b[1];
    var productQuery = useQuery({
        queryKey: ['product', id],
        queryFn: function () { return productsApi.getById(id || ''); },
        enabled: !!id,
    });
    var addToWishlistMutation = useMutation({
        mutationFn: function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, usersApi.addToWishlist(id || '')];
        }); }); },
        onSuccess: function () {
            toast.success('Saved to wishlist');
        },
        onError: function () {
            toast.error('Unable to save to wishlist');
        },
    });
    var handleAddToCart = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!id)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, cartApi.add({ productId: id, quantity: quantity })];
                case 2:
                    _a.sent();
                    toast.success('Added to cart');
                    navigate('/cart');
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    toast.error('Unable to add product to cart');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    if (productQuery.isLoading) {
        return _jsx(LoadingSpinner, {});
    }
    if (productQuery.isError || !productQuery.data) {
        return (_jsx("div", { className: "rounded-3xl bg-white p-10 text-center text-slate-600 shadow-sm", children: "Product not found." }));
    }
    var product = productQuery.data;
    var discountedPrice = product.price.toFixed(2);
    var mrpPrice = (product.price / (1 - product.discount / 100)).toFixed(2);
    return (_jsxs("div", { className: "grid gap-10 lg:grid-cols-[1.1fr_0.9fr]", children: [_jsxs("section", { className: "space-y-8 rounded-3xl bg-white p-8 shadow-sm", children: [_jsxs("div", { className: "grid gap-4 lg:grid-cols-[1.05fr_0.95fr]", children: [_jsx("div", { className: "overflow-hidden rounded-3xl border border-slate-200 bg-slate-50", children: _jsx("img", { src: ((_a = product.images) === null || _a === void 0 ? void 0 : _a[0]) || 'https://via.placeholder.com/700x700', alt: product.title, className: "h-full w-full object-cover" }) }), _jsxs("div", { className: "rounded-3xl border border-slate-200 p-6", children: [_jsx("p", { className: "text-sm font-semibold uppercase tracking-[0.3em] text-indigo-600", children: product.brand }), _jsx("h1", { className: "mt-4 text-4xl font-semibold text-slate-900", children: product.title }), _jsx("p", { className: "mt-4 text-sm text-slate-500", children: product.category }), _jsxs("div", { className: "mt-6 flex items-center gap-4", children: [_jsxs("span", { className: "text-3xl font-bold text-slate-900", children: ["$", discountedPrice] }), _jsxs("span", { className: "text-sm text-slate-500 line-through", children: ["$", mrpPrice] })] }), _jsxs("div", { className: "mt-6 grid gap-4", children: [_jsxs("div", { className: "rounded-2xl bg-slate-50 p-4 text-sm text-slate-700", children: [_jsxs("p", { children: ["Rating: ", product.rating.toFixed(1), " / 5"] }), _jsx("p", { children: product.stock > 0 ? 'In stock' : 'Out of stock' })] }), _jsx("p", { className: "text-sm text-slate-600", children: product.description }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("label", { className: "text-sm font-medium text-slate-700", children: "Quantity" }), _jsx("input", { type: "number", min: 1, value: quantity, onChange: function (event) { return setQuantity(Number(event.target.value)); }, className: "w-24 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none" })] }), _jsxs("div", { className: "grid gap-3 sm:grid-cols-3", children: [_jsx("button", { onClick: handleAddToCart, className: "rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition", children: "Add to Cart" }), _jsx("button", { onClick: function () { return addToWishlistMutation.mutate(); }, className: "rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50 transition", children: "Save to wishlist" }), _jsx("button", { onClick: function () { return toast('Buy now flow not supported yet'); }, className: "rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50 transition", children: "Buy Now" })] })] })] })] }), _jsxs("div", { className: "rounded-3xl border border-slate-200 bg-slate-50 p-6", children: [_jsx("h2", { className: "text-xl font-semibold text-slate-900", children: "Product details" }), _jsx("p", { className: "mt-4 text-sm text-slate-600", children: "This premium listing includes the brand, category, stock, rating, and rich product text for shoppers to engage with." })] })] }), _jsx("aside", { className: "space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm", children: _jsxs("div", { className: "space-y-3", children: [_jsx("h2", { className: "text-lg font-semibold text-slate-900", children: "Order summary" }), _jsxs("div", { className: "flex items-center justify-between text-sm text-slate-600", children: [_jsx("span", { children: "Unit price" }), _jsxs("span", { children: ["$", discountedPrice] })] }), _jsxs("div", { className: "flex items-center justify-between text-sm text-slate-600", children: [_jsx("span", { children: "Quantity" }), _jsx("span", { children: quantity })] }), _jsxs("div", { className: "border-t border-slate-200 pt-4 text-lg font-semibold text-slate-900 flex items-center justify-between", children: [_jsx("span", { children: "Total" }), _jsxs("span", { children: ["$", (product.price * quantity).toFixed(2)] })] })] }) })] }));
}
