// src/pages/HealthRecordsPage.tsx

import { useState, useEffect } from 'react';
import { fetchHealthRecords, deleteHealthRecord, resetStatus, type HealthRecord } from '@/features/health-records/healthRecordSlice';
import { fetchAllPatients } from '@/features/patients/patientSlice';
import { fetchAllDoctors } from '@/features/doctors/doctorSlice';
import HealthRecordForm from '@/features/health-records/HealthRecordForm';
import { toast } from "sonner";
import ThirdFactorAuthModal from '@/features/auth/ThirdFactorAuthModal';
import { selectIsThirdTokenValid } from '@/features/auth/authSlice';

// Shadcn UI Components & Icons
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { FileHeart, ShieldAlert } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/hooks';
import { HealthRecordDataTable } from "@/features/health-records/HealthRecordDataTable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type ModalState = {
    type: 'create' | 'edit' | 'delete' | null;
    data?: HealthRecord;
};

const HealthRecordsPage = () => {
    const dispatch = useAppDispatch();
    const { healthRecords, status, error, totalCount } = useAppSelector((state) => state.healthRecords);
    const { user } = useAppSelector((state) => state.auth);
    const isThirdTokenValid = useAppSelector(selectIsThirdTokenValid);

    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [modalState, setModalState] = useState<ModalState>({ type: null });
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

    const totalPages = Math.ceil(totalCount / pagination.pageSize) || 1;
    const isDoctor = user?.role_name === 'doctor';

    useEffect(() => {
        // Only fetch if the token is valid and we need data
        if (isThirdTokenValid && status === 'idle') {
            dispatch(fetchHealthRecords({ page: pagination.pageIndex + 1, limit: pagination.pageSize }));
        }
        // These can be fetched regardless as they are not as sensitive
        dispatch(fetchAllPatients());
        dispatch(fetchAllDoctors());
    }, [dispatch, pagination.pageIndex, pagination.pageSize, status, isThirdTokenValid]);

    const handleActionWithAuth = (action: () => void) => {
        if (isThirdTokenValid) {
            action();
        } else {
            setPendingAction(() => action);
            setIsAuthModalOpen(true);
        }
    };

    const onAuthSuccess = () => {
        setIsAuthModalOpen(false);
        if (pendingAction) {
            pendingAction();
            setPendingAction(null);
        } else {
            // If there was no pending action, it means the user just wanted to view records.
            // Trigger a refetch by resetting the slice's status.
            dispatch(resetStatus());
        }
    };

    const handleDelete = () => {
        if (modalState.type !== 'delete' || !modalState.data) return;

        const action = () => {
            const promise = dispatch(deleteHealthRecord(modalState.data!.id)).unwrap();
            toast.promise(promise, {
                loading: 'Deleting health record...',
                success: () => {
                    setModalState({ type: null }); // Close the confirmation dialog
                    return 'Health record deleted successfully!';
                },
                error: (err) => {
                    setModalState({ type: null }); // Close the confirmation dialog on error too
                    return err;
                },
            });
        };

        handleActionWithAuth(action);
    };

    const renderContent = () => {
        if (!isThirdTokenValid) {
            return (
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShieldAlert className="h-6 w-6 text-amber-500" />
                            Authorization Required
                        </CardTitle>
                        <CardDescription>
                            Access to sensitive health records requires an authorized session. Please grant temporary access to continue.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={() => setIsAuthModalOpen(true)}>Authorize Access</Button>
                    </CardContent>
                </Card>
            )
        }

        if (status === 'loading') {
            return <p className="p-6 text-center text-muted-foreground">Loading health records...</p>;
        }

        if (status === 'failed') {
            return <p className="p-6 text-center text-destructive">{error}</p>;
        }

        return (
            <HealthRecordDataTable
                data={healthRecords}
                pageCount={totalPages}
                pageIndex={pagination.pageIndex}
                pageSize={pagination.pageSize}
                onPageChange={(pageIndex) => setPagination(prev => ({ ...prev, pageIndex }))}
                onPageSizeChange={(pageSize) => setPagination({ pageIndex: 0, pageSize })}
                onEdit={(record) => handleActionWithAuth(() => setModalState({ type: 'edit', data: record }))}
                onDelete={(record) => setModalState({ type: 'delete', data: record })}
            />
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Health Records</h1>
                {/* --- UPDATED LOGIC --- */}
                {/* Show button only if the user is a doctor AND their session is authorized */}
                {isDoctor && isThirdTokenValid && (
                    <Button onClick={() => setModalState({ type: 'create' })}>
                        <FileHeart className="mr-2 h-4 w-4" />
                        Create Record
                    </Button>
                )}
            </div>

            {renderContent()}

            <ThirdFactorAuthModal
                open={isAuthModalOpen}
                onOpenChange={setIsAuthModalOpen}
                onSuccess={onAuthSuccess}
            />

            <Dialog open={(modalState.type === 'create' || modalState.type === 'edit') && isDoctor} onOpenChange={(isOpen) => !isOpen && setModalState({ type: null })}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{modalState.type === 'edit' ? 'Edit Health Record' : 'New Health Record'}</DialogTitle>
                    </DialogHeader>
                    <HealthRecordForm
                        onSuccess={() => setModalState({ type: null })}
                        recordToEdit={modalState.type === 'edit' ? modalState.data : undefined}
                    />
                </DialogContent>
            </Dialog>

            <AlertDialog open={modalState.type === 'delete' && isDoctor} onOpenChange={(isOpen) => !isOpen && setModalState({ type: null })}>
                <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle></AlertDialogHeader>
                    <AlertDialogDescription>This will permanently delete the selected health record.</AlertDialogDescription>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Confirm</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default HealthRecordsPage;