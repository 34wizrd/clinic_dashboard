// src/features/auth/ThirdFactorAuthModal.tsx

import React, { useState, useEffect, useRef } from 'react';
import { toast } from "sonner";
import { initiateStepUpAuth, fetchThirdToken } from './authSlice';

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAppDispatch } from '@/hooks/hooks';
import { Loader2, ShieldCheck, Smartphone, AlertCircle } from 'lucide-react';

interface ThirdFactorAuthModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

type AuthStatus = 'idle' | 'initiating' | 'pending_approval' | 'timed_out' | 'error';

const ThirdFactorAuthModal: React.FC<ThirdFactorAuthModalProps> = ({ open, onOpenChange, onSuccess }) => {
    const dispatch = useAppDispatch();
    const [status, setStatus] = useState<AuthStatus>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const pollingInterval = useRef<NodeJS.Timeout | null>(null);
    const timeoutTimer = useRef<NodeJS.Timeout | null>(null);

    const cleanup = () => {
        if (pollingInterval.current) clearInterval(pollingInterval.current);
        if (timeoutTimer.current) clearTimeout(timeoutTimer.current);
        pollingInterval.current = null;
        timeoutTimer.current = null;
    };

    const startAuthorization = async () => {
        cleanup();
        setStatus('initiating');
        try {
            const result = await dispatch(initiateStepUpAuth({
                target_action: 'access_sensitive_data',
                target_resource: 'health_records'
            })).unwrap();

            setStatus('pending_approval');
            toast.info("Push notification sent!", { description: "Please check your mobile device to approve this request." });

            // Set a timeout for the entire process
            timeoutTimer.current = setTimeout(() => {
                setStatus('timed_out');
                cleanup();
            }, result.expires_in_sec * 1000);

            // Start polling to see if the auth is complete
            pollingInterval.current = setInterval(async () => {
                try {
                    await dispatch(fetchThirdToken()).unwrap();
                    // If the above line doesn't throw, we have the token
                    cleanup();
                    toast.success("Authorization successful!");
                    onSuccess(); // This closes the modal via the parent and executes the pending action
                } catch {
                    // This is the expected "error" while we wait for approval. Do nothing.
                    // The 'error' variable is not needed here, resolving the unused-vars lint warning.
                    console.log("Polling for third token...");
                }
            }, 3000); // Poll every 3 seconds

        } catch (error: unknown) { // Explicitly type error as 'unknown'
            setStatus('error');
            // Check if the error is a string (which our getErrorPayload returns)
            if (typeof error === 'string') {
                setErrorMessage(error);
            } else {
                setErrorMessage('Failed to initiate authorization.');
            }
            cleanup();
        }
    };

    useEffect(() => {
        if (open) {
            startAuthorization();
        } else {
            // Cleanup when modal is closed externally
            cleanup();
            setStatus('idle');
        }
        return cleanup; // Cleanup on unmount
    }, [open]);

    const renderContent = () => {
        switch (status) {
            case 'initiating':
                return (
                    <div className="flex flex-col items-center justify-center h-32">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="mt-4 text-muted-foreground">Initiating secure session...</p>
                    </div>
                );
            case 'pending_approval':
                return (
                    <div className="flex flex-col items-center justify-center h-32">
                        <Smartphone className="h-8 w-8 animate-pulse text-primary" />
                        <p className="mt-4 text-muted-foreground text-center">Approve the request sent to your mobile device to continue.</p>
                    </div>
                );
            case 'timed_out':
                return (
                    <div className="flex flex-col items-center justify-center h-32">
                        <AlertCircle className="h-8 w-8 text-destructive" />
                        <p className="mt-4 text-muted-foreground">Authorization request timed out.</p>
                    </div>
                );
            case 'error':
                return (
                    <div className="flex flex-col items-center justify-center h-32">
                        <AlertCircle className="h-8 w-8 text-destructive" />
                        <p className="mt-4 text-destructive text-center">{errorMessage}</p>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ShieldCheck className="text-primary" />
                        Session Authorization Required
                    </DialogTitle>
                    <DialogDescription>
                        A high-security action requires approval from your registered mobile device.
                    </DialogDescription>
                </DialogHeader>
                {renderContent()}
                {(status === 'timed_out' || status === 'error') && (
                    <DialogFooter className="pt-4">
                        <Button type="button" onClick={startAuthorization} className="w-full">
                            Retry
                        </Button>
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default ThirdFactorAuthModal;