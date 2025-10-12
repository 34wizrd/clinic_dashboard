// src/features/prescriptions/PrescriptionForm.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { createPrescription, updatePrescription, type Prescription } from './prescriptionSlice';
import { fetchAllPatients } from '../patients/patientSlice';
import { fetchAllDoctors } from '../doctors/doctorSlice';
import { toast } from "sonner";
import { SearchableSelect, type SelectOption } from '@/components/common/SearchableSelect';

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {useAppDispatch, useAppSelector} from "@/hooks/hooks.ts";

interface PrescriptionFormProps {
    onSuccess: () => void;
    prescriptionToEdit?: Prescription | null;
}

const PrescriptionForm: React.FC<PrescriptionFormProps> = ({ onSuccess, prescriptionToEdit }) => {
    const dispatch = useAppDispatch();
    const isEditMode = !!prescriptionToEdit;

    // Get the full lists of patients and doctors from the Redux store
    const { allPatients } = useAppSelector((state) => state.patients);
    const { allDoctors } = useAppSelector((state) => state.doctors);

    const [formData, setFormData] = useState({
        patient_id: null as number | null,
        doctor_id: null as number | null,
        medication_name: '',
        dosage: '',
        duration: '',
        instructions: '',
        requires_biometric: false,
    });

    // Fetch data for the dropdowns only once when the component first mounts
    useEffect(() => {
        dispatch(fetchAllPatients());
        dispatch(fetchAllDoctors());
    }, [dispatch]);

    // Pre-fill the form's state when in edit mode
    useEffect(() => {
        if (isEditMode && prescriptionToEdit) {
            setFormData({
                patient_id: prescriptionToEdit.patient_id,
                doctor_id: prescriptionToEdit.doctor_id,
                medication_name: prescriptionToEdit.medication_name,
                dosage: prescriptionToEdit.dosage,
                duration: prescriptionToEdit.duration,
                instructions: prescriptionToEdit.instructions,
                requires_biometric: prescriptionToEdit.requires_biometric,
            });
        }
    }, [prescriptionToEdit, isEditMode]);

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

    // Generic handler for standard text inputs and textareas
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.patient_id || !formData.doctor_id) {
            toast.error("Please select both a patient and a doctor.");
            return;
        }
        const submissionData = { ...formData, patient_id: formData.patient_id, doctor_id: formData.doctor_id };

        const promise = isEditMode
            ? dispatch(updatePrescription({ ...prescriptionToEdit!, ...submissionData })).unwrap()
            : dispatch(createPrescription(submissionData)).unwrap();

        toast.promise(promise, {
            loading: isEditMode ? 'Updating prescription...' : 'Creating prescription...',
            success: () => {
                onSuccess();
                return `Prescription ${isEditMode ? 'updated' : 'created'} successfully!`;
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
                <Label>Prescribing Doctor</Label>
                <SearchableSelect
                    options={doctorOptions}
                    value={formData.doctor_id}
                    onSelect={(id) => setFormData(p => ({ ...p, doctor_id: id }))}
                    placeholder="Select a doctor..."
                    searchPlaceholder="Search doctors by name..."
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="medication_name">Medication Name</Label>
                <Input id="medication_name" name="medication_name" value={formData.medication_name} onChange={handleChange} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label htmlFor="dosage">Dosage (e.g., 500mg)</Label><Input id="dosage" name="dosage" value={formData.dosage} onChange={handleChange} required /></div>
                <div className="space-y-2"><Label htmlFor="duration">Duration (e.g., 7 days)</Label><Input id="duration" name="duration" value={formData.duration} onChange={handleChange} required /></div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea id="instructions" name="instructions" value={formData.instructions} onChange={handleChange} required />
            </div>
            <div className="flex items-center space-x-2 pt-2">
                <Checkbox id="requires_biometric" checked={formData.requires_biometric} onCheckedChange={(checked) => setFormData(p => ({ ...p, requires_biometric: checked === true }))} />
                <Label htmlFor="requires_biometric" className="cursor-pointer">Requires Biometric Verification</Label>
            </div>
            <div className="flex justify-end pt-4">
                <Button type="submit">{isEditMode ? 'Save Changes' : 'Create Prescription'}</Button>
            </div>
        </form>
    );
};

export default PrescriptionForm;