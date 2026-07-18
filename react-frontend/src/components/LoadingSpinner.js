import { jsx as _jsx } from "react/jsx-runtime";
export function LoadingSpinner() {
    return (_jsx("div", { className: "flex items-center justify-center py-20", children: _jsx("div", { className: "h-10 w-10 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" }) }));
}
