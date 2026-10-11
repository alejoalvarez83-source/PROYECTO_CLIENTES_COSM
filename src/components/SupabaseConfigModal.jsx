import React, { useState } from 'react';
import { 
  X, 
  Database, 
  Check, 
  Copy, 
  ExternalLink, 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle 
} from 'lucide-react';
import { isConfigured } from '../lib/supabase';

export function SupabaseConfigModal({ isOpen, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const copySqlSnippet = () => {
    const sql = `-- Copia y pega en el SQL Editor de tu proyecto Supabase:
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    client_name TEXT NOT NULL,
    client_id TEXT NOT NULL,
    client_phone TEXT NOT NULL,
    service TEXT NOT NULL DEFAULT 'Limpieza Facial Profunda',
    appointment_date DATE NOT NULL,
    appointment_time TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'completed', 'cancelled')),
    notes TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_appointment
ON public.appointments (appointment_date, appointment_time)
WHERE status != 'cancelled';

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir lectura publica" ON public.appointments FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Permitir insercion" ON public.appointments FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Permitir actualizacion" ON public.appointments FOR UPDATE TO anon, authenticated USING (true);`;

    navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close-btn" onClick={onClose}>
          <X size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
          <Database size={24} color="var(--accent-gold)" />
          <h2 style={{ fontSize: '1.6rem' }}>Configuración de Supabase & Vercel</h2>
        </div>

        {/* Estado actual */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.85rem 1.1rem',
          borderRadius: 'var(--radius-md)',
          background: isConfigured ? '#E6F4EA' : '#FEF7E0',
          border: `1px solid ${isConfigured ? '#A8DAB5' : '#FDD663'}`,
          color: isConfigured ? '#137333' : '#B06000',
          marginBottom: '1.5rem',
          fontSize: '0.9rem',
          fontWeight: 600
        }}>
          {isConfigured ? (
            <>
              <ShieldCheck size={22} />
              <div>
                <strong>¡Supabase conectado en tiempo real!</strong> Las citas se guardan y consultan directamente en tu base de datos remota.
              </div>
            </>
          ) : (
            <>
              <AlertTriangle size={22} />
              <div>
                <strong>Modo Demostración Activo.</strong> La aplicación está funcionando al 100% de manera interactiva con almacenamiento local y datos simulados. Sigue estos 3 pasos para conectar tu base de datos real.
              </div>
            </>
          )}
        </div>

        {/* Pasos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.9rem' }}>
          <div>
            <strong style={{ display: 'block', marginBottom: '0.25rem', color: 'var(--accent-gold-hover)' }}>
              1. Crea un proyecto en Supabase (Gratis)
            </strong>
            <p style={{ color: 'var(--text-muted)' }}>
              Ingresa a <a href="https://supabase.com" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-gold)', textDecoration: 'underline' }}>supabase.com</a> y crea un nuevo proyecto en tu región más cercana.
            </p>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <strong style={{ color: 'var(--accent-gold-hover)' }}>
                2. Ejecuta el script SQL en Supabase
              </strong>
              <button
                type="button"
                onClick={copySqlSnippet}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.78rem',
                  color: 'var(--accent-gold-hover)',
                  fontWeight: 600
                }}
              >
                {copied ? <Check size={14} color="#2E7D32" /> : <Copy size={14} />}
                {copied ? '¡Copiado!' : 'Copiar SQL'}
              </button>
            </div>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              En tu panel de Supabase ve a <strong>SQL Editor</strong>, pega el código del archivo <code>supabase_schema.sql</code> y presiona <strong>Run</strong>.
            </p>
          </div>

          <div>
            <strong style={{ display: 'block', marginBottom: '0.25rem', color: 'var(--accent-gold-hover)' }}>
              3. Configura tus variables de entorno (.env y Vercel)
            </strong>
            <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              En <strong>Project Settings → API</strong> copia tu URL y tu clave anónima (anon public key), y colócalas en tu archivo <code>.env</code> local y en las <strong>Environment Variables</strong> de tu proyecto en Vercel:
            </p>
            <div className="code-snippet-box">
              VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co<br />
              VITE_SUPABASE_ANON_KEY=eyJhbGciOi...<br />
              VITE_WHATSAPP_PHONE=573100000000
            </div>
          </div>

          <div>
            <strong style={{ display: 'block', marginBottom: '0.25rem', color: 'var(--accent-gold-hover)' }}>
              4. Despliegue en Vercel
            </strong>
            <p style={{ color: 'var(--text-muted)' }}>
              El repositorio ya cuenta con el archivo <code>vercel.json</code> listo. Solo sube tu código a GitHub y conéctalo con tu cuenta en <a href="https://vercel.com" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-gold)', textDecoration: 'underline' }}>vercel.com</a>. ¡Se desplegará automáticamente!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
