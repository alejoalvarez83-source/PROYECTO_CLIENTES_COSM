import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Calendar, 
  Clock, 
  Search, 
  ShieldCheck, 
  Heart, 
  CheckCircle2, 
  Award, 
  MapPin, 
  PhoneCall, 
  Database,
  Lock,
  ChevronRight
} from 'lucide-react';
import { 
  getAppointmentsByDate, 
  bookAppointment, 
  isConfigured 
} from './lib/supabase';
import { BookingForm } from './components/BookingForm';
import { BookingSuccess } from './components/BookingSuccess';
import { MyAppointmentsModal } from './components/MyAppointmentsModal';
import { AdminAgendaModal } from './components/AdminAgendaModal';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';
import { COSMETOLOGY_SERVICES } from './data/services';

export function App() {
  // Fecha seleccionada por defecto: hoy
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedTime, setSelectedTime] = useState('');
  const [bookedTimes, setBookedTimes] = useState([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estado de cita confirmada
  const [confirmedAppointment, setConfirmedAppointment] = useState(null);

  // Modales
  const [showMyBookingsModal, setShowMyBookingsModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Consultar disponibilidad en Supabase cada vez que cambia la fecha seleccionada
  useEffect(() => {
    let isMounted = true;
    const fetchAvailability = async () => {
      if (!selectedDate) return;
      setLoadingAvailability(true);
      try {
        const appointments = await getAppointmentsByDate(selectedDate);
        if (isMounted) {
          const booked = appointments.map((a) => a.appointment_time);
          setBookedTimes(booked);

          // Si el horario seleccionado previamente ya no está disponible, deseleccionarlo
          if (selectedTime && booked.includes(selectedTime)) {
            setSelectedTime('');
          }
        }
      } catch (err) {
        console.error('Error cargando disponibilidad:', err);
      } finally {
        if (isMounted) {
          setLoadingAvailability(false);
        }
      }
    };

    fetchAvailability();
    return () => {
      isMounted = false;
    };
  }, [selectedDate]);

  // Manejar envío de reserva
  const handleBookingSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      const result = await bookAppointment(formData);
      if (result.success) {
        setConfirmedAppointment(result.data);
        // Actualizar lista local de ocupados
        setBookedTimes((prev) => [...prev, formData.appointmentTime]);
        setSelectedTime('');
      } else {
        alert(result.error || 'Ocurrió un error al agendar la cita.');
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión al guardar la cita.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetBooking = () => {
    setConfirmedAppointment(null);
    setSelectedTime('');
  };

  return (
    <div className="app-layout">
      {/* Barra de Navegación */}
      <header className="navbar">
        <div className="container nav-inner">
          <div className="brand-wrapper">
            <div className="brand-logo-badge">MR</div>
            <div className="brand-text">
              <h1>Mildred Restrepo</h1>
              <span>Cosmetología & Estética Facial</span>
            </div>
          </div>

          <div className="nav-actions">
            <button
              type="button"
              className="nav-btn"
              onClick={() => setShowMyBookingsModal(true)}
            >
              <Search size={16} />
              <span>Consultar Mis Citas</span>
            </button>

            <button
              type="button"
              className="nav-btn"
              onClick={() => setShowAdminModal(true)}
              title="Panel para Mildred"
            >
              <Lock size={16} />
              <span>Agenda Mildred</span>
            </button>

            <div
              className={`supabase-pill ${isConfigured ? 'connected' : 'demo'}`}
              onClick={() => setShowConfigModal(true)}
              title="Haz clic para ver detalles de conexión y base de datos"
            >
              <span className="dot-indicator" />
              <span>{isConfigured ? 'Supabase Activo' : 'Supabase (Modo Demo)'}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Contenedor Principal */}
      <main className="container">
        {/* Hero Banner */}
        <section className="hero-section">
          <img 
            src="/banner.jpg" 
            alt="Cabina de Cosmetología Mildred Restrepo" 
            className="hero-bg" 
          />
          <div className="hero-overlay">
            <div className="hero-tag">
              <Sparkles size={14} /> Protocolos Faciales Exclusivos
            </div>
            <h2 className="hero-title">
              Piel renovada, sana y <em>radiante</em>
            </h2>
            <p className="hero-desc">
              Descubre tratamientos faciales personalizados diseñados para las necesidades únicas de tu piel. Agenda tu cita en segundos y asegura tu turno.
            </p>
            <div className="hero-badges">
              <div className="hero-badge-item">
                <CheckCircle2 size={18} />
                <span>Diagnóstico Facial Personalizado</span>
              </div>
              <div className="hero-badge-item">
                <Award size={18} />
                <span>Tecnología Estética Avanzada</span>
              </div>
              <div className="hero-badge-item">
                <Heart size={18} />
                <span>Cuidado Seguro y Profesional</span>
              </div>
            </div>
          </div>
        </section>

        {/* Ficha Especialista Mildred Restrepo */}
        <div className="specialist-card">
          <img 
            src="/mildred.jpg" 
            alt="Mildred Restrepo Cosmetóloga" 
            className="specialist-avatar" 
          />
          <div className="specialist-info">
            <h3>Mildred Restrepo</h3>
            <p>Cosmetóloga & Esteticista Facial Especializada • Más de 8 años de experiencia</p>
          </div>
          <div className="specialist-meta">
            <span style={{ fontSize: '0.85rem', color: 'var(--available-text)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--available-text)' }} />
              Agenda Abierta
            </span>
          </div>
        </div>

        {/* Sección de Reserva de Citas */}
        {confirmedAppointment ? (
          <BookingSuccess 
            appointment={confirmedAppointment} 
            onReset={handleResetBooking} 
          />
        ) : (
          <section id="booking-section">
            <BookingForm
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              selectedTime={selectedTime}
              setSelectedTime={setSelectedTime}
              bookedTimes={bookedTimes}
              loadingAvailability={loadingAvailability}
              onSubmitBooking={handleBookingSubmit}
              isSubmitting={isSubmitting}
            />
          </section>
        )}

        {/* Catálogo de Servicios Destacados */}
        <section style={{ margin: '4rem 0 2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span className="panel-step-badge">Servicios Especializados</span>
            <h2 style={{ fontSize: '2.4rem' }}>Tratamientos de Cabina</h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '580px', margin: '0.5rem auto 0' }}>
              Cada sesión incluye limpieza preparatoria, aparatología de punta y principios activos de alta pureza.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.5rem'
          }}>
            {COSMETOLOGY_SERVICES.map((serv) => (
              <div 
                key={serv.id} 
                className="card-panel" 
                style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    padding: '0.2rem 0.65rem',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--accent-gold-light)',
                    color: 'var(--accent-gold-hover)'
                  }}>
                    {serv.badge}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Clock size={14} /> {serv.duration}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.35rem', marginBottom: '0.5rem' }}>{serv.name}</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.25rem', flex: 1 }}>
                  {serv.description}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', display: 'block' }}>Inversión</span>
                    <strong style={{ fontSize: '1.2rem', color: 'var(--accent-gold-hover)' }}>{serv.price}</strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const section = document.getElementById('booking-section');
                      if (section) section.scrollIntoView({ behavior: 'smooth' });
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      fontSize: '0.86rem',
                      fontWeight: 600,
                      color: 'var(--text-main)',
                      padding: '0.5rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-secondary)'
                    }}
                  >
                    <span>Agendar</span>
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="brand-logo-badge" style={{ margin: '0 auto 1rem', width: '48px', height: '48px' }}>MR</div>
          <div className="footer-brand">Mildred Restrepo Cosmetóloga</div>
          <p className="footer-text" style={{ maxWidth: '500px', margin: '0 auto 1rem' }}>
            Comprometida con la salud, belleza y rejuvenecimiento de tu piel a través de tratamientos cosmetológicos científicos y seguros.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <MapPin size={15} color="var(--accent-gold)" /> Consultorio de Cosmetología Facial
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Calendar size={15} color="var(--accent-gold)" /> Lunes a Sábado: 8:30 AM - 7:00 PM
            </span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>
            © {new Date().getFullYear()} Mildred Restrepo Cosmetóloga. Desarrollado para desplegar en Vercel con base de datos en Supabase.
          </p>
        </div>
      </footer>

      {/* Modales Interactivos */}
      <MyAppointmentsModal
        isOpen={showMyBookingsModal}
        onClose={() => setShowMyBookingsModal(false)}
      />

      <AdminAgendaModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
      />

      <SupabaseConfigModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
      />
    </div>
  );
}

export default App;
