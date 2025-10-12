// src/features/health-records/HealthRecordForm.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { createHealthRecord, updateHealthRecord, type HealthRecord } from './healthRecordSlice';
import { fetchAllPatients } from '../patients/patientSlice';
import { toast } from "sonner";
import { format } from 'date-fns';
import { SearchableSelect, type SelectOption } from '@/components/common/SearchableSelect';

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from '@/components/ui/textarea';
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";

interface HealthRecordFormProps {
    onSuccess: () => void;
    recordToEdit?: HealthRecord | null;
}

const HealthRecordForm: React.FC<HealthRecordFormProps> = ({ onSuccess, recordToEdit }) => {
    const dispatch = useAppDispatch();
    const isEditMode = !!recordToEdit;

    const { allPatients } = useAppSelector((state) => state.patients);

    const [formData, setFormData] = useState({
        patient_id: null as number | null,
        record_date: '',
        diagnosis: '',
        treatment: '',
        notes: '',
    });

    useEffect(() => {
        dispatch(fetchAllPatients());
    }, [dispatch]);

    useEffect(() => {
        if (isEditMode && recordToEdit) {
            setFormData({
                patient_id: recordToEdit.patient_id,
                record_date: format(new Date(recordToEdit.record_date), "yyyy-MM-dd'T'HH:mm"),
                diagnosis: recordToEdit.diagnosis,
                treatment: recordToEdit.treatment,
                notes: recordToEdit.notes || '',
            });
        }
    }, [recordToEdit, isEditMode]);

    const patientOptions: SelectOption[] = useMemo(() =>
        allPatients.map(p => ({
            value: p.id,
            label: `${p.first_name} ${p.last_name}`,
        })), [allPatients]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.patient_id) {
            toast.error("Please select a patient.");
            return;
        }

        const submissionData = {
            ...formData,
            patient_id: formData.patient_id,
            record_date: new Date(formData.record_date).toISOString(),
        };

        const promise = isEditMode
            ? dispatch(updateHealthRecord({ ...recordToEdit!, ...submissionData })).unwrap()
            : dispatch(createHealthRecord(submissionData)).unwrap();

        toast.promise(promise, {
            loading: isEditMode ? 'Updating record...' : 'Creating record...',
            success: () => {
                onSuccess();
                return `Health record ${isEditMode ? 'updated' : 'created'} successfully!`;
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
                <Label htmlFor="record_date">Record Date</Label>
                <Input id="record_date" name="record_date" type="datetime-local" value={formData.record_date} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="diagnosis">Diagnosis</Label>
                <Input id="diagnosis" name="diagnosis" value={formData.diagnosis} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="treatment">Treatment</Label>
                <Textarea id="treatment" name="treatment" value={formData.treatment} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} />
            </div>
            <div className="flex justify-end pt-4">
                <Button type="submit">{isEditMode ? 'Save Changes' : 'Create Record'}</Button>
            </div>
        </form>
    );
};

export default HealthRecordForm;