import { useState, useMemo } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { motion } from "framer-motion";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar as CalendarIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { DateClickArg } from "@fullcalendar/interaction";
import { EventClickArg } from "@fullcalendar/core";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { AppointmentModal } from "@/components/AppointmentModal";

export default function Agenda() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

    const { data: appointments = [], isLoading } = useQuery({
        queryKey: ["appointments"],
        queryFn: () => apiFetch<any[]>("/appointments"),
    });

    const calendarEvents = useMemo(() => {
        return appointments.map((app) => {
            const start = `${app.date}T${app.start_time}`;
            const startDate = new Date(start);
            const endDate = new Date(startDate.getTime() + parseInt(app.duration) * 60000);

            let color = "#3b82f6"; // agendado (azul)
            if (app.status === "realizado") color = "#10b981"; // verde
            if (app.status === "falta") color = "#ef4444"; // vermelho

            const entityName = app.type === "individual" ? app.student?.name : app.school_class?.name;
            const teacher = app.school_class?.teacher || app.course?.teacher;
            const teacherName = teacher ? ` (${teacher.name})` : "";
            const title = `${app.course?.name || "Aula"} - ${entityName || ""}${teacherName}`;

            return {
                id: app.id.toString(),
                title,
                start,
                end: endDate.toISOString(),
                backgroundColor: color,
                borderColor: color,
                extendedProps: { ...app },
            };
        });
    }, [appointments]);

    const handleDateClick = (arg: DateClickArg) => {
        setSelectedAppointment({
            date: arg.dateStr,
            start_time: "09:00",
        });
        setIsModalOpen(true);
    };

    const handleEventClick = (arg: EventClickArg) => {
        const app = arg.event.extendedProps;
        setSelectedAppointment(app);
        setIsModalOpen(true);
    };

    return (
        <MainLayout>
            <div className="space-y-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                    <div>
                        <h1 className="text-3xl font-bold text-foreground tracking-tight">Agenda</h1>
                        <p className="text-muted-foreground mt-1 text-lg">
                            Gerencie horários de aulas, reuniões e eventos.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            onClick={() => {
                                setSelectedAppointment(null);
                                setIsModalOpen(true);
                            }}
                            className="flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Novo Evento
                        </Button>
                        <div className="flex items-center gap-2 bg-card/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-border/50 shadow-sm">
                            <CalendarIcon className="w-4 h-4 text-primary" />
                            <span className="text-sm font-semibold text-foreground">
                                {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                            </span>
                        </div>
                    </div>
                </motion.div>

                {/* Calendar Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <Card className="shadow-soft border-border/50 overflow-hidden bg-card/50 backdrop-blur-sm">
                        <CardContent className="p-6">
                            {isLoading ? (
                                <div className="h-[600px] flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                </div>
                            ) : (
                                <div className="full-calendar-container">
                                    <FullCalendar
                                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                        initialView="timeGridWeek"
                                        headerToolbar={{
                                            left: "prev,next today",
                                            center: "title",
                                            right: "dayGridMonth,timeGridWeek,timeGridDay",
                                        }}
                                        locale="pt-br"
                                        buttonText={{
                                            today: "Hoje",
                                            month: "Mês",
                                            week: "Semana",
                                            day: "Dia",
                                        }}
                                        events={calendarEvents}
                                        editable={true}
                                        selectable={true}
                                        selectMirror={true}
                                        dayMaxEvents={true}
                                        weekends={true}
                                        dateClick={handleDateClick}
                                        eventClick={handleEventClick}
                                        height="auto"
                                        slotMinTime="07:00:00"
                                        slotMaxTime="22:00:00"
                                        allDaySlot={false}
                                        eventContent={(eventInfo) => (
                                            <div className="flex flex-col h-full w-full overflow-hidden px-1 py-0.5 leading-tight">
                                                <div className="font-bold text-[10px] md:text-xs opacity-95 whitespace-nowrap">
                                                    {eventInfo.timeText}
                                                </div>
                                                <div className="font-semibold text-[10px] md:text-sm truncate opacity-90">
                                                    {eventInfo.event.title}
                                                </div>
                                            </div>
                                        )}
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            <AppointmentModal
                isOpen={isModalOpen}
                onOpenChange={setIsModalOpen}
                appointment={selectedAppointment}
            />

            <style>{`
        .full-calendar-container .fc {
          --fc-border-color: hsl(var(--border) / 0.5);
          --fc-button-bg-color: hsl(var(--primary));
          --fc-button-border-color: hsl(var(--primary));
          --fc-button-hover-bg-color: hsl(var(--primary) / 0.9);
          --fc-button-hover-border-color: hsl(var(--primary) / 0.9);
          --fc-button-active-bg-color: hsl(var(--primary) / 0.8);
          --fc-button-active-border-color: hsl(var(--primary) / 0.8);
          --fc-today-bg-color: hsl(var(--primary) / 0.05);
          --fc-page-bg-color: transparent;
          font-family: inherit;
        }

        .full-calendar-container .fc-toolbar-title {
          font-size: 1.25rem !important;
          font-weight: 700 !important;
          color: hsl(var(--foreground));
        }

        .full-calendar-container .fc-col-header-cell {
          padding: 12px 0 !important;
          background: hsl(var(--muted) / 0.3);
          font-weight: 600;
          color: hsl(var(--muted-foreground));
          text-transform: uppercase;
          font-size: 0.75rem;
          letter-spacing: 0.05em;
        }

        .full-calendar-container .fc-daygrid-day-number {
          padding: 8px !important;
          font-size: 0.875rem;
          color: hsl(var(--foreground));
        }

        .full-calendar-container .fc-button {
          padding: 8px 16px !important;
          font-weight: 500 !important;
          text-transform: capitalize !important;
          border-radius: 8px !important;
          font-size: 0.875rem !important;
        }

        .full-calendar-container .fc-button-primary:not(:disabled).fc-button-active, 
        .full-calendar-container .fc-button-primary:not(:disabled):active {
          background-color: hsl(var(--primary)) !important;
          border-color: hsl(var(--primary)) !important;
          box-shadow: none !important;
        }

        .full-calendar-container .fc-event {
          border-radius: 6px !important;
          padding: 0 !important;
          border: none !important;
          font-weight: normal !important;
          font-size: 1rem !important;
          cursor: pointer !important;
          transition: transform 0.1s ease !important;
        }

        .full-calendar-container .fc-event:hover {
          transform: translateY(-1px);
          filter: brightness(1.1);
        }

        .dark .full-calendar-container .fc-daygrid-day-number {
          color: #fff;
        }
      `}</style>
        </MainLayout>
    );
}
