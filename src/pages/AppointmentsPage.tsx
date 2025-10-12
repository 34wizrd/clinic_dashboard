// src/pages/AppointmentsPage.tsx

import { useState, useEffect } from 'react';
import { fetchAppointments, deleteAppointment, type Appointment } from '../features/appointments/appointmentSlice';
import { fetchAllPatients } from '../features/patients/patientSlice';
import { fetchAllDoctors } from '../features/doctors/doctorSlice';
import AppointmentForm from '../features/appointments/AppointmentForm';
import { toast } from "sonner";

// Shadcn UI Components & Icons
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { FilePlus2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/hooks';
import {AppointmentDataTable} from "@/features/appointments/AppointmentDataTable.tsx";

type ModalState = {
    type: 'create' | 'edit' | 'delete' | null;
    data?: Appointment;
};

const AppointmentsPage = () => {
    const dispatch = useAppDispatch();
    const { appointments, status, error, totalCount } = useAppSelector((state) => state.appointments);

    // Pagination state now lives here
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [modalState, setModalState] = useState<ModalState>({ type: null });

    const totalPages = Math.ceil(totalCount / pagination.pageSize);

    // Fetch data when pagination changes or after a successful mutation
    useEffect(() => {
        dispatch(fetchAppointments({ page: pagination.pageIndex + 1, limit: pagination.pageSize }));
        // Fetch lists for dropdowns
        dispatch(fetchAllPatients());
        dispatch(fetchAllDoctors());
    }, [dispatch, pagination.pageIndex, pagination.pageSize, status === 'idle']);

    const handleCRUDSuccess = () => {
        setModalState({ type: null });
        // Set status to 'idle' to trigger a refetch in the useEffect
        dispatch({ type: 'appointments/refetch' }); // We can add a simple reducer for this, or just refetch directly
        dispatch(fetchAppointments({ page: pagination.pageIndex + 1, limit: pagination.pageSize }));
    };

    const handleDelete = () => {
        if (modalState.type !== 'delete' || !modalState.data) return;
        const promise = dispatch(deleteAppointment(modalState.data.id)).unwrap();
        toast.promise(promise, {
            loading: 'Deleting appointment...',
            success: () => {
                handleCRUDSuccess();
                return 'Appointment deleted successfully!';
            },
            error: (err) => err,
        });
    };

    if (status === 'loading' && appointments.length === 0) {
        return <p className="p-6 text-center text-muted-foreground">Loading appointments...</p>;
    }

    if (status === 'failed') {
        return <p className="p-6 text-center text-destructive">{error}</p>;
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Appointments</h1>
                <Button onClick={() => setModalState({ type: 'create' })}>
                    <FilePlus2 className="mr-2 h-4 w-4" />
                    Create Appointment
                </Button>
            </div>

            <AppointmentDataTable
                data={appointments}
                pageCount={totalPages}
                pageIndex={pagination.pageIndex}
                pageSize={pagination.pageSize}
                onPageChange={(pageIndex) => setPagination(prev => ({ ...prev, pageIndex }))}
                onPageSizeChange={(pageSize) => setPagination({ pageIndex: 0, pageSize })}
                onEdit={(appointment) => setModalState({ type: 'edit', data: appointment })}
                onDelete={(appointment) => setModalState({ type: 'delete', data: appointment })}
            />

            {/* Modals remain the same */}
            <Dialog open={modalState.type === 'create' || modalState.type === 'edit'} onOpenChange={(isOpen) => !isOpen && setModalState({ type: null })}>
                <DialogContent><DialogHeader><DialogTitle>{modalState.type === 'edit' ? 'Edit Appointment' : 'New Appointment'}</DialogTitle></DialogHeader><AppointmentForm onSuccess={handleCRUDSuccess} appointmentToEdit={modalState.type === 'edit' ? modalState.data : undefined} /></DialogContent>
            </Dialog>
            <AlertDialog open={modalState.type === 'delete'} onOpenChange={(isOpen) => !isOpen && setModalState({ type: null })}>
                <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle></AlertDialogHeader><AlertDialogDescription>This will permanently delete the selected appointment.</AlertDialogDescription><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Confirm</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default AppointmentsPage;