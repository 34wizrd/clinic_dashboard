// src/features/doctors/doctorSlice.ts

import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../../api/apiClient';
import { getErrorPayload } from '../../utils/errorUtils';

// Type Definitions
export interface Doctor {
    id: number;
    user_id: number;
    first_name: string;
    last_name: string;
    specialization: string;
    qualifications: string;
    created_at: string;
    updated_at: string;
}

interface DoctorsApiResponse {
    data: Doctor[];
    count: number;
}

type FetchDoctorsArgs = {
    page: number;
    limit: number;
};

interface DoctorState {
    doctors: Doctor[]; // For the paginated table
    allDoctors: Doctor[]; // For dropdowns/selects
    totalCount: number;
    currentPage: number;
    limit: number;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

// Initial State
const initialState: DoctorState = {
    doctors: [],
    allDoctors: [],
    totalCount: 0,
    currentPage: 1,
    limit: 10,
    status: 'idle',
    error: null,
};

// Async Thunks
export const fetchDoctors = createAsyncThunk(
    'doctors/fetchDoctors',
    async ({ page, limit }: FetchDoctorsArgs, { rejectWithValue }) => {
        try {
            const skip = (page - 1) * limit;
            const response = await apiClient.get<DoctorsApiResponse>(`/doctor/list?skip=${skip}&limit=${limit}`);
            return { ...response.data, page };
        } catch (error: unknown) {
            return rejectWithValue(getErrorPayload(error));
        }
    }
);

export const fetchAllDoctors = createAsyncThunk(
    'doctors/fetchAllDoctors',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get<DoctorsApiResponse>('/doctor/list?limit=1000');
            return response.data.data;
        } catch (error: unknown) {
            return rejectWithValue(getErrorPayload(error));
        }
    }
);

export const createDoctor = createAsyncThunk(
    'doctors/createDoctor',
    async (newDoctorData: Omit<Doctor, 'id' | 'created_at' | 'updated_at'>, { rejectWithValue }) => {
        try {
            const response = await apiClient.post<Doctor>('/doctor/create', newDoctorData);
            return response.data;
        } catch (error: unknown) {
            return rejectWithValue(getErrorPayload(error));
        }
    }
);

export const updateDoctor = createAsyncThunk(
    'doctors/updateDoctor',
    async (doctorData: Doctor, { rejectWithValue }) => {
        try {
            const { id, ...dataToUpdate } = doctorData;
            const response = await apiClient.put<Doctor>(`/doctor/update?doctor_id=${id}`, dataToUpdate);
            return response.data;
        } catch (error: unknown) {
            return rejectWithValue(getErrorPayload(error));
        }
    }
);

export const deleteDoctor = createAsyncThunk(
    'doctors/deleteDoctor',
    async (doctorId: number, { rejectWithValue }) => {
        try {
            await apiClient.delete(`/doctor/delete?doctor_id=${doctorId}`);
            return doctorId;
        } catch (error: unknown) {
            return rejectWithValue(getErrorPayload(error));
        }
    }
);

// Slice Definition
const doctorSlice = createSlice({
    name: 'doctors',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchDoctors.pending, (state) => { state.status = 'loading'; })
            .addCase(fetchDoctors.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.doctors = action.payload.data;
                state.totalCount = action.payload.count;
                state.currentPage = action.payload.page;
            })
            .addCase(fetchDoctors.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })

            // Case for fetching all doctors for dropdowns
            .addCase(fetchAllDoctors.fulfilled, (state, action: PayloadAction<Doctor[]>) => {
                state.allDoctors = action.payload;
            })

            .addCase(updateDoctor.fulfilled, (state, action: PayloadAction<Doctor>) => {
                const index = state.doctors.findIndex(doc => doc.id === action.payload.id);
                if (index !== -1) { state.doctors[index] = action.payload; }
            })
            .addCase(deleteDoctor.fulfilled, (state, action: PayloadAction<number>) => {
                state.doctors = state.doctors.filter(doc => doc.id !== action.payload);
                state.totalCount -= 1;
                if (state.doctors.length === 0 && state.totalCount > 0) {
                    state.status = 'idle'; // Trigger refetch if page becomes empty
                }
            })
            .addCase(createDoctor.fulfilled, (state) => {
                state.status = 'idle'; // Trigger refetch to ensure data consistency
            });
    },
});

export default doctorSlice.reducer;