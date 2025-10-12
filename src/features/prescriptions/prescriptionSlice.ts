// src/features/prescriptions/prescriptionSlice.ts

import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../../api/apiClient';
import { getErrorPayload } from '@/utils/errorUtils.ts';

// Type Definitions
export interface Prescription {
    id: number;
    patient_id: number;
    doctor_id: number;
    medication_name: string;
    dosage: string;
    duration: string;
    instructions: string;
    requires_biometric: boolean;
    created_at: string;
    updated_at: string;
}

interface PrescriptionsApiResponse {
    data: Prescription[];
    count: number;
}

type FetchPrescriptionsArgs = {
    page: number;
    limit: number;
};

interface PrescriptionState {
    prescriptions: Prescription[];
    totalCount: number;
    currentPage: number;
    limit: number;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

// Initial State
const initialState: PrescriptionState = {
    prescriptions: [],
    totalCount: 0,
    currentPage: 1,
    limit: 10,
    status: 'idle',
    error: null,
};

// Async Thunks
export const fetchPrescriptions = createAsyncThunk(
    'prescriptions/fetchPrescriptions',
    async ({ page, limit }: FetchPrescriptionsArgs, { rejectWithValue }) => {
        try {
            const skip = (page - 1) * limit;
            const response = await apiClient.get<PrescriptionsApiResponse>(`/prescription/list?skip=${skip}&limit=${limit}`);
            return { ...response.data, page };
        } catch (error: unknown) {
            return rejectWithValue(getErrorPayload(error));
        }
    }
);

export const createPrescription = createAsyncThunk(
    'prescriptions/createPrescription',
    async (newPrescriptionData: Omit<Prescription, 'id' | 'created_at' | 'updated_at'>, { rejectWithValue }) => {
        try {
            const response = await apiClient.post<Prescription>('/prescription/create', newPrescriptionData);
            return response.data;
        } catch (error: unknown) {
            return rejectWithValue(getErrorPayload(error));
        }
    }
);

export const updatePrescription = createAsyncThunk(
    'prescriptions/updatePrescription',
    async (prescriptionData: Prescription, { rejectWithValue }) => {
        try {
            const { id, ...dataToUpdate } = prescriptionData;
            const response = await apiClient.put<Prescription>(`/prescription/update?prescription_id=${id}`, dataToUpdate);
            return response.data;
        } catch (error: unknown) {
            return rejectWithValue(getErrorPayload(error));
        }
    }
);

export const deletePrescription = createAsyncThunk(
    'prescriptions/deletePrescription',
    async (prescriptionId: number, { rejectWithValue }) => {
        try {
            await apiClient.delete(`/prescription/delete?prescription_id=${prescriptionId}`);
            return prescriptionId;
        } catch (error: unknown) {
            return rejectWithValue(getErrorPayload(error));
        }
    }
);

// Slice Definition
const prescriptionSlice = createSlice({
    name: 'prescriptions',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchPrescriptions.pending, (state) => { state.status = 'loading'; })
            .addCase(fetchPrescriptions.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.prescriptions = action.payload.data;
                state.totalCount = action.payload.count;
                state.currentPage = action.payload.page;
            })
            .addCase(fetchPrescriptions.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })
            .addCase(createPrescription.fulfilled, (state) => {
                state.status = 'idle'; // Trigger refetch for data consistency
            })
            .addCase(updatePrescription.fulfilled, (state, action: PayloadAction<Prescription>) => {
                const index = state.prescriptions.findIndex(p => p.id === action.payload.id);
                if (index !== -1) { state.prescriptions[index] = action.payload; }
            })
            .addCase(deletePrescription.fulfilled, (state, action: PayloadAction<number>) => {
                state.prescriptions = state.prescriptions.filter(p => p.id !== action.payload);
                state.totalCount -= 1;
                if (state.prescriptions.length === 0 && state.totalCount > 0) {
                    state.status = 'idle';
                }
            });
    },
});

export default prescriptionSlice.reducer;