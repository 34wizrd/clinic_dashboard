// src/features/auth/authSlice.ts

import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../../api/apiClient';
import {getErrorPayload} from "@/utils/errorUtils.ts";
import type {RootState} from "@/store/store.ts";

// 1. UPDATED User interface to match your /users/me response
interface User {
    id: number;
    full_name: string;
    email: string;
    is_active: boolean;
    role_id: number;
    role_name: 'admin' | 'doctor' | string; // Use known roles + string for flexibility
}

export type CreateUserPayload = {
    first_name: string;
    last_name: string;
    email: string;
    role_id: number;
};

// 2. The full AuthState interface
interface AuthState {
    user: User | null;
    finalToken: string | null;
    tempToken: string | null;
    thirdToken: string | null; // For temporary elevated access
    thirdTokenExpiresAt: number | null; // Expiry timestamp
    authStage: 'loggedOut' | 'otpRequired' | 'loggedIn';
    loading: 'idle' | 'pending' | 'succeeded' | 'failed';
    error: string | null;
}

const finalToken = localStorage.getItem('finalAuthToken');

const initialState: AuthState = {
    user: null,
    finalToken: finalToken,
    tempToken: null,
    thirdToken: null,
    thirdTokenExpiresAt: null,
    authStage: finalToken ? 'loggedIn' : 'loggedOut',
    loading: 'idle',
    error: null,
};

// --- SELECTORS ---
export const selectIsThirdTokenValid = (state: RootState): boolean => {
    const { thirdToken, thirdTokenExpiresAt } = state.auth;
    if (!thirdToken || !thirdTokenExpiresAt) {
        return false;
    }
    // Check if the token is still valid
    return Date.now() < thirdTokenExpiresAt;
};


export const createUser = createAsyncThunk(
    'auth/createUser',
    async (userData: CreateUserPayload, { rejectWithValue }) => {
        try {
            // THE FIX: Construct the payload to exactly match the API's expected schema,
            // including required fields that have default values.
            const payload = {
                first_name: userData.first_name,
                last_name: userData.last_name,
                email: userData.email,
                role_id: userData.role_id,
                is_active: true, // This field is likely required by the Pydantic model.
                mobile_device_id: "web-browser-signup" // Provide a placeholder as this is likely required.
            };
            await apiClient.post<User>('/users/create', payload);
            return true; // Indicate success
        } catch (error: unknown) {
            return rejectWithValue(getErrorPayload(error));
        }
    }
);

// 3. Async Thunk for initial login (username/password)
export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async (credentials: Record<string, string>, { rejectWithValue }) => {
        try {
            const formData = new URLSearchParams();
            formData.append('username', credentials.email);
            formData.append('password', credentials.password);

            const response = await apiClient.post('/login/access-token', formData, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            });

            return response.data;
        } catch (error: unknown) {
            return rejectWithValue(getErrorPayload(error));
        }
    }
);

// 4. Async Thunk to fetch user data after getting the final token
export const fetchUser = createAsyncThunk(
    'auth/fetchUser',
    async (_, { rejectWithValue }) => {
        try {
            // The apiClient interceptor will add the final token to this request
            const response = await apiClient.get('/users/me');
            return response.data as User;
        } catch (error: unknown) {
            return rejectWithValue(getErrorPayload(error));
        }
    }
);

// 5. Async Thunk to verify OTP and then trigger fetchUser
export const verifyOtp = createAsyncThunk(
    'auth/verifyOtp',
    async (otpCode: string, { getState, dispatch, rejectWithValue }) => {
        const state = getState() as { auth: AuthState };
        const tempToken = state.auth.tempToken;

        if (!tempToken) {
            return rejectWithValue('No temporary token found. Please login again.');
        }

        try {
            const response = await apiClient.post(
                '/login/access-token/verify-otp',
                { code: otpCode, type: 'totp' },
                { headers: { Authorization: `Bearer ${tempToken}` } }
            );

            const { access_token } = response.data;
            localStorage.setItem('finalAuthToken', access_token);

            // Dispatch fetchUser to get the logged-in user's details
            await dispatch(fetchUser());

            return { finalToken: access_token };
        } catch (error: unknown) {
            return rejectWithValue(getErrorPayload(error));
        }
    }
);

// New Thunk for initiating the step-up authentication flow
export const initiateStepUpAuth = createAsyncThunk(
    'auth/initiateStepUpAuth',
    async (context: { target_action: string; target_resource: string }, { rejectWithValue }) => {
        try {
            const response = await apiClient.post('/third-factor/step-up-auth', context);
            return response.data; // { txn_id, challenge, expires_in_sec, message }
        } catch (error: unknown) {
            return rejectWithValue(getErrorPayload(error));
        }
    }
);

// New Thunk to poll for the final third token
export const fetchThirdToken = createAsyncThunk(
    'auth/fetchThirdToken',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get('/third-factor/third-token');
            return response.data; // { third_token, expires_in_sec, message }
        } catch (error: unknown) {
            // We expect this to fail until the user approves, so we handle the error silently in the component
            return rejectWithValue(getErrorPayload(error));
        }
    }
);

// 6. The complete slice with all extraReducers
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null;
            state.finalToken = null;
            state.tempToken = null;
            state.thirdToken = null;
            state.thirdTokenExpiresAt = null;
            state.authStage = 'loggedOut';
            localStorage.removeItem('finalAuthToken');
        },
    },
    extraReducers: (builder) => {
        builder
            // Login User Reducers
            .addCase(loginUser.pending, (state) => {
                state.loading = 'pending';
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                if (action.payload.stage === 'totp_required') {
                    state.loading = 'idle'; // Not 'succeeded' because we have another step
                    state.authStage = 'otpRequired';
                    state.tempToken = action.payload.temp_token;
                } else {
                    state.loading = 'failed';
                    state.error = 'Unknown login stage received.';
                }
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = 'failed';
                state.error = action.payload as string;
            })
            // Verify OTP Reducers
            .addCase(verifyOtp.pending, (state) => {
                state.loading = 'pending';
                state.error = null;
            })
            .addCase(verifyOtp.fulfilled, (state, action) => {
                // We wait for fetchUser to finish before setting loading to 'succeeded'
                state.authStage = 'loggedIn';
                state.finalToken = action.payload.finalToken;
                state.tempToken = null;
            })
            .addCase(verifyOtp.rejected, (state, action) => {
                state.loading = 'failed';
                state.error = action.payload as string;
            })
            // Fetch User Reducers
            .addCase(fetchUser.pending, (state) => {
                state.loading = 'pending';
            })
            .addCase(fetchUser.fulfilled, (state, action: PayloadAction<User>) => {
                state.loading = 'succeeded';
                state.user = action.payload; // Store the user data
            })
            .addCase(fetchUser.rejected, (state, action) => {
                state.loading = 'failed';
                state.error = action.payload as string;
                state.authStage = 'loggedOut';
                state.finalToken = null;
                localStorage.removeItem('finalAuthToken');
            })
            // New reducer for when the third token is successfully fetched
            .addCase(fetchThirdToken.fulfilled, (state, action) => {
                state.thirdToken = action.payload.third_token;
                state.thirdTokenExpiresAt = Date.now() + action.payload.expires_in_sec * 1000;
            });
    },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;