// src/router/AppRouter.tsx

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layouts and Route Guards
import PrivateRoute from './PrivateRoute';
import AdminRoute from './AdminRoute';

// Pages
import LoginPage from '../pages/LoginPage';
import VerifyOtpPage from '../pages/VerifyOtpPage';
import DashboardPage from '../pages/DashboardPage';
import AppointmentsPage from '../pages/AppointmentsPage';
import PatientsPage from '../pages/PatientsPage';
import FacilityManagementPage from '../pages/FacilityManagementPage';
import PrescriptionsPage from "@/pages/PrescriptionsPage.tsx";
import DoctorsPage from "@/pages/DoctorsPage.tsx";
import MainLayout from '@/components/layout/MainLayout';
import SignUpPage from '@/pages/SignUpPage';
import HealthRecordsPage from "@/pages/HealthRecordsPage.tsx";

const AppRouter = () => {
    return (
        <Router>
            <Routes>
                {/* --- Public Routes --- */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/verify-otp" element={<VerifyOtpPage />} />
                <Route path="/signup" element={<SignUpPage />} /> {/* <-- 2. ADD ROUTE */}

                {/* --- Private Routes --- */}
                <Route element={<PrivateRoute />}>
                    <Route element={<MainLayout />}>
                        {/* Redirect from root to dashboard */}
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />

                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/appointments" element={<AppointmentsPage />} />
                        <Route path="/patients" element={<PatientsPage />} />
                        <Route path="/doctors" element={<DoctorsPage />} />
                        <Route path="/facilities" element={<FacilityManagementPage />} />
                        <Route path="/prescriptions" element={<PrescriptionsPage />} />
                        <Route path="/health-records" element={<HealthRecordsPage />} />

                        {/* Admin-Only Routes */}
                        <Route element={<AdminRoute />}>
                        </Route>
                    </Route>
                </Route>

                {/* 404 Not Found Route */}
                <Route path="*" element={<h1>404 Not Found</h1>} />
            </Routes>
        </Router>
    );
};

export default AppRouter;