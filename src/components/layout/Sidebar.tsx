// src/components/layout/Sidebar.tsx
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Shadcn UI Components
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

// Icons
import {
    LayoutDashboard,
    CalendarDays,
    Users,
    Building2, UserCog, Stethoscope,
} from 'lucide-react';
import {useAppSelector} from "@/hooks/hooks.ts";

interface SidebarProps {
    isCollapsed: boolean;
}

const navLinks = [
    { to: "/dashboard", icon: <LayoutDashboard size={20} />, text: "Dashboard" }, // Change from "/"
    { to: "/appointments", icon: <CalendarDays size={20} />, text: "Appointments" },
    { to: "/patients", icon: <Users size={20} />, text: "Patients" },
    { to: "/doctors", icon: <Stethoscope size={20} />, text: "Doctors" },
    // { to: "/facility-management", icon: <Building2 size={20} />, text: "Facilities", adminOnly: true },
    { to: "/facility-management", icon: <Building2 size={20} />, text: "Facilities"},
    { to: "/user-management", icon: <UserCog size={20} />, text: "User Management", adminOnly: true },
    { to: "/prescriptions", icon: <UserCog size={20} />, text: "Prescriptions" },

];

const Sidebar = ({ isCollapsed }: SidebarProps) => {
    const { user } = useAppSelector((state) => state.auth);

    const filteredNavLinks = navLinks.filter(
        (link) => !link.adminOnly || user?.role_name === 'admin'
    );

    return (
        <aside
            className={`relative flex flex-col h-screen bg-gray-900 text-gray-50 p-4 transition-all duration-300 ease-in-out ${
                isCollapsed ? 'w-20' : 'w-64'
            }`}
        >
            {/* Logo/Header */}
            <div className="flex items-center gap-2 mb-8">
                <Avatar>
                    <AvatarFallback>CD</AvatarFallback>
                </Avatar>
                <AnimatePresence>
                    {!isCollapsed && (
                        <motion.span
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="font-semibold text-lg"
                        >
                            Clinic Dashboard
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-2">
                {filteredNavLinks.map((link) => (
                    <Link to={link.to} key={link.text} title={link.text}>
                        <Button
                            variant="ghost"
                            className="w-full flex justify-start items-center gap-3"
                        >
                            {link.icon}
                            <AnimatePresence>
                                {!isCollapsed && (
                                    <motion.span
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {link.text}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </Button>
                    </Link>
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;