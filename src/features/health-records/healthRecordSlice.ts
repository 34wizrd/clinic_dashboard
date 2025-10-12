// src/features/health-records/healthRecordSlice.ts

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../api/apiClient';
import { getErrorPayload } from '@/utils/errorUtils';
import type {RootState} from '@/store/store';

// Type Definitions
export interface HealthRecord {
    id: number;
    patient_id: number;
    doctor_id: number;
    record_date: string; // ISO date string
    diagnosis: string;
    treatment: string;
    notes?: string;
    created_at: string;
    updated_at: string;
}

// For creating a record, doctor_id is handled by the backend
type CreateHealthRecordPayload = Omit<HealthRecord, 'id' | 'doctor_id' | 'created_at' | 'updated_at'>;

interface HealthRecordsApiResponse {
    data: HealthRecord[];
    count: number;
}

type FetchHealthRecordsArgs = {
    page: number;
    limit: number;
};

interface HealthRecordState {
    healthRecords: HealthRecord[];
    totalCount: number;
    currentPage: number;
    limit: number;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

// Initial State
const initialState: HealthRecordState = {
    healthRecords: [],
    totalCount: 0,
    currentPage: 1,
    limit: 10,
    status: 'idle',
    error: null,
};

// Async Thunks
export const fetchHealthRecords = createAsyncThunk(
    'healthRecords/fetchHealthRecords',
    async ({ page, limit }: FetchHealthRecordsArgs, { getState, rejectWithValue }) => {
        const { auth } = getState() as RootState;
        if (!auth.thirdToken) return rejectWithValue('Temporary authorization required to view records.');

        try {
            const skip = (page - 1) * limit;
            const response = await apiClient.get<HealthRecordsApiResponse>(`/health-records/list?skip=${skip}&limit=${limit}`, {
                headers: { 'X-Third-Token': auth.thirdToken }
            });
            return { ...response.data, page };
        } catch (error: unknown) {
            return rejectWithValue(getErrorPayload(error));
        }
    }
);

export const createHealthRecord = createAsyncThunk(
    'healthRecords/createHealthRecord',
    async (newRecordData: CreateHealthRecordPayload, { getState, rejectWithValue }) => {
        const { auth } = getState() as RootState;
        if (!auth.thirdToken) return rejectWithValue('Temporary authorization required.');

        try {
            const response = await apiClient.post<HealthRecord>('/health-records/create', newRecordData, {
                headers: { 'X-Third-Token': auth.thirdToken }
            });
            return response.data;
        } catch (error: unknown) {
            return rejectWithValue(getErrorPayload(error));
        }
    }
);

export const updateHealthRecord = createAsyncThunk(
    'healthRecords/updateHealthRecord',
    async (recordData: HealthRecord, { getState, rejectWithValue }) => {
        const { auth } = getState() as RootState;
        if (!auth.thirdToken) return rejectWithValue('Temporary authorization required.');

        try {
            const { id, ...dataToUpdate } = recordData;
            const response = await apiClient.put<HealthRecord>(`/health-records/update?record_id=${id}`, dataToUpdate, {
                headers: { 'X-Third-Token': auth.thirdToken }
            });
            return response.data;
        } catch (error: unknown) {
            return rejectWithValue(getErrorPayload(error));
        }
    }
);

export const deleteHealthRecord = createAsyncThunk(
    'healthRecords/deleteHealthRecord',
    async (recordId: number, { getState, rejectWithValue }) => {
        const { auth } = getState() as RootState;
        if (!auth.thirdToken) return rejectWithValue('Temporary authorization required.');

        try {
            await apiClient.delete(`/health-records/delete?record_id=${recordId}`, {
                headers: { 'X-Third-Token': auth.thirdToken }
            });
            return recordId;
        } catch (error: unknown) {
            return rejectWithValue(getErrorPayload(error));
        }
    }
);

// Slice Definition
const healthRecordSlice = createSlice({
    name: 'healthRecords',
    initialState,
    reducers: {
        // Reducer to reset the status, allowing for a controlled refetch
        resetStatus: (state) => {
            state.status = 'idle';
            // Clear data to ensure the loading state is shown correctly
            state.healthRecords = [];
            state.totalCount = 0;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchHealthRecords.pending, (state) => { state.status = 'loading'; })
            .addCase(fetchHealthRecords.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.healthRecords = action.payload.data;
                state.totalCount = action.payload.count;
                state.currentPage = action.payload.page;
            })
            .addCase(fetchHealthRecords.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })
            .addCase(createHealthRecord.fulfilled, (state) => {
                state.status = 'idle'; // Trigger refetch for data consistency
            })
            .addCase(updateHealthRecord.fulfilled, (state) => {
                state.status = 'idle';
            })
            .addCase(deleteHealthRecord.fulfilled, (state) => {
                state.status = 'idle';
            });
    },
});

export const { resetStatus } = healthRecordSlice.actions;
export default healthRecordSlice.reducer;