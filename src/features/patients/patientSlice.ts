// src/features/patients/patientSlice.ts

import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../../api/apiClient';
import { getErrorPayload } from '../../utils/errorUtils';

// --- TYPE DEFINITIONS ---

// Describes the structure of a single patient object
export interface Patient {
    id: number;
    user_id: number;
    first_name: string;
    last_name: string;
    dob: string; // Date string "YYYY-MM-DD"
    gender: string;
    address: string;
    emergency_contact: string;
    created_at: string; // ISO date string
    updated_at: string; // ISO date string
}

// Describes the structure of the API response when fetching a list of patients
interface PatientsApiResponse {
    data: Patient[];
    count: number;
}

// Describes the arguments for our paginated fetch thunk
type FetchPatientsArgs = {
    page: number;
    limit: number;
};

// Describes the shape of our Redux state for this slice
interface PatientState {
    patients: Patient[]; // For the paginated table
    allPatients: Patient[]; // For dropdowns/selects
    totalCount: number;
    currentPage: number;
    limit: number;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

// --- INITIAL STATE ---

const initialState: PatientState = {
    patients: [],
    allPatients: [],
    totalCount: 0,
    currentPage: 1,
    limit: 10,
    status: 'idle',
    error: null,
};

// --- ASYNC THUNKS ---

// READ (List with Pagination)
export const fetchPatients = createAsyncThunk(
    'patients/fetchPatients',
    async ({ page, limit }: FetchPatientsArgs, { rejectWithValue }) => {
        try {
            const skip = (page - 1) * limit;
            const response = await apiClient.get<PatientsApiResponse>(`/patient/list?skip=${skip}&limit=${limit}`);
            return { ...response.data, page }; // Pass page along to the reducer
        } catch (error: unknown) {
            return rejectWithValue(getErrorPayload(error));
        }
    }
);

export const fetchAllPatients = createAsyncThunk(
    'patients/fetchAllPatients',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get<PatientsApiResponse>('/patient/list?limit=1000');
            return response.data.data;
        } catch (error: unknown) {
            return rejectWithValue(getErrorPayload(error));
        }
    }
);

// CREATE
export const createPatient = createAsyncThunk(
    'patients/createPatient',
    async (newPatientData: Omit<Patient, 'id' | 'created_at' | 'updated_at'>, { rejectWithValue }) => {
        try {
            const response = await apiClient.post<Patient>('/patient/create', newPatientData);
            return response.data;
        } catch (error: unknown) {
            return rejectWithValue(getErrorPayload(error));
        }
    }
);

// UPDATE
export const updatePatient = createAsyncThunk(
    'patients/updatePatient',
    async (patientData: Patient, { rejectWithValue }) => {
        try {
            // Destructure to separate the ID from the payload
            const { id, ...dataToUpdate } = patientData;
            const response = await apiClient.put<Patient>(`/patient/update?patient_id=${id}`, dataToUpdate);
            return response.data;
        } catch (error: unknown) {
            return rejectWithValue(getErrorPayload(error));
        }
    }
);

// DELETE
export const deletePatient = createAsyncThunk(
    'patients/deletePatient',
    async (patientId: number, { rejectWithValue }) => {
        try {
            await apiClient.delete(`/patient/delete?patient_id=${patientId}`);
            return patientId; // Return the ID for optimistic removal from state
        } catch (error: unknown) {
            return rejectWithValue(getErrorPayload(error));
        }
    }
);

// --- SLICE DEFINITION ---

const patientSlice = createSlice({
    name: 'patients',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch Patients Cases
            .addCase(fetchPatients.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchPatients.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.patients = action.payload.data;
                state.totalCount = action.payload.count;
                state.currentPage = action.payload.page;
            })
            .addCase(fetchPatients.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })

            // Case for fetching all patients for dropdowns
            .addCase(fetchAllPatients.fulfilled, (state, action: PayloadAction<Patient[]>) => {
                state.allPatients = action.payload;
            })

            // Create Patient Cases
            .addCase(createPatient.fulfilled, (state, action: PayloadAction<Patient>) => {
                // Optimistically add the new patient to the list if there's space on the current page
                if (state.patients.length < state.limit) {
                    state.patients.push(action.payload);
                }
                state.totalCount += 1;
                // Optionally, you could set status to 'idle' here to trigger a refetch on the page
            })

            // Update Patient Cases
            .addCase(updatePatient.fulfilled, (state, action: PayloadAction<Patient>) => {
                const index = state.patients.findIndex(p => p.id === action.payload.id);
                if (index !== -1) {
                    state.patients[index] = action.payload;
                }
            })

            // Delete Patient Cases
            .addCase(deletePatient.fulfilled, (state, action: PayloadAction<number>) => {
                state.patients = state.patients.filter(p => p.id !== action.payload);
                state.totalCount -= 1;
                // Set status to 'idle' to trigger a refetch if the page becomes empty
                if (state.patients.length === 0 && state.totalCount > 0) {
                    state.status = 'idle';
                }
            });
    },
});

export default patientSlice.reducer;