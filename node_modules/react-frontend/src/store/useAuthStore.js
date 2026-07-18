import { create } from 'zustand';
export var useAuthStore = create(function (set) { return ({
    user: null,
    isAuthenticated: false,
    setUser: function (user) { return set({ user: user, isAuthenticated: !!user }); },
    logout: function () {
        localStorage.removeItem('access_token');
        set({ user: null, isAuthenticated: false });
    },
}); });
