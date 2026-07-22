import { jsx as _jsx } from "react/jsx-runtime";
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
export var ProtectedRoute = function (_a) {
    var children = _a.children, role = _a.role;
    var _b = useAuthStore(), isAuthenticated = _b.isAuthenticated, user = _b.user;
    if (!isAuthenticated) {
        return _jsx(Navigate, { to: "/login", replace: true });
    }
    if (role && !(user === null || user === void 0 ? void 0 : user.roles.includes(role))) {
        return _jsx(Navigate, { to: "/", replace: true });
    }
    return children;
};
