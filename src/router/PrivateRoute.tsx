// src/router/PrivateRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import {useAppSelector} from "../hooks/hooks.ts";

const PrivateRoute = () => {
    const { authStage, loading, user } = useAppSelector((state) => state.auth);

    // When refreshing, the user object will be null initially.
    // We should wait until the initial fetchUser call is done.
    // If authStage is loggedIn but we don't have a user yet, and we are loading,
    // we show a blank screen (or a spinner) to prevent a flicker.
    if (authStage === 'loggedIn' && !user && loading === 'pending') {
        return null; // Or you can return a <FullScreenSpinner /> component here
    }

    return authStage === 'loggedIn' ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;