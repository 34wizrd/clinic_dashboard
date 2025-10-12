// src/pages/AppointmentsPage.tsx
import { useEffect } from 'react';

// Import Shadcn UI Components
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import AppointmentForm from "@/features/appointments/AppointmentForm.tsx";
import {type Appointment, fetchAppointments} from "@/features/appointments/appointmentSlice.ts";
import {useAppDispatch, useAppSelector} from "@/hooks/hooks.ts";

const AppointmentsPage = () => {
    const dispatch = useAppDispatch();
    const { appointments, status, error } = useAppSelector((state) => state.appointments);

    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchAppointments());
        }
    }, [status, dispatch]);

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Appointments</h1>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button>+ Create Appointment</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Create New Appointment</DialogTitle>
                            <DialogDescription>
                                Fill in the details below to book a new appointment.
                            </DialogDescription>
                        </DialogHeader>
                        {/* The Dialog will automatically close when the form succeeds due to re-render, but we can pass a handler for more control if needed */}
                        <AppointmentForm onSuccess={() => {
                            // The Dialog's open state isn't controlled by us, so we can't manually close it here.
                            // A more advanced setup might involve controlling the Dialog's `open` prop with state.
                            // For now, the toast notification provides enough feedback.
                        }}/>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="border rounded-lg">
                {status === 'loading' && <p className="p-4">Loading appointments...</p>}
                {status === 'failed' && <p className="p-4 text-destructive">{error}</p>}
                {status === 'succeeded' && (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Patient ID</TableHead>
                                <TableHead>Doctor ID</TableHead>
                                <TableHead>Starts At</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Reason</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {appointments.map((appt: Appointment) => (
                                <TableRow key={appt.id}>
                                    <TableCell className="font-medium">{appt.patient_id}</TableCell>
                                    <TableCell>{appt.doctor_id}</TableCell>
                                    <TableCell>{new Date(appt.starts_at).toLocaleString()}</TableCell>
                                    <TableCell className="capitalize">{appt.status}</TableCell>
                                    <TableCell>{appt.reason}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>
        </div>
    );
};

export default AppointmentsPage;