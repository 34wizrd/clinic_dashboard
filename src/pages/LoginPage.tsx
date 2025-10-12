// src/pages/LoginPage.tsx

import { useState, useEffect } from 'react';
import {Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../features/auth/authSlice';
import { toast } from "sonner";
import { Loader2 } from "lucide-react"; // Icons
import backgroundImage from '@/assets/background.png'; // Usi

// Import Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppDispatch, useAppSelector } from '@/hooks/hooks';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const { loading, authStage } = useAppSelector((state) => state.auth);
    const isPending = loading === 'pending';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Dispatch the thunk and use toast.promise for automatic feedback
        const promise = dispatch(loginUser({ email, password })).unwrap();

        toast.promise(promise, {
            loading: 'Signing in...',
            // Success is handled by the useEffect redirect, so no toast is needed
            error: (err) => err || 'Invalid credentials or server error.', // Display the error message from Redux
        });
    };

    // Redirect logic remains the same.
    useEffect(() => {
        if (authStage === 'otpRequired') {
            navigate('/verify-otp');
        }
        if (authStage === 'loggedIn') {
            navigate('/dashboard');
        }
    }, [authStage, navigate]);

    return (
        <div className="grid min-h-svh lg:grid-cols-2">
            <div className="flex flex-col gap-4 p-6 md:p-10">
                <div className="flex justify-center gap-2 md:justify-start">
                    <a href="#" className="flex items-center gap-2 font-medium">
                        <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
                            <img src="./logo1.png" alt="Clinic Logo" className="size-4" />
                        </div>
                        Gong Clinic
                    </a>
                </div>
                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-xs">
                        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                            <div className="flex flex-col items-center gap-2 text-center">
                                <h1 className="text-2xl font-bold">Login to your account</h1>
                                <p className="text-muted-foreground text-sm text-balance">
                                    Enter your email below to login to your account.
                                </p>
                            </div>
                            <div className="grid gap-6">
                                <div className="grid gap-3">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="admin@example.com"
                                        autoComplete="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={isPending}
                                    />
                                </div>
                                <div className="grid gap-3">
                                    <div className="flex items-center">
                                        <Label htmlFor="password">Password</Label>
                                        <a
                                            href="#"
                                            className="ml-auto text-sm underline-offset-4 hover:underline"
                                        >
                                            Forgot your password?
                                        </a>
                                    </div>
                                    <Input
                                        id="password"
                                        type="password"
                                        autoComplete="current-password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={isPending}
                                    />
                                </div>
                                <Button type="submit" className="w-full" disabled={isPending}>
                                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {isPending ? 'Please wait' : 'Sign In'}
                                </Button>
                            </div>
                            <div className="text-center text-sm">
                                Don't have an account?{" "}
                                <Link to="/signup" className="underline">
                                    Sign Up
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <div className="bg-muted relative hidden lg:block">
                <img
                    width={1920}
                    height={1080}
                    src={backgroundImage}
                    alt="Abstract background"
                    className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.3]"
                />
            </div>
        </div>
    );
};

export default LoginPage;