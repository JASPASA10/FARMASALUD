# FarmaSalud - Sistema de Inventario

Sistema de gestión de inventario para farmacias desarrollado con Next.js y Firebase.

## Características

- Autenticación de usuarios con Firebase
- Gestión de inventario en tiempo real
- Interfaz moderna y responsiva
- Despliegue automático con Vercel

## Requisitos Previos

- Node.js 18 o superior
- Cuenta en Firebase
- Cuenta en Vercel (para despliegue)

## Configuración Local

1. Clona el repositorio:
```bash
git clone <url-del-repositorio>
cd farmasalud
```

2. Instala las dependencias:
```bash
npm install
```

3. Crea un archivo `.env.local` con las siguientes variables:
```
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=tu_measurement_id
```

4. Inicia el servidor de desarrollo:
```bash
npm run dev
```

## Despliegue en Vercel

1. Crea una cuenta en [Vercel](https://vercel.com) si no tienes una.

2. Conecta tu repositorio de GitHub con Vercel.

3. En la configuración del proyecto en Vercel, agrega las siguientes variables de entorno:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`

4. Vercel detectará automáticamente que es un proyecto Next.js y lo desplegará.

## Configuración de Firebase

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com)

2. Habilita Authentication:
   - Ve a Authentication > Sign-in method
   - Habilita Email/Password

3. Configura Firestore:
   - Ve a Firestore Database
   - Crea una base de datos en modo de prueba
   - Configura las reglas de seguridad:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

## Estructura del Proyecto

```
├── app/                # Páginas y rutas de la aplicación
├── components/         # Componentes reutilizables
├── lib/               # Utilidades y configuración
├── public/            # Archivos estáticos
└── styles/            # Estilos globales
```

## Tecnologías Utilizadas

- Next.js 14
- Firebase (Authentication, Firestore)
- Tailwind CSS
- TypeScript

## Licencia

MIT 