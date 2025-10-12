// src/store/store.ts
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import authReducer, { logout } from '../features/auth/authSlice';
import appointmentReducer from '../features/appointments/appointmentSlice';
import patientReducer from '../features/patients/patientSlice';
import facilityReducer from '../features/facilities/facilitySlice';
import prescriptionReducer from '../features/prescriptions/prescriptionSlice';
import doctorReducer from '../features/doctors/doctorSlice';
import healthRecordReducer from '../features/health-records/healthRecordSlice';

// 1. Combine all your slice reducers into a single app reducer
const appReducer = combineReducers({
    auth: authReducer,
    appointments: appointmentReducer,
    patients: patientReducer,
    facilities: facilityReducer,
    prescriptions: prescriptionReducer,
    doctors: doctorReducer,

    healthRecords: healthRecordReducer,
});

// 2. Create a root reducer that wraps the app reducer
const rootReducer = (state: ReturnType<typeof appReducer> | undefined, action: any) => {
    // If the action is the logout action, we reset the state to its initial undefined value.
    // Redux will then re-create the state from scratch using the initial states of all slices.
    if (action.type === logout.type) {
        return appReducer(undefined, action);
    }

    return appReducer(state, action);
};


export const store = configureStore({
    // 3. Use the new rootReducer
    reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;