// src/features/appointments/components/AppointmentCalendar.tsx
import { useEffect, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import type {EventInput} from '@fullcalendar/core';
import {useAppDispatch, useAppSelector } from '@/hooks/hooks';
import {fetchCalendarAppointments} from "@/features/appointments/appointmentSlice.ts";
import { startOfMonth, endOfMonth, formatISO } from 'date-fns';

const AppointmentCalendar = () => {
    const dispatch = useAppDispatch();
    const { calendarAppointments } = useAppSelector((state) => state.appointments);
    const { allPatients } = useAppSelector((state) => state.patients);
    const { allDoctors } = useAppSelector((state) => state.doctors);

    // Fetch appointments for the current month when the component first loads.
    useEffect(() => {
        const now = new Date();
        const start = formatISO(startOfMonth(now));
        const end = formatISO(endOfMonth(now));

        dispatch(fetchCalendarAppointments({ start, end }));
    }, [dispatch]);

    // Create efficient lookup maps for patient and doctor names
    const patientNameMap = useMemo(() => new Map(allPatients.map(p => [p.id, `${p.first_name} ${p.last_name}`])), [allPatients]);
    const doctorNameMap = useMemo(() => new Map(allDoctors.map(d => [d.id, `Dr. ${d.first_name} ${d.last_name}`])), [allDoctors]);

    // Transform our appointment data into the format FullCalendar expects
    const events: EventInput[] = useMemo(() =>
            calendarAppointments.map(appt => ({
                id: String(appt.id),
                title: patientNameMap.get(appt.patient_id) || `Appointment ${appt.id}`,
                start: appt.starts_at,
                end: appt.ends_at,
                extendedProps: {
                    doctor: doctorNameMap.get(appt.doctor_id) || `Dr. ID ${appt.doctor_id}`,
                    reason: appt.reason,
                }
            })),
        [calendarAppointments, patientNameMap, doctorNameMap]);

    // This function will be called whenever the user changes the month or view.
    const handleDatesSet = (dateInfo: { startStr: string; endStr: string }) => {
        dispatch(fetchCalendarAppointments({
            start: dateInfo.startStr,
            end: dateInfo.endStr,
        }));
    };

    // Custom function to render the event content
    const renderEventContent = (eventInfo: EventInput) => {
        return (
            <div className="p-1 text-xs overflow-hidden">
                <b>{eventInfo.timeText}</b>
                <p className="truncate">{eventInfo.event.title}</p>
                <i className="truncate">{eventInfo.event.extendedProps.doctor}</i>
            </div>
        );
    };

    return (
        <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,listWeek'
            }}
            events={events}
            eventContent={renderEventContent}
            datesSet={handleDatesSet}
            height="auto" // Makes it responsive to the container
            editable={true} // Allows dragging and resizing
            selectable={true}
        />
    );
};

export default AppointmentCalendar;