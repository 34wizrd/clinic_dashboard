// src/pages/PrescriptionsPage.tsx

import { useState, useEffect } from 'react';
import { fetchPrescriptions, deletePrescription, type Prescription } from '../features/prescriptions/prescriptionSlice';
import { fetchAllPatients } from '../features/patients/patientSlice';
import { fetchAllDoctors } from '../features/doctors/doctorSlice';
import PrescriptionForm from '../features/prescriptions/PrescriptionForm';
import { toast } from "sonner";

// Shadcn UI Components & Icons
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ClipboardPenLine } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/hooks';
import {PrescriptionDataTable} from "@/features/prescriptions/PrescriptionDataTable.tsx";

type ModalState = {
    type: 'create' | 'edit' | 'delete' | null;
    data?: Prescription;
};

const PrescriptionsPage = () => {
    const dispatch = useAppDispatch();
    const { prescriptions, status, error, totalCount } = useAppSelector((state) => state.prescriptions);

    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [modalState, setModalState] = useState<ModalState>({ type: null });

    const totalPages = Math.ceil(totalCount / pagination.pageSize) || 1;

    useEffect(() => {
        dispatch(fetchPrescriptions({ page: pagination.pageIndex + 1, limit: pagination.pageSize }));
        dispatch(fetchAllPatients());
        dispatch(fetchAllDoctors());
    }, [dispatch, pagination.pageIndex, pagination.pageSize, status === 'idle']);

    const handleCRUDSuccess = () => {
        setModalState({ type: null });
        dispatch(fetchPrescriptions({ page: pagination.pageIndex + 1, limit: pagination.pageSize }));
    };

    const handleDelete = () => {
        if (modalState.type !== 'delete' || !modalState.data) return;
        const promise = dispatch(deletePrescription(modalState.data.id)).unwrap();
        toast.promise(promise, {
            loading: 'Deleting prescription...',
            success: () => {
                if (prescriptions.length === 1 && pagination.pageIndex > 0) {
                    setPagination(prev => ({ ...prev, pageIndex: prev.pageIndex - 1}));
                } else {
                    handleCRUDSuccess();
                }
                return 'Prescription deleted successfully!';
            },
            error: (err) => err,
        });
    };

    if (status === 'loading' && prescriptions.length === 0) {
        return <p className="p-6 text-center text-muted-foreground">Loading prescriptions...</p>;
    }

    if (status === 'failed' && prescriptions.length === 0) {
        return <p className="p-6 text-center text-destructive">{error}</p>;
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Prescription Management</h1>
                <Button onClick={() => setModalState({ type: 'create' })}>
                    <ClipboardPenLine className="mr-2 h-4 w-4" />
                    Add Prescription
                </Button>
            </div>

            <PrescriptionDataTable
                data={prescriptions}
                pageCount={totalPages}
                pageIndex={pagination.pageIndex}
                pageSize={pagination.pageSize}
                onPageChange={(pageIndex) => setPagination(prev => ({ ...prev, pageIndex }))}
                onPageSizeChange={(pageSize) => setPagination({ pageIndex: 0, pageSize })}
                onEdit={(prescription) => setModalState({ type: 'edit', data: prescription })}
                onDelete={(prescription) => setModalState({ type: 'delete', data: prescription })}
            />

            <Dialog open={modalState.type === 'create' || modalState.type === 'edit'} onOpenChange={(isOpen) => !isOpen && setModalState({ type: null })}>
                <DialogContent className="sm:max-w-lg"><DialogHeader><DialogTitle>{modalState.type === 'edit' ? 'Edit Prescription' : 'Create New Prescription'}</DialogTitle></DialogHeader><PrescriptionForm onSuccess={handleCRUDSuccess} prescriptionToEdit={modalState.type === 'edit' ? modalState.data : undefined} /></DialogContent>
            </Dialog>
            <AlertDialog open={modalState.type === 'delete'} onOpenChange={(isOpen) => !isOpen && setModalState({ type: null })}>
                <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle></AlertDialogHeader><AlertDialogDescription>This will permanently delete the prescription for {modalState.data?.medication_name}.</AlertDialogDescription><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Confirm</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default PrescriptionsPage;