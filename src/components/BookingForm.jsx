import React, { useState } from 'react';
import { 
  User, 
  CreditCard, 
  Phone, 
  Sparkles, 
  Calendar, 
  Clock, 
  Check, 
  AlertCircle,
  FileText,
  Loader2
} from 'lucide-react';
import { COSMETOLOGY_SERVICES } from '../data/services';
import { BookingCalendar } from './BookingCalendar';

export function BookingForm({
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
  bookedTimes,
  loadingAvailability,
  onSubmitBooking,
  isSubmitting,
}) {
  const [clientName, setClientName] = useState('');
  const [clientId, setClientId] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState(COSMETOLOGY_SERVICES[0].id);
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');

  const selectedService = COSMETOLOGY_SERVICES.find((s) => s.id === selectedServiceId) || COSMETOLOGY_SERVICES[0];

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    // Validaciones
    if (!clientName.trim()) {
      setFormError('Por favor ingresa tu nombre completo.');
      return;
    }
    if (!clientId.trim() || clientId.trim().length < 5) {
      setFormError('Por favor ingresa un número de cédula o documento válido.');
      return;
    }
    if (!clientPhone.trim() || clientPhone.trim().length < 7) {
      setFormError('Por favor ingresa un número de teléfono o WhatsApp de contacto válido.');
      return;
    }
    if (!selectedDate) {
      setFormError('Por favor selecciona una fecha en el calendario.');
      return;
    }
    if (!selectedTime) {
      setFormError('Por favor escoge un horario disponible para tu cita.');
      return;
    }
    if (bookedTimes.includes(selectedTime)) {
      setFormError('El horario seleccionado ya no está disponible. Por favor elige otro horario.');
      return;
    }

    onSubmitBooking({
      clientName: clientName.trim(),
      clientId: clientId.trim(),
      clientPhone: clientPhone.trim(),
      service: selectedService.name,
      appointmentDate: selectedDate,
      appointmentTime: selectedTime,
      notes: notes.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="booking-grid">
      {/* Panel Izquierdo: Calendario y Disponibilidad de Horas */}
      <div className="card-panel">
        <div className="panel-header">
          <span className="panel-step-badge">Paso 1 de 2</span>
          <h2 className="panel-title">Fecha y Horario de la Cita</h2>
          <p className="panel-subtitle">
            Selecciona el día en el calendario para visualizar la disponibilidad de turnos en tiempo real.
          </p>
        </div>

        <BookingCalendar
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          selectedTime={selectedTime}
          onSelectTime={setSelectedTime}
          bookedTimes={bookedTimes}
          loading={loadingAvailability}
        />
      </div>

      {/* Panel Derecho: Datos del Cliente y Servicio */}
      <div className="card-panel">
        <div className="panel-header">
          <span className="panel-step-badge">Paso 2 de 2</span>
          <h2 className="panel-title">Tus Datos Personales</h2>
          <p className="panel-subtitle">
            Ingresa tu información para confirmar tu reserva personalizada.
          </p>
        </div>

        {formError && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            padding: '0.85rem 1rem',
            background: 'var(--booked-bg)',
            border: '1px solid var(--booked-border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--booked-text)',
            fontSize: '0.88rem',
            fontWeight: 500,
            marginBottom: '1.25rem'
          }}>
            <AlertCircle size={18} />
            <span>{formError}</span>
          </div>
        )}

        {/* Nombre Completo */}
        <div className="form-group">
          <label className="form-label" htmlFor="client-name">
            <span>Nombre Completo</span>
            <span className="label-required">* Requerido</span>
          </label>
          <div className="input-with-icon">
            <User size={18} />
            <input
              id="client-name"
              type="text"
              required
              placeholder="Ej. María Camila Pérez"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
            />
          </div>
        </div>

        {/* Cédula de Ciudadanía */}
        <div className="form-group">
          <label className="form-label" htmlFor="client-id">
            <span>Cédula de Ciudadanía / Documento</span>
            <span className="label-required">* Requerido</span>
          </label>
          <div className="input-with-icon">
            <CreditCard size={18} />
            <input
              id="client-id"
              type="text"
              required
              placeholder="Ej. 1020456789"
              value={clientId}
              onChange={(e) => setClientId(e.target.value.replace(/\D/g, ''))}
            />
          </div>
        </div>

        {/* Teléfono / WhatsApp */}
        <div className="form-group">
          <label className="form-label" htmlFor="client-phone">
            <span>Número de Teléfono / WhatsApp</span>
            <span className="label-required">* Requerido</span>
          </label>
          <div className="input-with-icon">
            <Phone size={18} />
            <input
              id="client-phone"
              type="tel"
              required
              placeholder="Ej. 310 123 4567"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
            />
          </div>
        </div>

        {/* Selección de Tratamiento Cosmetológico */}
        <div className="form-group">
          <label className="form-label" htmlFor="treatment-select">
            <span>Tratamiento Cosmetológico</span>
          </label>
          <select
            id="treatment-select"
            value={selectedServiceId}
            onChange={(e) => setSelectedServiceId(e.target.value)}
          >
            {COSMETOLOGY_SERVICES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.duration}) - {s.price}
              </option>
            ))}
          </select>
          <div style={{
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            marginTop: '0.4rem',
            background: 'var(--bg-secondary)',
            padding: '0.6rem 0.85rem',
            borderRadius: 'var(--radius-sm)'
          }}>
            {selectedService.description}
          </div>
        </div>

        {/* Observaciones / Notas */}
        <div className="form-group">
          <label className="form-label" htmlFor="notes">
            <span>Observaciones o Tipo de Piel (Opcional)</span>
          </label>
          <textarea
            id="notes"
            rows="2"
            placeholder="Ej. Piel sensible, alergia a algún componente, primera vez, etc."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* Resumen previo a la confirmación */}
        <div className="selection-preview-box">
          <div className="preview-row">
            <span className="preview-label">Tratamiento:</span>
            <span className="preview-val">{selectedService.name}</span>
          </div>
          <div className="preview-row">
            <span className="preview-label">Fecha seleccionada:</span>
            <span className="preview-val">
              {selectedDate || <em style={{ color: 'var(--text-subtle)' }}>Pendiente en calendario</em>}
            </span>
          </div>
          <div className="preview-row">
            <span className="preview-label">Horario:</span>
            <span className="preview-val">
              {selectedTime ? (
                <span style={{ color: 'var(--available-text)' }}>{selectedTime}</span>
              ) : (
                <em style={{ color: 'var(--text-subtle)' }}>Pendiente escoger hora</em>
              )}
            </span>
          </div>
          <div className="preview-row" style={{ borderTop: '1px solid var(--border-light)', paddingTop: '0.45rem', marginTop: '0.45rem' }}>
            <span className="preview-label">Valor estimado:</span>
            <span className="preview-val" style={{ color: 'var(--accent-gold-hover)' }}>{selectedService.price}</span>
          </div>
        </div>

        {/* Botón de Enviar Cita */}
        <button
          type="submit"
          className="btn-submit-booking"
          disabled={isSubmitting || !selectedDate || !selectedTime || bookedTimes.includes(selectedTime)}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="spin" size={20} />
              <span>Confirmando cita en Supabase...</span>
            </>
          ) : (
            <>
              <Sparkles size={20} />
              <span>Confirmar y Agendar Cita</span>
            </>
          )}
        </button>

        <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-subtle)', marginTop: '0.75rem' }}>
          * Al agendar, tus datos quedan registrados de forma segura y recibirás recordatorio por WhatsApp.
        </p>
      </div>
    </form>
  );
}
