// src/router/AdminRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import {useAppSelector} from "../hooks/hooks.ts";

const AdminRoute = () => {
    const { user } = useAppSelector((state) => state.auth);

    // On refresh, the user object is null until the fetchUser call completes.
    // This check gracefully handles that initial loading state by showing nothing.
    if (!user) {
        return null; // Or a spinner component
    }

    return user.role_name === 'admin' ? <Outlet /> : <Navigate to="/dashboard" replace />;
};

export default AdminRoute;