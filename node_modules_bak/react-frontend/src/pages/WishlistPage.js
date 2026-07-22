import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useQuery, useMutation } from '@tanstack/react-query';
import { usersApi } from '../api/users.api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
export default function WishlistPage() {
    var navigate = useNavigate();
    var wishlistQuery = useQuery({
        queryKey: ['wishlist'],
        queryFn: usersApi.wishlist,
    });
    var removeMutation = useMutation({
        mutationFn: usersApi.removeFromWishlist,
        onSuccess: function () {
            toast.success('Removed from wishlist');
            wishlistQuery.refetch();
        },
    });
    if (wishlistQuery.isPending) {
        return _jsx(LoadingSpinner, {});
    }
    if (wishlistQuery.isError) {
        return (_jsx("div", { className: "rounded-3xl bg-white p-10 text-center text-slate-600 shadow-sm", children: "Unable to load wishlist." }));
    }
    var wishlist = wishlistQuery.data || [];
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "rounded-3xl bg-white p-8 shadow-sm", children: [_jsx("h1", { className: "text-3xl font-semibold text-slate-900", children: "Wishlist" }), _jsx("p", { className: "mt-2 text-sm text-slate-500", children: "Save favorite items and move them to cart quickly." })] }), wishlist.length === 0 ? (_jsx("div", { className: "rounded-3xl bg-white p-10 text-center text-slate-600 shadow-sm", children: "Your wishlist is empty." })) : (_jsx("div", { className: "grid gap-6 md:grid-cols-2", children: wishlist.map(function (item) { return (_jsx("div", { className: "rounded-3xl border border-slate-200 bg-white p-6 shadow-sm", children: _jsxs("div", { className: "flex items-center justify-between gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-lg font-semibold text-slate-900", children: item.title }), _jsxs("p", { className: "text-sm text-slate-500", children: [item.brand, " \u00B7 ", item.category] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: function () { return navigate("/products/".concat(item._id)); }, className: "rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50", children: "View" }), _jsx("button", { onClick: function () { return removeMutation.mutate(item._id); }, disabled: removeMutation.isPending, className: "rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70", children: "Remove" })] })] }) }, item._id)); }) }))] }));
}
