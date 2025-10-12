// src/features/facilities/FacilityForm.tsx
import React, { useState, useEffect } from 'react';
import { createFacility, updateFacility, type Facility } from './facilitySlice';
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {useAppDispatch} from "@/hooks/hooks.ts";

interface FacilityFormProps {
    onSuccess: () => void;
    facilityToEdit?: Facility | null;
}

const FacilityForm: React.FC<FacilityFormProps> = ({ onSuccess, facilityToEdit }) => {
    const dispatch = useAppDispatch();
    const isEditMode = !!facilityToEdit;

    const [formData, setFormData] = useState({
        name: '',
        address: '',
        timezone: 'Australia/Sydney', // Default value
    });

    useEffect(() => {
        if (isEditMode && facilityToEdit) {
            setFormData({
                name: facilityToEdit.name,
                address: facilityToEdit.address,
                timezone: facilityToEdit.timezone,
            });
        }
    }, [facilityToEdit, isEditMode]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const promise = isEditMode
            ? dispatch(updateFacility({ ...facilityToEdit!, ...formData })).unwrap()
            : dispatch(createFacility(formData)).unwrap();

        toast.promise(promise, {
            loading: isEditMode ? 'Updating facility...' : 'Creating facility...',
            success: () => {
                onSuccess();
                return `Facility ${isEditMode ? 'updated' : 'created'} successfully!`;
            },
            error: (err) => err,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="space-y-2"><Label htmlFor="name">Facility Name</Label><Input id="name" name="name" value={formData.name} onChange={handleChange} required /></div>
            <div className="space-y-2"><Label htmlFor="address">Address</Label><Input id="address" name="address" value={formData.address} onChange={handleChange} required /></div>
            <div className="space-y-2"><Label htmlFor="timezone">Timezone</Label><Input id="timezone" name="timezone" value={formData.timezone} onChange={handleChange} required /></div>
            <div className="flex justify-end pt-2">
                <Button type="submit">{isEditMode ? 'Save Changes' : 'Create Facility'}</Button>
            </div>
        </form>
    );
};

export default FacilityForm;