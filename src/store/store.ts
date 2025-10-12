// src/store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import appointmentReducer from '../features/appointments/appointmentSlice'; // <-- 1. IMPORT
import patientReducer from '../features/patients/patientSlice'; // <-- 1. IMPORT
import facilityReducer from '../features/facilities/facilitySlice'; // <-- 1. IMPORT
import prescriptionReducer from '../features/prescriptions/prescriptionSlice'; // <-- 1. IMPORT
import doctorReducer from '../features/doctors/doctorSlice';
import healthRecordReducer from '../features/health-records/healthRecordSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        appointments: appointmentReducer, // <-- 2. ADD TO REDUCER OBJECT
        patients: patientReducer, // <-- 2. ADD TO REDUCER
        facilities: facilityReducer, // <-- 2. ADD REDUCER
        prescriptions: prescriptionReducer, // <-- 2. ADD REDUCER
        doctors: doctorReducer, // <-- ADD THIS
        healthRecords: healthRecordReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;