# ✨ Mildred Restrepo - Cosmetóloga & Estética Facial
### Aplicación Web de Agendamiento de Citas con Supabase y Despliegue en Vercel

Una aplicación web con diseño de estética spa (tonos champagne, oro rosa y crema), desarrollada para gestionar el agendamiento de citas de cosmetología de la marca **Mildred Restrepo Cosmetóloga**.

---

## 🌟 Características Principales

1. **Agendamiento Completo**:
   - Registro de información del cliente: **Nombre Completo**, **Cédula de Ciudadanía** y **Número de Teléfono / Celular**.
   - Selección de tratamientos cosmetológicos (Limpieza facial profunda, Hidratación con ácido hialurónico, Peeling químico, Microneedling / Dermapen, Drenaje linfático, etc.).
   - Campo para observaciones clínicas o tipo de piel (sensible, grasa, alergias).

2. **Calendario Dinámico e Interactivo**:
   - Selección de fecha con navegación mensual.
   - Bloqueo automático de fechas pasadas y domingos.
   - Detección visual del día de hoy y selección activa.

3. **Verificación de Disponibilidad en Tiempo Real**:
   - Resumen del día: Muestra si la fecha tiene disponibilidad y cuántos turnos quedan libres.
   - Visualización de horarios:
     - 🟢 **Libre / Disponible**: Se puede seleccionar con un clic.
     - 🔴 **Ocupado / Reservado**: Bloqueado automáticamente para evitar colisiones.
   - Alerta en tiempo real de horario confirmado antes de agendar.

4. **Confirmación y Comprobante**:
   - Ticket de reserva detallado con código de cita.
   - Botón directo para **confirmar por WhatsApp** con mensaje pre-redactado a Mildred Restrepo.
   - Opción para imprimir el comprobante.

5. **Portal de Consulta ("Mis Citas")**:
   - Los clientes pueden ingresar su cédula para ver sus citas agendadas, su estado (Confirmada / Cancelada) y cancelarla si lo requieren.

6. **Panel de Agenda para Mildred Restrepo**:
   - Vista de control administrativo con métricas (citas de hoy y citas activas).
   - Filtro por fecha y acceso directo a WhatsApp con cada paciente.

7. **Integración con Supabase y Fallback Inteligente**:
   - Conexión directa mediante `@supabase/supabase-js`.
   - Incluye script SQL con políticas de seguridad **RLS (Row Level Security)** e índice único para prevenir duplicados.
   - Incluye modo de demostración automático con almacenamiento local para pruebas inmediatas sin bloquear la interfaz.

---

## 🚀 Puesta en Marcha Local

1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Iniciar servidor de desarrollo:
   ```bash
   npm run dev
   ```
   Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

---

## 🗄️ Configuración de la Base de Datos (Supabase)

1. Ingresa a [Supabase.com](https://supabase.com) y crea un nuevo proyecto gratuito.
2. Ve a la sección **SQL Editor** en el menú lateral izquierdo.
3. Abre el archivo [`supabase_schema.sql`](file:///d:/ALEJANDRO/Documentos/PROYECTO%20COSMETOLOGIA/supabase_schema.sql) de este proyecto, copia todo su contenido y haz clic en **Run**.
4. Ve a **Project Settings -> API** y copia:
   - **Project URL**
   - **Project API Anon Key**
5. Crea un archivo `.env` en la raíz del proyecto (basado en `.env.example`):
   ```env
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-key-de-supabase
   VITE_WHATSAPP_PHONE=573100000000
   ```

---

## ☁️ Publicación en Vercel

El proyecto incluye el archivo [`vercel.json`](file:///d:/ALEJANDRO/Documentos/PROYECTO%20COSMETOLOGIA/vercel.json) listo para el despliegue.

### Método 1: Desde la Web de Vercel (Recomendado)
1. Sube este proyecto a tu repositorio de GitHub / GitLab.
2. Entra a [Vercel.com](https://vercel.com) y selecciona **Add New... -> Project**.
3. Importa el repositorio.
4. En la sección **Environment Variables**, agrega:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_WHATSAPP_PHONE`
5. Haz clic en **Deploy**. ¡Tu aplicación quedará pública en pocos segundos!

### Método 2: Con Vercel CLI
```bash
npm install -g vercel
vercel
```

---

## 📁 Estructura del Proyecto

- `src/App.jsx`: Componente principal con navegación, hero y modales.
- `src/components/BookingCalendar.jsx`: Calendario interactivo y selector de horas en tiempo real.
- `src/components/BookingForm.jsx`: Formulario con validaciones (nombre, cédula, teléfono).
- `src/components/BookingSuccess.jsx`: Pantalla de confirmación, ticket y enlace a WhatsApp.
- `src/components/MyAppointmentsModal.jsx`: Consulta de citas por cédula.
- `src/components/AdminAgendaModal.jsx`: Panel de control de agenda para Mildred.
- `src/components/SupabaseConfigModal.jsx`: Guía interactiva de conexión.
- `src/lib/supabase.js`: Cliente de Supabase, verificación de conflictos y fallback.
- `src/data/services.js`: Catálogo de tratamientos y horarios disponibles.
- `supabase_schema.sql`: Script SQL con creación de tablas, índices y políticas RLS.
- `vercel.json`: Reglas de enrutamiento para Vercel.
