# Expense Tracker

Aplicación web para administrar ingresos, gastos y deudas con una interfaz moderna construida sobre React, Vite y Tailwind.

## Requisitos

- Node.js 18+
- Cuenta de Firebase con Authentication habilitado y método de Google configurado

## Instalación

```bash
npm install
cp .env.example .env
```

Edita `.env` con las credenciales de tu proyecto (todas comienzan con `VITE_` porque Vite solo expone variables que tienen ese prefijo).

## Configuración de Firebase / GCP

1. En [Firebase Console](https://console.firebase.google.com/):
   - Crea un proyecto o selecciona uno existente.
   - Dentro de **Authentication → Sign-in method** habilita **Google** y asigna el correo de soporte.
   - Ve a **Project settings → General** y crea una app web para obtener las claves (`apiKey`, `authDomain`, etc.).
   - En **Authentication → Settings → Authorized domains** agrega los dominios donde usarás la app (por ejemplo `localhost`, tu dominio en producción y el dominio de Vercel si aplica).
   - En **Firestore Database** crea una base de datos (modo production o test) y deja la ubicación que prefieras.
2. En [Google Cloud Console](https://console.cloud.google.com/apis/credentials):
   - Usa el mismo proyecto enlazado con Firebase.
   - Crea una credencial **OAuth client ID (Web application)** si aún no existe.
   - Agrega los orígenes autorizados (p.ej. `http://localhost:5173`) y los redirect URIs con el dominio que da Firebase: `https://<tu-auth-domain>/__/auth/handler`.
   - Asegúrate de que el consentimiento OAuth esté publicado y el correo de soporte coincida con el que configuraste en Firebase Authentication.

Con esos valores rellena las variables del `.env`:

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
```

## Desarrollo

```bash
npm run dev
```

## Sincronización con Firestore

- La app usa IndexedDB (Dexie) para trabajar sin conexión y Firestore como respaldo multi-dispositivo.
- Cuando inicies sesión se verificará si ya hay información en la nube:
  - Si existe, se descargará automáticamente para poblar la base local.
  - Si no existe pero sí hay datos guardados en este navegador, verás un banner con el botón **“Migrar datos a Firebase”**. Haz clic para subir toda la información y habilitar la sincronización automática.
- Después de la migración todos los cambios se sincronizan solos con Firestore. Si necesitas forzarlo, usa los botones del banner (sincronizar ahora / restaurar desde la nube).

Asegúrate de que las [reglas de Firestore](https://firebase.google.com/docs/firestore/security/get-started) requieran autenticación (`request.auth != null`) para proteger los datos de cada usuario.
