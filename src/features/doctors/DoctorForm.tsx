// src/features/doctors/DoctorForm.tsx
import React, { useState, useEffect } from 'react';
import { createDoctor, updateDoctor, type Doctor } from './doctorSlice';
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from '@/components/ui/textarea';
import {useAppDispatch} from "@/hooks/hooks.ts";

interface DoctorFormProps {
    onSuccess: () => void;
    doctorToEdit?: Doctor | null;
}

const DoctorForm: React.FC<DoctorFormProps> = ({ onSuccess, doctorToEdit }) => {
    const dispatch = useAppDispatch();
    const isEditMode = !!doctorToEdit;

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        specialization: '',
        qualifications: '',
    });

    useEffect(() => {
        if (isEditMode && doctorToEdit) {
            setFormData({
                first_name: doctorToEdit.first_name,
                last_name: doctorToEdit.last_name,
                specialization: doctorToEdit.specialization,
                qualifications: doctorToEdit.qualifications,
            });
        }
    }, [doctorToEdit, isEditMode]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // This should be dynamic, perhaps from a user selection or context
        const submissionData = { ...formData, user_id: 1 };

        const promise = isEditMode
            ? dispatch(updateDoctor({ ...doctorToEdit!, ...submissionData })).unwrap()
            : dispatch(createDoctor(submissionData)).unwrap();

        toast.promise(promise, {
            loading: isEditMode ? 'Updating doctor...' : 'Creating doctor...',
            success: () => {
                onSuccess();
                return `Doctor ${isEditMode ? 'updated' : 'created'} successfully!`;
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
            <div className="space-y-2"><Label htmlFor="specialization">Specialization</Label><Input id="specialization" name="specialization" value={formData.specialization} onChange={handleChange} required /></div>
            <div className="space-y-2"><Label htmlFor="qualifications">Qualifications</Label><Textarea id="qualifications" name="qualifications" value={formData.qualifications} onChange={handleChange} required /></div>
            <div className="flex justify-end pt-2">
                <Button type="submit">{isEditMode ? 'Save Changes' : 'Create Doctor'}</Button>
            </div>
        </form>
    );
};

export default DoctorForm;