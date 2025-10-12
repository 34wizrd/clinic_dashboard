// src/pages/DoctorsPage.tsx

import { useState, useEffect } from 'react';
import { fetchDoctors, deleteDoctor, type Doctor } from '../features/doctors/doctorSlice';
import DoctorForm from '../features/doctors/DoctorForm';
import { toast } from "sonner";

// Shadcn UI Components & Icons
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Stethoscope } from 'lucide-react';
import {useAppDispatch, useAppSelector } from '@/hooks/hooks';
import {DoctorDataTable} from "@/features/doctors/DoctorDataTable.tsx";

type ModalState = {
    type: 'create' | 'edit' | 'delete' | null;
    data?: Doctor;
};

const DoctorsPage = () => {
    const dispatch = useAppDispatch();
    const { doctors, status, error, totalCount } = useAppSelector((state) => state.doctors);

    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [modalState, setModalState] = useState<ModalState>({ type: null });

    const totalPages = Math.ceil(totalCount / pagination.pageSize) || 1;

    useEffect(() => {
        // This effect refetches data when pagination changes or after a successful mutation (status becomes 'idle')
        dispatch(fetchDoctors({ page: pagination.pageIndex + 1, limit: pagination.pageSize }));
    }, [dispatch, pagination.pageIndex, pagination.pageSize, status === 'idle']);

    const handleCRUDSuccess = () => {
        setModalState({ type: null });
        // Trigger a refetch by dispatching the fetch action again for the current page
        dispatch(fetchDoctors({ page: pagination.pageIndex + 1, limit: pagination.pageSize }));
    };

    const handleDelete = () => {
        if (modalState.type !== 'delete' || !modalState.data) return;
        const promise = dispatch(deleteDoctor(modalState.data.id)).unwrap();
        toast.promise(promise, {
            loading: 'Deleting doctor...',
            success: () => {
                // Smartly go to previous page if last item on a page is deleted
                if (doctors.length === 1 && pagination.pageIndex > 0) {
                    setPagination(prev => ({ ...prev, pageIndex: prev.pageIndex - 1}));
                } else {
                    handleCRUDSuccess();
                }
                return 'Doctor deleted successfully!';
            },
            error: (err) => err,
        });
    };

    // Render loading state only on initial fetch
    if (status === 'loading' && doctors.length === 0) {
        return <p className="p-6 text-center text-muted-foreground">Loading doctors...</p>;
    }

    // Render full page error state
    if (status === 'failed' && doctors.length === 0) {
        return <p className="p-6 text-center text-destructive">{error}</p>;
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Doctor Management</h1>
                <Button onClick={() => setModalState({ type: 'create' })}>
                    <Stethoscope className="mr-2 h-4 w-4" />
                    Add Doctor
                </Button>
            </div>

            <DoctorDataTable
                data={doctors}
                pageCount={totalPages}
                pageIndex={pagination.pageIndex}
                pageSize={pagination.pageSize}
                onPageChange={(pageIndex) => setPagination(prev => ({ ...prev, pageIndex }))}
                onPageSizeChange={(pageSize) => setPagination({ pageIndex: 0, pageSize })}
                onEdit={(doctor) => setModalState({ type: 'edit', data: doctor })}
                onDelete={(doctor) => setModalState({ type: 'delete', data: doctor })}
            />

            {/* Modals for Create/Edit and Delete */}
            <Dialog open={modalState.type === 'create' || modalState.type === 'edit'} onOpenChange={(isOpen) => !isOpen && setModalState({ type: null })}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{modalState.type === 'edit' ? 'Edit Doctor' : 'Create New Doctor'}</DialogTitle>
                    </DialogHeader>
                    {/* THE FIX IS HERE */}
                    <DoctorForm
                        onSuccess={handleCRUDSuccess}
                        doctorToEdit={modalState.type === 'edit' ? modalState.data : undefined}
                    />
                </DialogContent>
            </Dialog>

            <AlertDialog open={modalState.type === 'delete'} onOpenChange={(isOpen) => !isOpen && setModalState({ type: null })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogDescription>
                        This will permanently delete the record for Dr. {modalState.data?.first_name} {modalState.data?.last_name}.
                    </AlertDialogDescription>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Confirm</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default DoctorsPage;