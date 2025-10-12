// src/pages/VerifyOtpPage.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { verifyOtp } from '../features/auth/authSlice';
import { toast } from "sonner";
import { Loader2, GalleryVerticalEnd } from "lucide-react"; // Icons
import { Button } from "@/components/ui/button";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import backgroundImage from "@/assets/background.png";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx";

const VerifyOtpPage = () => {
    const [otp, setOtp] = useState('');
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const { loading, authStage } = useAppSelector((state) => state.auth);
    const isPending = loading === 'pending';

    // Redirect logic remains the same.
    useEffect(() => {
        if (authStage === 'loggedIn') {
            navigate('/dashboard'); // Navigate to dashboard on successful login
        }
        if (authStage === 'loggedOut') {
            navigate('/login');
        }
    }, [authStage, navigate]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length < 6) {
            toast.error("Please enter a valid 6-digit code.");
            return;
        }

        const promise = dispatch(verifyOtp(otp)).unwrap();

        toast.promise(promise, {
            loading: 'Verifying code...',
            success: 'Verification successful! Redirecting...',
            error: (err) => err || 'Invalid OTP code or server error.',
        });
    };

    // This allows submitting the form when the OTP is fully entered
    useEffect(() => {
        if (otp.length === 6) {
            // We wrap this in a form element to keep the submit logic consistent
            const form = document.getElementById('otp-form') as HTMLFormElement | null;
            if (form) {
                form.requestSubmit();
            }
        }
    }, [otp]);


    return (
        <div className="grid min-h-svh lg:grid-cols-2">
            <div className="flex flex-col gap-4 p-6 md:p-10">
                <div className="flex justify-center gap-2 md:justify-start">
                    <a href="#" className="flex items-center gap-2 font-medium">
                        <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
                            <GalleryVerticalEnd className="size-4" />
                        </div>
                        Clinic Dashboard
                    </a>
                </div>
                <div className="flex flex-1 items-center justify-center">
                    <Card className="w-full max-w-sm">
                        <CardHeader className="text-center">
                            <CardTitle className="text-2xl">Two-Factor Authentication</CardTitle>
                            <CardDescription>
                                Enter the 6-digit code sent to your device.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form id="otp-form" onSubmit={handleSubmit} className="flex flex-col gap-8">
                                <div className="flex justify-center">
                                    <InputOTP
                                        maxLength={6}
                                        value={otp}
                                        onChange={(value) => setOtp(value)}
                                        disabled={isPending}
                                    >
                                        <InputOTPGroup>
                                            <InputOTPSlot index={0} />
                                            <InputOTPSlot index={1} />
                                            <InputOTPSlot index={2} />
                                            <InputOTPSlot index={3} />
                                            <InputOTPSlot index={4} />
                                            <InputOTPSlot index={5} />
                                        </InputOTPGroup>
                                    </InputOTP>
                                </div>
                                <Button type="submit" className="w-full" disabled={isPending || otp.length < 6}>
                                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {isPending ? 'Verifying...' : 'Verify Code'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
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

export default VerifyOtpPage;