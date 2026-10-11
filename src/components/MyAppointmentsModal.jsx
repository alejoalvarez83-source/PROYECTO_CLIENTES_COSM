import React, { useState } from 'react';
import { 
  X, 
  Search, 
  Calendar, 
  Clock, 
  User, 
  CreditCard, 
  AlertCircle, 
  CheckCircle2, 
  Trash2,
  Loader2 
} from 'lucide-react';
import { getAppointmentsByCedula, cancelAppointment } from '../lib/supabase';

export function MyAppointmentsModal({ isOpen, onClose }) {
  const [cedulaInput, setCedulaInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [cancelMessage, setCancelMessage] = useState('');

  if (!isOpen) return null;

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!cedulaInput.trim()) return;

    setLoading(true);
    setCancelMessage('');
    try {
      const results = await getAppointmentsByCedula(cedulaInput.trim());
      setAppointments(results);
      setSearched(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('¿Estás seguro/a de que deseas cancelar esta cita?')) return;

    const res = await cancelAppointment(id);
    if (res.success) {
      setCancelMessage('Cita cancelada con éxito. El horario ha quedado liberado.');
      setAppointments((prev) =>
        prev.map((apt) => (apt.id === id ? { ...apt, status: 'cancelled' } : apt))
      );
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close-btn" onClick={onClose}>
          <X size={18} />
        </button>

        <span className="panel-step-badge">Portal del Cliente</span>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Consultar Mis Citas</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Ingresa tu número de cédula para ver el historial y estado de tus citas agendadas con Mildred Restrepo.
        </p>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.65rem', marginBottom: '1.5rem' }}>
          <div className="input-with-icon" style={{ flex: 1 }}>
            <CreditCard size={18} />
            <input
              type="text"
              placeholder="Ingresa tu número de cédula..."
              value={cedulaInput}
              onChange={(e) => setCedulaInput(e.target.value.replace(/\D/g, ''))}
              required
            />
          </div>
          <button 
            type="submit" 
            className="btn-submit-booking" 
            style={{ width: 'auto', padding: '0 1.5rem' }}
            disabled={loading}
          >
            {loading ? <Loader2 className="spin" size={18} /> : <Search size={18} />}
            <span>Buscar</span>
          </button>
        </form>

        {cancelMessage && (
          <div style={{
            padding: '0.75rem 1rem',
            background: 'var(--available-bg)',
            color: 'var(--available-text)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.88rem',
            marginBottom: '1rem'
          }}>
            {cancelMessage}
          </div>
        )}

        {searched && (
          <div>
            {appointments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                <AlertCircle size={32} style={{ margin: '0 auto 0.5rem', color: 'var(--accent-gold)' }} />
                <p>No se encontraron citas registradas para la cédula <strong>{cedulaInput}</strong>.</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="appointments-table">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Hora</th>
                      <th>Tratamiento</th>
                      <th>Estado</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((apt) => (
                      <tr key={apt.id}>
                        <td>{apt.appointment_date}</td>
                        <td><strong>{apt.appointment_time}</strong></td>
                        <td>{apt.service}</td>
                        <td>
                          <span className={`status-badge ${apt.status}`}>
                            {apt.status === 'confirmed' ? 'Confirmada' : apt.status === 'cancelled' ? 'Cancelada' : 'Completada'}
                          </span>
                        </td>
                        <td>
                          {apt.status === 'confirmed' && (
                            <button
                              type="button"
                              onClick={() => handleCancel(apt.id)}
                              style={{
                                color: 'var(--booked-text)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                fontSize: '0.8rem',
                                padding: '0.3rem 0.6rem',
                                borderRadius: 'var(--radius-sm)',
                                background: 'var(--booked-bg)'
                              }}
                            >
                              <Trash2 size={13} /> Cancelar
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
