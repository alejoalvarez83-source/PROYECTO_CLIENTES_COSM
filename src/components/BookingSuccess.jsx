import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  CheckCircle, 
  Calendar, 
  Clock, 
  User, 
  CreditCard, 
  Phone, 
  Sparkles, 
  MessageCircle, 
  Printer, 
  ArrowLeft 
} from 'lucide-react';

export function BookingSuccess({ appointment, onReset }) {
  useEffect(() => {
    // Lanzar confeti estético de celebración
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#C29B38', '#C98A7D', '#FAF1DF', '#2E7D32']
      });
    } catch (e) {
      // Ignorar si hay bloqueo en entorno
    }
  }, []);

  if (!appointment) return null;

  const {
    id,
    client_name,
    client_id,
    client_phone,
    service,
    appointment_date,
    appointment_time,
    notes
  } = appointment;

  // Formato legible de fecha
  const formattedDate = (() => {
    try {
      const parts = appointment_date.split('-');
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      return d.toLocaleDateString('es-CO', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return appointment_date;
    }
  })();

  // Mensaje para enviar a WhatsApp
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_PHONE || '573100000000';
  const whatsappMsg = encodeURIComponent(
    `✨ Hola Mildred Restrepo Cosmetóloga, acabo de agendar mi cita:\n\n` +
    `👤 Nombre: ${client_name}\n` +
    `🆔 Cédula: ${client_id}\n` +
    `📱 Teléfono: ${client_phone}\n` +
    `💆‍♀️ Tratamiento: ${service}\n` +
    `📅 Fecha: ${appointment_date} (${formattedDate})\n` +
    `⏰ Horario: ${appointment_time}\n` +
    (notes ? `📝 Nota: ${notes}\n` : '') +
    `\n¡Agradezco tu confirmación y quedo atenta/o!`
  );

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMsg}`;

  return (
    <div className="success-card">
      <div className="success-icon-badge">
        <CheckCircle size={44} />
      </div>

      <span className="panel-step-badge">¡Reserva Completada con Éxito!</span>
      <h2 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>Cita Confirmada</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
        Tu cita ha quedado registrada exitosamente en el sistema de <strong>Mildred Restrepo Cosmetóloga</strong>.
      </p>

      {/* Ticket Descriptivo */}
      <div className="appointment-ticket">
        <div className="ticket-header">
          <div>
            <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent-gold)' }}>
              Comprobante de Reserva
            </div>
            <strong style={{ fontSize: '1.1rem' }}>Mildred Restrepo Cosmetología</strong>
          </div>
          <div className="ticket-code">ID: {String(id).slice(0, 8)}</div>
        </div>

        <div className="ticket-item">
          <span><User size={15} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Paciente:</span>
          <span>{client_name}</span>
        </div>

        <div className="ticket-item">
          <span><CreditCard size={15} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Cédula:</span>
          <span>{client_id}</span>
        </div>

        <div className="ticket-item">
          <span><Phone size={15} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Teléfono:</span>
          <span>{client_phone}</span>
        </div>

        <div className="ticket-item">
          <span><Sparkles size={15} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Servicio:</span>
          <span>{service}</span>
        </div>

        <div className="ticket-item">
          <span><Calendar size={15} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Fecha:</span>
          <span style={{ textTransform: 'capitalize' }}>{formattedDate}</span>
        </div>

        <div className="ticket-item">
          <span><Clock size={15} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Horario:</span>
          <span style={{ color: 'var(--available-text)' }}>{appointment_time}</span>
        </div>

        {notes && (
          <div className="ticket-item" style={{ borderTop: '1px dashed var(--border-light)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
            <span>Observaciones:</span>
            <span>{notes}</span>
          </div>
        )}
      </div>

      {/* Acciones */}
      <div className="success-actions">
        <a 
          href={whatsappUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="btn-whatsapp"
        >
          <MessageCircle size={20} />
          <span>Enviar confirmación por WhatsApp a Mildred</span>
        </a>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <button 
            type="button" 
            className="btn-outline" 
            onClick={() => window.print()}
          >
            <Printer size={18} />
            <span>Imprimir Ticket</span>
          </button>

          <button 
            type="button" 
            className="btn-outline" 
            onClick={onReset}
          >
            <ArrowLeft size={18} />
            <span>Agendar Otra Cita</span>
          </button>
        </div>
      </div>
    </div>
  );
}
