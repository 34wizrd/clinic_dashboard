// src/pages/DashboardPage.tsx

import { useEffect } from 'react';
import { fetchPatients, fetchAllPatients } from '@/features/patients/patientSlice';
import { fetchAppointments } from '@/features/appointments/appointmentSlice';
import { fetchPrescriptions } from '@/features/prescriptions/prescriptionSlice';
import { fetchHealthRecords } from '@/features/health-records/healthRecordSlice';
import { selectIsThirdTokenValid } from '@/features/auth/authSlice';
import { fetchAllDoctors } from '@/features/doctors/doctorSlice';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, ClipboardPenLine, FileHeart } from 'lucide-react'; // Icons for the cards
import { useAppDispatch, useAppSelector } from '@/hooks/hooks';
import AppointmentCalendar from "@/features/appointments/AppointmentCalendar.tsx";

const DashboardPage = () => {
    const dispatch = useAppDispatch();

    // Get the total counts from each respective slice in the Redux store
    const { totalCount: patientCount } = useAppSelector((state) => state.patients);
    const { totalCount: appointmentCount } = useAppSelector((state) => state.appointments);
    const { totalCount: prescriptionCount } = useAppSelector((state) => state.prescriptions);
    const { totalCount: healthRecordCount } = useAppSelector((state) => state.healthRecords);
    const isThirdTokenValid = useAppSelector(selectIsThirdTokenValid);

    // When the dashboard loads, dispatch actions to fetch the first page of each feature.
    // This will populate the 'totalCount' for each slice, which is what we need for the cards.
    useEffect(() => {
        // Fetch counts for stat cards
        dispatch(fetchPatients({ page: 1, limit: 1 }));
        dispatch(fetchAppointments({ page: 1, limit: 1 }));
        dispatch(fetchPrescriptions({ page: 1, limit: 1 }));

        // Only fetch sensitive health record count if the session is already authorized
        if (isThirdTokenValid) {
            dispatch(fetchHealthRecords({ page: 1, limit: 1 }));
        }

        // Fetch all patients and doctors for the calendar to use for displaying names
        dispatch(fetchAllPatients());
        dispatch(fetchAllDoctors());
    }, [dispatch, isThirdTokenValid]); // Re-run if the auth state changes

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground">
                    An overview of your clinic's activity.
                </p>
            </div>

            {/* --- STATS CARDS SECTION --- */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Patients
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{patientCount}</div>
                        <p className="text-xs text-muted-foreground">
                            Total registered patients in the system.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Appointments
                        </CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{appointmentCount}</div>
                        <p className="text-xs text-muted-foreground">
                            All scheduled, completed, and cancelled appointments.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Prescriptions
                        </CardTitle>
                        <ClipboardPenLine className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{prescriptionCount}</div>
                        <p className="text-xs text-muted-foreground">
                            Total prescriptions issued by doctors.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Health Records
                        </CardTitle>
                        <FileHeart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{isThirdTokenValid ? healthRecordCount : "-"}</div>
                        <p className="text-xs text-muted-foreground">
                            {isThirdTokenValid ? "Total records in the system." : "Requires authorization to view."}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* --- CALENDAR SECTION --- */}
            <Card>
                <CardHeader>
                    <CardTitle>Appointment Calendar</CardTitle>
                </CardHeader>
                <CardContent>
                    <AppointmentCalendar />
                </CardContent>
            </Card>
        </div>
    );
};

export default DashboardPage;