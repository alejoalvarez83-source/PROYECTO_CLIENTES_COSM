import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Calendar as CalendarIcon,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { AVAILABLE_TIME_SLOTS } from '../data/services';

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const WEEKDAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export function BookingCalendar({
  selectedDate,
  onSelectDate,
  selectedTime,
  onSelectTime,
  bookedTimes = [],
  loading = false,
}) {
  // Inicializar mes del calendario basado en la fecha seleccionada o la actual
  const initialDate = selectedDate ? new Date(selectedDate + 'T00:00:00') : new Date();
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());

  // Fecha actual para bloquear fechas pasadas
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Navegación de mes
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  // Calcular días del mes
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Domingo

  // Matriz de días
  const days = [];
  for (let i = 0; i < firstDayIndex; i++) {
    days.push({ dayNumber: null, isCurrentMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dayDate = new Date(currentYear, currentMonth, d);
    dayDate.setHours(0, 0, 0, 0);

    const isPast = dayDate < today;
    const isSunday = dayDate.getDay() === 0; // Domingos cerrado
    const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const isSelected = selectedDate === dateString;
    const isToday = dayDate.getTime() === today.getTime();

    days.push({
      dayNumber: d,
      dateString,
      isPast,
      isSunday,
      isSelected,
      isToday,
      isCurrentMonth: true,
      isDisabled: isPast || isSunday,
    });
  }

  // Cálculos de disponibilidad para la fecha seleccionada
  const totalSlots = AVAILABLE_TIME_SLOTS.length;
  const bookedCount = bookedTimes.length;
  const availableCount = Math.max(0, totalSlots - bookedCount);

  // Formato legible de fecha seleccionada
  const formattedSelectedDate = (() => {
    if (!selectedDate) return 'Ninguna';
    const parts = selectedDate.split('-');
    const dateObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return dateObj.toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  })();

  return (
    <div className="calendar-component">
      {/* Selector de Mes y Año */}
      <div className="calendar-wrapper">
        <div className="calendar-header">
          <div className="calendar-month-title">
            {MONTH_NAMES[currentMonth]} {currentYear}
          </div>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              type="button"
              className="calendar-nav-btn"
              onClick={handlePrevMonth}
              title="Mes anterior"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              className="calendar-nav-btn"
              onClick={handleNextMonth}
              title="Mes siguiente"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Días de la semana */}
        <div className="calendar-weekdays">
          {WEEKDAY_NAMES.map((w, index) => (
            <div 
              key={w} 
              style={{ color: index === 0 ? 'var(--text-subtle)' : undefined }}
            >
              {w}
            </div>
          ))}
        </div>

        {/* Cuadrícula de días */}
        <div className="calendar-days-grid">
          {days.map((item, idx) => {
            if (!item.isCurrentMonth) {
              return <div key={`empty-${idx}`} className="calendar-day-cell empty" />;
            }

            let cellClass = 'calendar-day-cell';
            if (item.isSelected) cellClass += ' selected';
            if (item.isToday) cellClass += ' today';
            if (item.isDisabled) cellClass += ' disabled';

            return (
              <button
                type="button"
                key={item.dateString}
                className={cellClass}
                disabled={item.isDisabled}
                onClick={() => {
                  onSelectDate(item.dateString);
                  // Si el horario seleccionado previamente no está libre en la nueva fecha, deseleccionarlo
                  if (selectedTime && bookedTimes.includes(selectedTime)) {
                    onSelectTime('');
                  }
                }}
                title={
                  item.isPast
                    ? 'Fecha pasada'
                    : item.isSunday
                    ? 'Domingos cerrado'
                    : item.isToday
                    ? 'Hoy'
                    : `Seleccionar ${item.dateString}`
                }
              >
                <span>{item.dayNumber}</span>
                {item.isSelected && (
                  <span style={{ position: 'absolute', bottom: '4px', width: '4px', height: '4px', borderRadius: '50%', background: '#fff' }} />
                )}
              </button>
            );
          })}
        </div>
        <div style={{ fontSize: '0.74rem', color: 'var(--text-subtle)', textAlign: 'center', marginTop: '0.75rem' }}>
          * Atención de Lunes a Sábado. Domingos y fechas pasadas no disponibles.
        </div>
      </div>

      {/* Resumen de Disponibilidad para la fecha seleccionada */}
      {selectedDate && (
        <div>
          <div
            className={`day-availability-summary ${
              availableCount > 0 ? 'available' : 'busy'
            }`}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <CalendarIcon size={18} />
              <div>
                <div style={{ textTransform: 'capitalize' }}>{formattedSelectedDate}</div>
                <div style={{ fontSize: '0.78rem', fontWeight: 500, opacity: 0.9 }}>
                  {loading
                    ? 'Comprobando disponibilidad en tiempo real...'
                    : availableCount === 0
                    ? 'Sin turnos disponibles este día'
                    : `${availableCount} de ${totalSlots} turnos disponibles`}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {availableCount > 0 ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', background: '#FFFFFF', padding: '0.2rem 0.6rem', borderRadius: '999px', boxShadow: 'var(--shadow-sm)' }}>
                  <CheckCircle2 size={14} color="var(--available-text)" /> Disponible
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', background: '#FFFFFF', padding: '0.2rem 0.6rem', borderRadius: '999px' }}>
                  <XCircle size={14} color="var(--booked-text)" /> Lleno
                </span>
              )}
            </div>
          </div>

          {/* Selector de Horarios Disponibles */}
          <div className="time-slots-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.95rem' }}>
              <Clock size={16} color="var(--accent-gold-hover)" />
              <span>Horarios Disponibles para esta Fecha</span>
            </div>

            <div className="time-slots-legend">
              <div className="legend-item">
                <span className="legend-dot available"></span>
                <span>Disponible</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot booked"></span>
                <span>Ocupado</span>
              </div>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              <div className="dot-indicator" style={{ margin: '0 auto 0.5rem', width: '12px', height: '12px', background: 'var(--accent-gold)' }} />
              Verificando base de datos Supabase...
            </div>
          ) : (
            <div className="time-slots-grid">
              {AVAILABLE_TIME_SLOTS.map((time) => {
                const isBooked = bookedTimes.includes(time);
                const isSelected = selectedTime === time;

                let btnClass = 'time-slot-btn';
                if (isBooked) {
                  btnClass += ' booked';
                } else {
                  btnClass += ' available';
                }
                if (isSelected) {
                  btnClass += ' selected';
                }

                return (
                  <button
                    type="button"
                    key={time}
                    className={btnClass}
                    disabled={isBooked}
                    onClick={() => onSelectTime(time)}
                  >
                    <div className="slot-time">{time}</div>
                    <div className="slot-status-badge">
                      {isBooked ? 'Ocupado' : isSelected ? 'Elegido' : 'Libre'}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Mensaje de confirmación del horario elegido */}
          {selectedTime && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.75rem 1rem',
              background: 'var(--accent-gold-light)',
              border: '1px solid var(--accent-gold)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.88rem',
              color: 'var(--text-main)',
              marginBottom: '1rem'
            }}>
              <Sparkles size={18} color="var(--accent-gold)" />
              <div>
                <strong>Horario seleccionado:</strong> {selectedTime} del {formattedSelectedDate}. <span style={{ color: 'var(--available-text)', fontWeight: 600 }}>¡Confirmado Disponible!</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
