// src/features/patients/PatientForm.tsx
import React, { useState, useEffect } from 'react';
import { createPatient, updatePatient, type Patient } from './patientSlice';
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {useAppDispatch} from "@/hooks/hooks.ts";

interface PatientFormProps {
    onSuccess: () => void;
    patientToEdit?: Patient | null;
}

const PatientForm: React.FC<PatientFormProps> = ({ onSuccess, patientToEdit }) => {
    const dispatch = useAppDispatch();
    const isEditMode = !!patientToEdit;

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        dob: '',
        gender: '',
        address: '',
        emergency_contact: '',
    });

    useEffect(() => {
        if (isEditMode && patientToEdit) {
            setFormData({
                first_name: patientToEdit.first_name,
                last_name: patientToEdit.last_name,
                dob: patientToEdit.dob,
                gender: patientToEdit.gender,
                address: patientToEdit.address,
                emergency_contact: patientToEdit.emergency_contact,
            });
        }
    }, [patientToEdit, isEditMode]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const submissionData = {
            ...formData,
            user_id: 1, // This should be dynamic in a real app
        };

        const promise = isEditMode
            ? dispatch(updatePatient({ ...patientToEdit!, ...submissionData })).unwrap()
            : dispatch(createPatient(submissionData)).unwrap();

        toast.promise(promise, {
            loading: isEditMode ? 'Updating patient...' : 'Creating patient...',
            success: () => {
                onSuccess();
                return `Patient ${isEditMode ? 'updated' : 'created'} successfully!`;
            },
            error: (err) => err,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label htmlFor="first_name">First Name</Label><Input id="first_name" name="first_name" value={formData.first_name} onChange={handleChange} required /></div>
                <div className="space-y-2"><Label htmlFor="last_name">Last Name</Label><Input id="last_name" name="last_name" value={formData.last_name} onChange={handleChange} required /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label htmlFor="dob">Date of Birth</Label><Input id="dob" name="dob" type="date" value={formData.dob} onChange={handleChange} required /></div>
                <div className="space-y-2"><Label htmlFor="gender">Gender</Label><Input id="gender" name="gender" value={formData.gender} onChange={handleChange} required /></div>
            </div>
            <div className="space-y-2"><Label htmlFor="address">Address</Label><Input id="address" name="address" value={formData.address} onChange={handleChange} required /></div>
            <div className="space-y-2"><Label htmlFor="emergency_contact">Emergency Contact</Label><Input id="emergency_contact" name="emergency_contact" value={formData.emergency_contact} onChange={handleChange} required /></div>
            <div className="flex justify-end pt-2">
                <Button type="submit">{isEditMode ? 'Save Changes' : 'Create Patient'}</Button>
            </div>
        </form>
    );
};

export default PatientForm;