# Sistema de Gestión de Turnos - Peluquería

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React + Vite + TypeScript + TailwindCSS |
| Backend | Node.js + Express + TypeScript |
| Base de datos | MySQL 8.0 (Docker) |
| Idioma | Español |

## Requerimientos del proyecto

- **Usuarios**: Dueño, empleados y clientes registrados
- **Autenticación**: Login con usuario y contraseña con roles (admin, empleado, cliente)
- **Registro clientes**: Obligatorio para agendar
- **Servicios**: Cada servicio tiene duración configurable
- **Horarios**: Variables por día de la semana
- **Vista turnos**: Calendario mensual
- **Gestión turnos**: Solo dueño/empleados pueden cancelar o modificar
- **Fidelización**: Por cantidad de visitas
- **Notificaciones**: Recordatorios automáticos de turnos

---

## Entidades de base de datos

```
Clientes (id, nombre, email, teléfono, contraseña_hash, visitas_acumuladas, fecha_registro)
Empleados (id, nombre, email, teléfono, contraseña_hash, rol: admin|empleado, activo)
Servicios (id, nombre, descripción, duración_minutos, precio, activo)
Turnos (id, cliente_id, empleado_id, servicio_id, fecha, hora_inicio, hora_fin, estado: pendiente|confirmado|cancelado|completado, observaciones)
Horarios (id, empleado_id, día_semana, hora_apertura, hora_cierre, activo)
ConfigFidelización (id, visitas_requeridas, descripcion_beneficio, activo)
```

---

## Estructura de archivos

```
peluqueria/
├── servidor/
│   ├── index.ts
│   ├── config/
│   │   ├── base-de-datos.ts
│   │   └── entorno.ts
│   ├── rutas/
│   │   ├── autenticacion.rutas.ts
│   │   ├── servicios.rutas.ts
│   │   ├── empleados.rutas.ts
│   │   ├── turnos.rutas.ts
│   │   ├── horarios.rutas.ts
│   │   ├── fidelizacion.rutas.ts
│   │   └── estadisticas.rutas.ts
│   ├── controladores/
│   │   ├── autenticacion.controlador.ts
│   │   ├── servicios.controlador.ts
│   │   ├── empleados.controlador.ts
│   │   ├── turnos.controlador.ts
│   │   ├── horarios.controlador.ts
│   │   ├── fidelizacion.controlador.ts
│   │   └── estadisticas.controlador.ts
│   ├── servicios/           # Lógica de negocio
│   │   ├── clientes.servicio.ts
│   │   ├── turnos.servicio.ts
│   │   ├── disponibilidad.servicio.ts
│   │   ├── fidelizacion.servicio.ts
│   │   └── notificacion.servicio.ts
│   ├── middleware/
│   │   ├── verificar-token.ts
│   │   └── verificar-rol.ts
│   ├── esquemas/            # Validación (zod)
│   │   ├── cliente.esquema.ts
│   │   ├── turno.esquema.ts
│   │   └── servicio.esquema.ts
│   ├── utilidades/
│   │   ├── correo.ts
│   │   ├── fecha.ts
│   │   └── notificaciones.ts
│   └── tipos/
│       └── index.ts
│
├── src/                     # Frontend React
│   ├── main.tsx
│   ├── App.tsx
│   ├── paginas/
│   │   ├── InicioSesion.tsx
│   │   ├── Registro.tsx
│   │   ├── OlvideContrasena.tsx
│   │   ├── PanelControl.tsx       # Dashboard por rol
│   │   ├── Calendario.tsx         # Vista mensual
│   │   ├── Servicios.tsx
│   │   ├── Empleados.tsx
│   │   ├── Horarios.tsx
│   │   ├── Estadisticas.tsx
│   │   ├── MisTurnos.tsx          # Cliente
│   │   ├── Fidelizacion.tsx
│   │   ├── Perfil.tsx
│   │   └── NoEncontrado.tsx       # 404
│   ├── componentes/
│   │   ├── Encabezado.tsx
│   │   ├── PieDePagina.tsx
│   │   ├── ModalConfirmar.tsx
│   │   ├── CalendarioTurnos.tsx
│   │   ├── TarjetaServicio.tsx
│   │   ├── FormularioTurno.tsx
│   │   └── ListaTurnos.tsx
│   ├── contexto/
│   │   └── SesionContexto.tsx      # Auth context
│   ├── hooks/
│   │   ├── useAutenticacion.ts
│   │   └── useTurnos.ts
│   ├── api/
│   │   ├── cliente-api.ts
│   │   ├── turno-api.ts
│   │   ├── servicio-api.ts
│   │   ├── empleado-api.ts
│   │   ├── fidelizacion-api.ts
│   │   └── estadistica-api.ts
│   ├── tipos/
│   │   └── index.ts
│   └── index.css
│
├── docker-compose.yml
├── package.json
├── tsconfig.json
└── AGENTS.md
```

---

## Convenciones de nomenclatura

| Concepto | Español |
|----------|---------|
| Carpeta servidor | `servidor/` |
| Controlador | `[entidad].controlador.ts` |
| Ruta/endpoint | `[entidad].rutas.ts` |
| Middleware | `verificar-[accion].ts` |
| Esquema validación | `[entidad].esquema.ts` |
| Servicio lógica | `[entidad].servicio.ts` |
| Contexto React | `[Nombre]Contexto.tsx` |
| Página | `[Nombre].tsx` |
| Hook | `use[Nombre].ts` |
| API client | `[entidad]-api.ts` |

### Variables, funciones y tablas

```typescript
// Variables y funciones en español
const obtenerTurnos = async (idUsuario: number) => { ... }

// Tablas BD
const TURNO = "turnos";
const SERVICIO = "servicios";
```

---

## Endpoints de la API

```
POST   /api/autenticacion/iniciar-sesion
POST   /api/autenticacion/registrarse
GET    /api/autenticacion/perfil
PUT    /api/autenticacion/perfil
PUT    /api/autenticacion/cambiar-contrasena
POST   /api/autenticacion/olvide-contrasena
POST   /api/autenticacion/reestablecer-contrasena
GET    /api/servicios
POST   /api/servicios
PUT    /api/servicios/:id
DELETE /api/servicios/:id
GET    /api/turnos
POST   /api/turnos
PATCH  /api/turnos/:id/estado
GET    /api/turnos/disponibilidad
GET    /api/horarios
PUT    /api/horarios
GET    /api/empleados
POST   /api/empleados
GET    /api/empleados/:id
PUT    /api/empleados/:id
DELETE /api/empleados/:id
GET    /api/estadisticas/resumen
GET    /api/estadisticas/turnos-por-mes
GET    /api/estadisticas/servicios-populares
GET    /api/estadisticas/ingresos-por-mes
GET    /api/fidelizacion/configuracion
PUT    /api/fidelizacion/configuracion
GET    /api/fidelizacion/mis-visitas
GET    /api/fidelizacion/notificaciones
PUT    /api/fidelizacion/notificaciones
```

---

## Funcionalidades por módulo

### 1. Autenticación y roles
- Registro de clientes (nombre, email, teléfono, contraseña)
- Login para clientes, empleados y admin
- JWT con expiración
- Middleware de verificación de token y rol
- Recuperación de contraseña (olvido/reset con token por email)
- Perfil de usuario (editar nombre/teléfono, cambiar contraseña)

### 2. Gestión de servicios (admin/empleados)
- CRUD de servicios con nombre, descripción, duración (minutos), precio
- Activar/desactivar servicios

### 3. Gestión de horarios (admin)
- Configurar horarios variables por día de la semana
- Múltiples empleados con horarios distintos

### 4. Reserva de turnos (clientes)
- Cliente logueado selecciona servicio → elige fecha → ve horarios disponibles
- Confirma turno (estado: pendiente)
- Validación de disponibilidad según servicio + empleados + horarios

### 5. Gestión de turnos (admin/empleados)
- Vista calendario mensual con todos los turnos
- Confirmar, cancelar o marcar como completado
- Modificar turnos existentes

### 6. Fidelización por visitas
- Cada turno completado suma 1 visita al cliente
- Al alcanzar las visitas requeridas, se habilita un beneficio
- Admin configura cantidad de visitas necesarias

### 7. Recordatorios automáticos
- Notificaciones (email) recordando turno próximo
- Se envían X horas antes del turno
- Soporte nodemailer (SMTP configurable) + simulación por consola

### 8. Gestión de empleados (admin)
- CRUD completo de empleados con nombre, email, teléfono, rol y contraseña
- Activar/desactivar empleados
- Tabla con estados visuales

### 9. Estadísticas y reportes (admin/empleados)
- Resumen del dashboard: turnos hoy, pendientes, servicios/empleados/clientes activos, ingresos 30 días
- Ingresos por mes con barras de progreso
- Servicios más populares con ranking

### 10. Panel de control (todos los roles)
- Saludo personalizado con badge de rol
- Cards de resumen según el rol
- Acciones rápidas contextuales
- Barra de fidelización para clientes
- Lista de turnos de hoy/próximos

### 11. Responsive design
- Nav con scroll horizontal en móvil
- Touch targets ≥ 44px
- Calendario adaptativo con celdas reducidas
- Modales y formularios apilados en vertical
- Prevención de zoom automático en iOS (text-base en inputs)

---

## Scripts del proyecto

```bash
pnpm dev          # Frontend (Vite)
pnpm dev:server   # Backend (Express con tsx watch)
pnpm build        # Build frontend
pnpm lint         # ESLint
```
