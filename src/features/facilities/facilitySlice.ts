// src/features/facilities/facilitySlice.ts
import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../../api/apiClient';
import { getErrorPayload } from '@/utils/errorUtils.ts';

// Type Definitions
export interface Facility {
    id: number;
    name: string;
    address: string;
    timezone: string;
    created_at: string;
    updated_at: string;
}

interface FacilitiesApiResponse {
    data: Facility[];
    count: number;
}

type FetchFacilitiesArgs = {
    page: number;
    limit: number;
};

interface FacilityState {
    facilities: Facility[];
    totalCount: number;
    currentPage: number;
    limit: number;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

// Initial State
const initialState: FacilityState = {
    facilities: [],
    totalCount: 0,
    currentPage: 1,
    limit: 10,
    status: 'idle',
    error: null,
};

// Async Thunks
export const fetchFacilities = createAsyncThunk(
    'facilities/fetchFacilities',
    async ({ page, limit }: FetchFacilitiesArgs, { rejectWithValue }) => {
        try {
            const skip = (page - 1) * limit;
            const response = await apiClient.get<FacilitiesApiResponse>(`/facility/list?skip=${skip}&limit=${limit}`);
            return { ...response.data, page };
        } catch (error: unknown) {
            return rejectWithValue(getErrorPayload(error));
        }
    }
);

export const createFacility = createAsyncThunk(
    'facilities/createFacility',
    async (newFacilityData: Omit<Facility, 'id' | 'created_at' | 'updated_at'>, { rejectWithValue }) => {
        try {
            const response = await apiClient.post<Facility>('/facility/create', newFacilityData);
            return response.data;
        } catch (error: unknown) {
            return rejectWithValue(getErrorPayload(error));
        }
    }
);

export const updateFacility = createAsyncThunk(
    'facilities/updateFacility',
    async (facilityData: Facility, { rejectWithValue }) => {
        try {
            const { id, ...dataToUpdate } = facilityData;
            const response = await apiClient.put<Facility>(`/facility/update?facility_id=${id}`, dataToUpdate);
            return response.data;
        } catch (error: unknown) {
            return rejectWithValue(getErrorPayload(error));
        }
    }
);

export const deleteFacility = createAsyncThunk(
    'facilities/deleteFacility',
    async (facilityId: number, { rejectWithValue }) => {
        try {
            await apiClient.delete(`/facility/delete?facility_id=${facilityId}`);
            return facilityId;
        } catch (error: unknown) {
            return rejectWithValue(getErrorPayload(error));
        }
    }
);

// Slice Definition
const facilitySlice = createSlice({
    name: 'facilities',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchFacilities.pending, (state) => { state.status = 'loading'; })
            .addCase(fetchFacilities.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.facilities = action.payload.data;
                state.totalCount = action.payload.count;
                state.currentPage = action.payload.page;
            })
            .addCase(fetchFacilities.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })
            .addCase(updateFacility.fulfilled, (state, action: PayloadAction<Facility>) => {
                const index = state.facilities.findIndex(f => f.id === action.payload.id);
                if (index !== -1) { state.facilities[index] = action.payload; }
            })
            .addCase(deleteFacility.fulfilled, (state, action: PayloadAction<number>) => {
                state.facilities = state.facilities.filter(f => f.id !== action.payload);
                state.totalCount -= 1;
                if (state.facilities.length === 0 && state.totalCount > 0) {
                    state.status = 'idle'; // Trigger refetch if page becomes empty
                }
            });
    },
});

export default facilitySlice.reducer;