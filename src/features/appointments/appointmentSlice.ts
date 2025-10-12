// src/features/appointments/appointmentSlice.ts
import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../../api/apiClient';
import {getErrorPayload} from "@/utils/errorUtils.ts";

type FetchAppointmentsArgs = {
    page: number;
    limit: number;
};

type FetchCalendarAppointmentsArgs = {
    start: string; // ISO string for the start of the date range
    end: string;   // ISO string for the end of the date range
};

// 1. Define the TypeScript interface for an Appointment
export interface Appointment {
    id: number;
    patient_id: number;
    doctor_id: number;
    facility_id: number;
    starts_at: string; // ISO date string
    ends_at: string;   // ISO date string
    status: 'scheduled' | 'completed' | 'cancelled' | string;
    reason?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
}

// Define the shape of the API response for listing appointments
interface AppointmentsApiResponse {
    data: Appointment[];
    count: number;
}

interface AppointmentState {
    appointments: Appointment[];
    totalCount: number;
    currentPage: number;
    limit: number;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
    calendarAppointments: Appointment[]; // <-- 2. ADD NEW STATE FOR CALENDAR
}

const initialState: AppointmentState = {
    appointments: [],
    totalCount: 0,
    currentPage: 1,
    limit: 10, // Let's set a default page size
    status: 'idle',
    error: null,
    calendarAppointments: [], // <-- 3. INITIALIZE IT
};

export const fetchCalendarAppointments = createAsyncThunk(
    'appointments/fetchCalendarAppointments',
    async ({ start, end }: FetchCalendarAppointmentsArgs, { rejectWithValue }) => {
        try {
            const response = await apiClient.get<AppointmentsApiResponse>('/appointment/list', {
                params: {
                    limit: 1000,
                    time_from: start,
                    time_to: end,
                }
            });

            return response.data.data;
        } catch (error: unknown) {
            return rejectWithValue(getErrorPayload(error));
        }
    }
);

export const fetchAppointments = createAsyncThunk(
    'appointments/fetchAppointments',
    async ({ page, limit }: FetchAppointmentsArgs, { rejectWithValue }) => {
        try {
            const skip = (page - 1) * limit;
            const response = await apiClient.get<AppointmentsApiResponse>(
                `/appointment/list?skip=${skip}&limit=${limit}`
            );
            return response.data;
        } catch (error: unknown) {
            return rejectWithValue(getErrorPayload(error));
        }
    }
);

// 1. ADD UPDATE THUNK
export const updateAppointment = createAsyncThunk(
    'appointments/updateAppointment',
    async (appointmentData: Appointment, { rejectWithValue }) => {
        try {
            const { id, ...dataToUpdate } = appointmentData;
            const response = await apiClient.put<Appointment>(`/appointment/update?appointment_id=${id}`, dataToUpdate);
            return response.data;
        } catch (error: unknown) {
            return rejectWithValue(getErrorPayload(error)); // <-- 3. USE THE UTILITY
        }
    }
);

// 2. ADD DELETE THUNK
export const deleteAppointment = createAsyncThunk(
    'appointments/deleteAppointment',
    async (appointmentId: number, { rejectWithValue }) => {
        try {
            await apiClient.delete(`/appointment/delete?appointment_id=${appointmentId}`);
            return appointmentId; // Return the ID on success for removal from state
        } catch (error: unknown) {
            return rejectWithValue(getErrorPayload(error)); // <-- 3. USE THE UTILITY
        }
    }
);

// CREATE
export const createAppointment = createAsyncThunk(
    'appointments/createAppointment',
    async (newAppointmentData: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>, { rejectWithValue }) => {
        try {
            const response = await apiClient.post<Appointment>('/appointment/create', newAppointmentData);
            return response.data;
        } catch (error: unknown) {
            return rejectWithValue(getErrorPayload(error)); // <-- 3. USE THE UTILITY
        }
    }
);

// NOTE: For now, we are focusing on the list view. Thunks for update and delete
// can be added here following the same pattern when we build the components that need them.

// 4. Create the slice with reducers
const appointmentSlice = createSlice({
    name: 'appointments',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAppointments.pending, (state) => {
                state.status = 'loading';
            })
            // 3. UPDATE the fulfilled reducer to store the current page
            .addCase(fetchAppointments.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.appointments = action.payload.data;
                state.totalCount = action.payload.count;
                state.currentPage = action.meta.arg.page; // Store the page number from the thunk argument
            })
            .addCase(fetchAppointments.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })
            // Reducer for creating an appointment (optimistically adds to the list)
            .addCase(createAppointment.fulfilled, (state, action: PayloadAction<Appointment>) => {
                state.appointments.push(action.payload);
            })
            .addCase(updateAppointment.fulfilled, (state, action: PayloadAction<Appointment>) => {
                    const index = state.appointments.findIndex(appt => appt.id === action.payload.id);
                    if (index !== -1) {
                        state.appointments[index] = action.payload;
                    }
                })
            // 4. ADD DELETE REDUCER
            .addCase(deleteAppointment.fulfilled, (state, action: PayloadAction<number>) => {
                state.appointments = state.appointments.filter(appt => appt.id !== action.payload);
            })
            .addCase(fetchCalendarAppointments.fulfilled, (state, action: PayloadAction<Appointment[]>) => {
                    state.calendarAppointments = action.payload;
                });
    },
});

export default appointmentSlice.reducer;

