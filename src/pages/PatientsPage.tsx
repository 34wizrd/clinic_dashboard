// src/pages/PatientsPage.tsx

import { useState, useEffect } from 'react';
import { fetchPatients, deletePatient, type Patient } from '../features/patients/patientSlice';
import PatientForm from '../features/patients/PatientForm';
import { toast } from "sonner";

// Shadcn UI Components & Icons
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { UserPlus } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/hooks';
import {PatientDataTable} from "@/features/patients/PatientDataTable.tsx";

type ModalState = {
    type: 'create' | 'edit' | 'delete' | null;
    data?: Patient;
};

const PatientsPage = () => {
    const dispatch = useAppDispatch();
    const { patients, status, error, totalCount } = useAppSelector((state) => state.patients);

    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [modalState, setModalState] = useState<ModalState>({ type: null });

    const totalPages = Math.ceil(totalCount / pagination.pageSize) || 1;

    useEffect(() => {
        // This effect correctly handles all data fetching and re-fetching
        dispatch(fetchPatients({ page: pagination.pageIndex + 1, limit: pagination.pageSize }));
    }, [dispatch, pagination.pageIndex, pagination.pageSize, status === 'idle']);

    const handleCRUDSuccess = () => {
        setModalState({ type: null });
        // Trigger a refetch of the current page
        dispatch(fetchPatients({ page: pagination.pageIndex + 1, limit: pagination.pageSize }));
    };

    const handleDelete = () => {
        if (modalState.type !== 'delete' || !modalState.data) return;
        const promise = dispatch(deletePatient(modalState.data.id)).unwrap();
        toast.promise(promise, {
            loading: 'Deleting patient...',
            success: () => {
                // Smartly go to previous page if last item on a page is deleted
                if (patients.length === 1 && pagination.pageIndex > 0) {
                    setPagination(prev => ({ ...prev, pageIndex: prev.pageIndex - 1}));
                } else {
                    handleCRUDSuccess();
                }
                return 'Patient record deleted successfully!';
            },
            error: (err) => err,
        });
    };

    // Render loading state only on initial fetch
    if (status === 'loading' && patients.length === 0) {
        return <p className="p-6 text-center text-muted-foreground">Loading patients...</p>;
    }

    // Render full page error state
    if (status === 'failed' && patients.length === 0) {
        return <p className="p-6 text-center text-destructive">{error}</p>;
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Patient Management</h1>
                <Button onClick={() => setModalState({ type: 'create' })}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Patient
                </Button>
            </div>

            <PatientDataTable
                data={patients}
                pageCount={totalPages}
                pageIndex={pagination.pageIndex}
                pageSize={pagination.pageSize}
                onPageChange={(pageIndex) => setPagination(prev => ({ ...prev, pageIndex }))}
                onPageSizeChange={(pageSize) => setPagination({ pageIndex: 0, pageSize })}
                onEdit={(patient) => setModalState({ type: 'edit', data: patient })}
                onDelete={(patient) => setModalState({ type: 'delete', data: patient })}
            />

            {/* Modals for Create/Edit and Delete */}
            <Dialog open={modalState.type === 'create' || modalState.type === 'edit'} onOpenChange={(isOpen) => !isOpen && setModalState({ type: null })}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{modalState.type === 'edit' ? 'Edit Patient' : 'Create New Patient'}</DialogTitle>
                    </DialogHeader>
                    <PatientForm
                        onSuccess={handleCRUDSuccess}
                        patientToEdit={modalState.type === 'edit' ? modalState.data : undefined}
                    />
                </DialogContent>
            </Dialog>

            <AlertDialog open={modalState.type === 'delete'} onOpenChange={(isOpen) => !isOpen && setModalState({ type: null })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogDescription>
                        This will permanently delete the record for {modalState.data?.first_name} {modalState.data?.last_name}.
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

export default PatientsPage;