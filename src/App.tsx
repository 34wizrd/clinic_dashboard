// src/App.tsx
import { useEffect } from 'react';
import AppRouter from './router/AppRouter';
import { fetchUser } from './features/auth/authSlice';
import {useAppDispatch, useAppSelector} from "./hooks/hooks.ts";

function App() {
    const dispatch = useAppDispatch();
    // We select the authStage which is determined synchronously from localStorage on initial load
    const authStage = useAppSelector((state) => state.auth.authStage);

    useEffect(() => {
        // If the initial state from localStorage determines we are logged in,
        // we need to fetch the user's data to populate the user object in the redux state.
        // This restores the user session across page refreshes.
        if (authStage === 'loggedIn') {
            dispatch(fetchUser());
        }
    }, [authStage, dispatch]); // This effect runs once when the app loads and authStage is first determined

    return <AppRouter />;
}

export default App;