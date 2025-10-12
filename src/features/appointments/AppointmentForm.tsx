// src/features/appointments/AppointmentForm.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { createAppointment, updateAppointment, type Appointment } from './appointmentSlice';
import { fetchAllPatients } from '../patients/patientSlice';
import { fetchAllDoctors } from '../doctors/doctorSlice';
import { toast } from "sonner";
import { format } from 'date-fns';
import { SearchableSelect, type SelectOption } from '@/components/common/SearchableSelect';

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from '@/components/ui/textarea';
import {useAppDispatch, useAppSelector } from '@/hooks/hooks';

interface AppointmentFormProps {
    onSuccess: () => void;
    appointmentToEdit?: Appointment | null;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({ onSuccess, appointmentToEdit }) => {
    const dispatch = useAppDispatch();
    const isEditMode = !!appointmentToEdit;

    // Get data for dropdowns from the Redux store
    const { allPatients } = useAppSelector((state) => state.patients);
    const { allDoctors } = useAppSelector((state) => state.doctors);

    const [formData, setFormData] = useState({
        patient_id: null as number | null,
        doctor_id: null as number | null,
        starts_at: '',
        ends_at: '',
        reason: '',
        notes: '',
    });

    // Fetch data for dropdowns when the component mounts
    useEffect(() => {
        dispatch(fetchAllPatients());
        dispatch(fetchAllDoctors());
    }, [dispatch]);

    // Pre-fill form in edit mode
    useEffect(() => {
        if (isEditMode && appointmentToEdit) {
            setFormData({
                patient_id: appointmentToEdit.patient_id,
                doctor_id: appointmentToEdit.doctor_id,
                // Format ISO strings to be compatible with datetime-local input
                starts_at: format(new Date(appointmentToEdit.starts_at), "yyyy-MM-dd'T'HH:mm"),
                ends_at: format(new Date(appointmentToEdit.ends_at), "yyyy-MM-dd'T'HH:mm"),
                reason: appointmentToEdit.reason || '',
                notes: appointmentToEdit.notes || '',
            });
        }
    }, [appointmentToEdit, isEditMode]);

    // Memoize the transformed options to prevent re-calculation on every render
    const patientOptions: SelectOption[] = useMemo(() =>
        allPatients.map(p => ({
            value: p.id,
            label: `${p.first_name} ${p.last_name}`,
        })), [allPatients]);

    const doctorOptions: SelectOption[] = useMemo(() =>
        allDoctors.map(d => ({
            value: d.id,
            label: `Dr. ${d.first_name} ${d.last_name}`,
        })), [allDoctors]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.patient_id || !formData.doctor_id) {
            toast.error("Please select both a patient and a doctor.");
            return;
        }

        // Convert local datetime strings back to ISO 8601 format for the API
        const submissionData = {
            ...formData,
            patient_id: formData.patient_id,
            doctor_id: formData.doctor_id,
            starts_at: new Date(formData.starts_at).toISOString(),
            ends_at: new Date(formData.ends_at).toISOString(),
            status: 'scheduled', // Default status for new/updated appointments
            facility_id: 1, // This should be dynamic in a real app
        };

        const promise = isEditMode
            ? dispatch(updateAppointment({ ...appointmentToEdit!, ...submissionData })).unwrap()
            : dispatch(createAppointment(submissionData)).unwrap();

        toast.promise(promise, {
            loading: isEditMode ? 'Updating appointment...' : 'Creating appointment...',
            success: () => {
                onSuccess();
                return `Appointment ${isEditMode ? 'updated' : 'created'} successfully!`;
            },
            error: (err) => err,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="space-y-2">
                <Label>Patient</Label>
                <SearchableSelect
                    options={patientOptions}
                    value={formData.patient_id}
                    onSelect={(id) => setFormData(p => ({ ...p, patient_id: id }))}
                    placeholder="Select a patient..."
                    searchPlaceholder="Search patients by name..."
                />
            </div>
            <div className="space-y-2">
                <Label>Doctor</Label>
                <SearchableSelect
                    options={doctorOptions}
                    value={formData.doctor_id}
                    onSelect={(id) => setFormData(p => ({ ...p, doctor_id: id }))}
                    placeholder="Select a doctor..."
                    searchPlaceholder="Search doctors by name..."
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label htmlFor="starts_at">Start Time</Label><Input id="starts_at" name="starts_at" type="datetime-local" value={formData.starts_at} onChange={handleChange} required /></div>
                <div className="space-y-2"><Label htmlFor="ends_at">End Time</Label><Input id="ends_at" name="ends_at" type="datetime-local" value={formData.ends_at} onChange={handleChange} required /></div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="reason">Reason for Visit</Label>
                <Input id="reason" name="reason" value={formData.reason} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} />
            </div>
            <div className="flex justify-end pt-4">
                <Button type="submit">{isEditMode ? 'Save Changes' : 'Create Appointment'}</Button>
            </div>
        </form>
    );
};

export default AppointmentForm;