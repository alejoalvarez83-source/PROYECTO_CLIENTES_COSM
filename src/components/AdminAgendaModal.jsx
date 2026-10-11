import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  MessageSquare, 
  CheckCircle, 
  Filter, 
  RefreshCw,
  ExternalLink 
} from 'lucide-react';
import { getAllAppointments, cancelAppointment } from '../lib/supabase';

export function AdminAgendaModal({ isOpen, onClose }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterDate, setFilterDate] = useState('');

  const loadAll = async () => {
    setLoading(true);
    try {
      const data = await getAllAppointments();
      setAppointments(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadAll();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];

  const filtered = appointments.filter((apt) => {
    if (!filterDate) return true;
    return apt.appointment_date === filterDate;
  });

  const todayCount = appointments.filter(
    (a) => a.appointment_date === todayStr && a.status !== 'cancelled'
  ).length;

  const activeCount = appointments.filter((a) => a.status === 'confirmed').length;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '850px' }} onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close-btn" onClick={onClose}>
          <X size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <div>
            <span className="panel-step-badge">Panel de Control</span>
            <h2 style={{ fontSize: '1.8rem' }}>Agenda de Mildred Restrepo</h2>
          </div>
          <button
            type="button"
            onClick={loadAll}
            className="btn-outline"
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.82rem' }}
            title="Refrescar citas"
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Actualizar</span>
          </button>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
          Visualiza todos los pacientes agendados y contáctalos de inmediato a través de WhatsApp.
        </p>

        {/* Resumen Métricas */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Citas para Hoy</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--accent-gold)' }}>{todayCount}</div>
          </div>
          <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Citas Activas</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--available-text)' }}>{activeCount}</div>
          </div>
        </div>

        {/* Filtros */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600 }}>
            <Filter size={15} /> Filtrar por fecha:
          </div>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
          />
          {filterDate && (
            <button
              type="button"
              onClick={() => setFilterDate('')}
              style={{ fontSize: '0.8rem', color: 'var(--accent-rose)', textDecoration: 'underline' }}
            >
              Ver todas las fechas
            </button>
          )}
        </div>

        {/* Tabla de Citas */}
        <div className="table-container">
          <table className="appointments-table">
            <thead>
              <tr>
                <th>Fecha y Hora</th>
                <th>Paciente</th>
                <th>Cédula</th>
                <th>Tratamiento</th>
                <th>WhatsApp</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No hay citas registradas para este filtro.
                  </td>
                </tr>
              ) : (
                filtered.map((apt) => {
                  const phoneClean = (apt.client_phone || '').replace(/\D/g, '');
                  const waNumber = phoneClean.startsWith('57') ? phoneClean : `57${phoneClean}`;
                  const waMsg = encodeURIComponent(
                    `Hola ${apt.client_name}, te escribo del consultorio de Mildred Restrepo Cosmetóloga para confirmar tu cita de ${apt.service} el día ${apt.appointment_date} a las ${apt.appointment_time}. ¿Cómo estás?`
                  );
                  const waUrl = `https://wa.me/${waNumber}?text=${waMsg}`;

                  return (
                    <tr key={apt.id}>
                      <td>
                        <strong>{apt.appointment_date}</strong>
                        <div style={{ fontSize: '0.82rem', color: 'var(--accent-gold-hover)' }}>{apt.appointment_time}</div>
                      </td>
                      <td>
                        <strong>{apt.client_name}</strong>
                        {apt.notes && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                            Nota: {apt.notes}
                          </div>
                        )}
                      </td>
                      <td>{apt.client_id}</td>
                      <td>{apt.service}</td>
                      <td>
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.35rem 0.65rem',
                            borderRadius: 'var(--radius-sm)',
                            background: '#E8F5E9',
                            color: '#2E7D32',
                            textDecoration: 'none',
                            fontWeight: 600,
                            fontSize: '0.8rem'
                          }}
                        >
                          <Phone size={13} /> {apt.client_phone}
                        </a>
                      </td>
                      <td>
                        <span className={`status-badge ${apt.status}`}>
                          {apt.status === 'confirmed' ? 'Confirmada' : apt.status === 'cancelled' ? 'Cancelada' : 'Completada'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
