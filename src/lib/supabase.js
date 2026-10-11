import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verifica si las credenciales de Supabase están configuradas adecuadamente
export const isConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://tu-proyecto.supabase.co' &&
  !supabaseUrl.includes('placeholder')
);

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Clave para almacenamiento de respaldo local si no hay Supabase configurado aún
const LOCAL_STORAGE_KEY = 'mildred_restrepo_appointments_v1';

// Citas iniciales de demostración para que el usuario pueda probar de inmediato
const getInitialDemoAppointments = () => {
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  
  return [
    {
      id: 'demo-1',
      created_at: new Date().toISOString(),
      client_name: 'Camila Restrepo',
      client_id: '1020456789',
      client_phone: '3104567890',
      service: 'Limpieza Facial Profunda',
      appointment_date: today,
      appointment_time: '10:00 AM',
      status: 'confirmed',
      notes: 'Piel mixta con tendencia acneica',
    },
    {
      id: 'demo-2',
      created_at: new Date().toISOString(),
      client_name: 'Valentina Gómez',
      client_id: '1035987654',
      client_phone: '3129876543',
      service: 'Hidratación con Ácido Hialurónico',
      appointment_date: today,
      appointment_time: '03:00 PM',
      status: 'confirmed',
      notes: 'Tratamiento previo realizado hace un mes',
    },
    {
      id: 'demo-3',
      created_at: new Date().toISOString(),
      client_name: 'Andrea Morales',
      client_id: '1017894561',
      client_phone: '3007654321',
      service: 'Peeling Químico & Luminosidad',
      appointment_date: tomorrow,
      appointment_time: '11:30 AM',
      status: 'confirmed',
      notes: 'Primera sesión informativa',
    }
  ];
};

const getLocalAppointments = () => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      const initial = getInitialDemoAppointments();
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error leyendo citas locales:', e);
    return getInitialDemoAppointments();
  }
};

const saveLocalAppointments = (appointments) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(appointments));
  } catch (e) {
    console.error('Error guardando citas locales:', e);
  }
};

/**
 * Obtiene las citas activas para una fecha específica (YYYY-MM-DD)
 */
export async function getAppointmentsByDate(dateString) {
  if (isConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('appointment_date', dateString)
        .neq('status', 'cancelled');

      if (error) {
        console.warn('Error consultando Supabase, usando fallback local:', error.message);
        return getLocalAppointments().filter(
          (apt) => apt.appointment_date === dateString && apt.status !== 'cancelled'
        );
      }
      return data || [];
    } catch (err) {
      console.warn('Fallo de conexión Supabase:', err);
    }
  }

  // Modo local
  const all = getLocalAppointments();
  return all.filter(
    (apt) => apt.appointment_date === dateString && apt.status !== 'cancelled'
  );
}

/**
 * Verifica si un horario específico está disponible en una fecha
 */
export async function checkSlotAvailable(dateString, timeSlot) {
  const existing = await getAppointmentsByDate(dateString);
  return !existing.some((apt) => apt.appointment_time === timeSlot);
}

/**
 * Crea una nueva cita en Supabase (o LocalStorage)
 */
export async function bookAppointment({
  clientName,
  clientId,
  clientPhone,
  service,
  appointmentDate,
  appointmentTime,
  notes = '',
}) {
  // Validación de disponibilidad previa
  const isAvailable = await checkSlotAvailable(appointmentDate, appointmentTime);
  if (!isAvailable) {
    return {
      success: false,
      error: 'Lo sentimos, este horario ya acaba de ser reservado por otro cliente. Por favor elige otro.',
    };
  }

  const newAppointment = {
    client_name: clientName.trim(),
    client_id: clientId.trim(),
    client_phone: clientPhone.trim(),
    service: service || 'Limpieza Facial Profunda',
    appointment_date: appointmentDate,
    appointment_time: appointmentTime,
    status: 'confirmed',
    notes: notes.trim(),
  };

  if (isConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert([newAppointment])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          return {
            success: false,
            error: 'Este horario ya está ocupado en la base de datos.',
          };
        }
        throw error;
      }

      return { success: true, data };
    } catch (err) {
      console.error('Error insertando en Supabase:', err);
      // En caso de fallo con Supabase, guardar localmente para no perder la cita
      const localList = getLocalAppointments();
      const localApt = {
        id: 'local-' + Date.now(),
        created_at: new Date().toISOString(),
        ...newAppointment,
      };
      localList.push(localApt);
      saveLocalAppointments(localList);
      return {
        success: true,
        data: localApt,
        warning: 'Cita guardada en modo fuera de línea temporal.',
      };
    }
  }

  // Guardado en modo local
  const localList = getLocalAppointments();
  const localApt = {
    id: 'local-' + Date.now(),
    created_at: new Date().toISOString(),
    ...newAppointment,
  };
  localList.push(localApt);
  saveLocalAppointments(localList);

  return { success: true, data: localApt };
}

/**
 * Consulta citas por cédula del cliente
 */
export async function getAppointmentsByCedula(cedula) {
  const cleanCedula = cedula.trim();
  if (isConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('client_id', cleanCedula)
        .order('appointment_date', { ascending: true });

      if (!error && data) return data;
    } catch (err) {
      console.warn('Error consultando Supabase por cédula:', err);
    }
  }

  const localList = getLocalAppointments();
  return localList.filter((apt) => apt.client_id === cleanCedula);
}

/**
 * Cancela una cita
 */
export async function cancelAppointment(id) {
  if (isConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', id);

      if (!error) return { success: true };
    } catch (err) {
      console.error('Error cancelando en Supabase:', err);
    }
  }

  const list = getLocalAppointments().map((apt) =>
    apt.id === id ? { ...apt, status: 'cancelled' } : apt
  );
  saveLocalAppointments(list);
  return { success: true };
}

/**
 * Obtiene todas las citas para el panel de Mildred (agenda completa)
 */
export async function getAllAppointments() {
  if (isConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true });

      if (!error && data) return data;
    } catch (err) {
      console.warn('Error consultando todas las citas en Supabase:', err);
    }
  }

  return getLocalAppointments();
}
