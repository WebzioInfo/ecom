import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Routes, Route } from 'react-router-dom';
import { CustomerLayout } from './layouts/CustomerLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { ProtectedRoute } from './hooks/useProtectedRoute';
import LandingPage from './pages/LandingPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import Login from './pages/Login';
import Register from './pages/Register';
import WishlistPage from './pages/WishlistPage';
import ProfilePage from './pages/ProfilePage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminProductsPage from './pages/AdminProductsPage';
import AdminProductDetailsPage from './pages/AdminProductDetailsPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import AdminOrderDetailsPage from './pages/AdminOrderDetailsPage';
import NotFoundPage from './pages/NotFoundPage';
export default function App() {
    return (_jsxs(Routes, { children: [_jsxs(Route, { path: "/", element: _jsx(CustomerLayout, {}), children: [_jsx(Route, { index: true, element: _jsx(LandingPage, {}) }), _jsx(Route, { path: "products", element: _jsx(ProductsPage, {}) }), _jsx(Route, { path: "products/:id", element: _jsx(ProductDetailsPage, {}) }), _jsx(Route, { path: "cart", element: _jsx(ProtectedRoute, { children: _jsx(CartPage, {}) }) }), _jsx(Route, { path: "checkout", element: _jsx(ProtectedRoute, { children: _jsx(CheckoutPage, {}) }) }), _jsx(Route, { path: "wishlist", element: _jsx(ProtectedRoute, { children: _jsx(WishlistPage, {}) }) }), _jsx(Route, { path: "orders", element: _jsx(ProtectedRoute, { children: _jsx(OrdersPage, {}) }) }), _jsx(Route, { path: "orders/:id", element: _jsx(ProtectedRoute, { children: _jsx(OrderDetailsPage, {}) }) }), _jsx(Route, { path: "profile", element: _jsx(ProtectedRoute, { children: _jsx(ProfilePage, {}) }) }), _jsx(Route, { path: "login", element: _jsx(Login, {}) }), _jsx(Route, { path: "register", element: _jsx(Register, {}) })] }), _jsxs(Route, { path: "/admin", element: _jsx(ProtectedRoute, { role: "admin", children: _jsx(AdminLayout, {}) }), children: [_jsx(Route, { index: true, element: _jsx(AdminDashboardPage, {}) }), _jsx(Route, { path: "products", element: _jsx(AdminProductsPage, {}) }), _jsx(Route, { path: "products/:id", element: _jsx(AdminProductDetailsPage, {}) }), _jsx(Route, { path: "orders", element: _jsx(AdminOrdersPage, {}) }), _jsx(Route, { path: "orders/:id", element: _jsx(AdminOrderDetailsPage, {}) })] }), _jsx(Route, { path: "*", element: _jsx(NotFoundPage, {}) })] }));
}
