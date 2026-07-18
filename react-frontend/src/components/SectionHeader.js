import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function SectionHeader(_a) {
    var title = _a.title, subtitle = _a.subtitle;
    return (_jsxs("div", { className: "mb-8 flex flex-col gap-2", children: [_jsx("p", { className: "text-sm font-semibold uppercase tracking-[0.3em] text-indigo-600", children: "Explore" }), _jsx("h2", { className: "text-3xl font-semibold text-slate-900", children: title }), subtitle ? _jsx("p", { className: "max-w-2xl text-slate-500", children: subtitle }) : null] }));
}
