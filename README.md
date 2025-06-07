# Sistema de Gestión Empresarial

Backend robusto para un sistema de gestión empresarial con autenticación segura, gestión de inventario, pedidos y clientes, desarrollado con Next.js y MongoDB Atlas.

## Características

- 🔐 Autenticación robusta con validación estricta
- 📦 Gestión de inventario en tiempo real
- 🛍️ Sistema de pedidos con control de stock
- 👥 Gestión de clientes
- 📊 Dashboard con métricas en tiempo real
- 🚀 Listo para producción en Vercel

## Requisitos Previos

- Node.js 18 o superior
- MongoDB Atlas (cuenta gratuita)
- pnpm (gestor de paquetes)

## Configuración

1. Clona el repositorio:
```bash
git clone [URL_DEL_REPOSITORIO]
cd [NOMBRE_DEL_PROYECTO]
```

2. Instala las dependencias:
```bash
pnpm install
```

3. Crea un archivo `.env` en la raíz del proyecto:
```env
MONGODB_URI=tu_uri_de_mongodb_atlas
JWT_SECRET=tu_secreto_jwt
```

4. Inicia el servidor de desarrollo:
```bash
pnpm dev
```

## Estructura del Proyecto

```
├── app/
│   ├── api/
│   │   ├── auth/         # Endpoints de autenticación
│   │   ├── inventory/    # Gestión de inventario
│   │   ├── orders/       # Sistema de pedidos
│   │   ├── customers/    # Gestión de clientes
│   │   └── dashboard/    # Métricas en tiempo real
├── models/              # Esquemas y validaciones
├── lib/                # Utilidades y configuración
└── middleware/         # Middleware de autenticación
```

## API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro de usuarios
- `POST /api/auth/login` - Inicio de sesión

### Inventario
- `GET /api/inventory` - Listar productos
- `POST /api/inventory` - Crear producto
- `PUT /api/inventory` - Actualizar producto
- `DELETE /api/inventory` - Eliminar producto

### Pedidos
- `GET /api/orders` - Listar pedidos
- `POST /api/orders` - Crear pedido
- `PUT /api/orders` - Actualizar estado
- `GET /api/orders/user` - Pedidos por usuario

### Clientes
- `GET /api/customers` - Listar clientes
- `POST /api/customers` - Crear cliente
- `PUT /api/customers` - Actualizar cliente
- `DELETE /api/customers` - Eliminar cliente

### Dashboard
- `GET /api/dashboard` - Métricas en tiempo real

## Despliegue

El proyecto está optimizado para ser desplegado en Vercel:

1. Conecta tu repositorio de GitHub con Vercel
2. Configura las variables de entorno en Vercel
3. ¡Listo! Tu aplicación estará en línea

## Seguridad

- Validación estricta de datos con Zod
- Contraseñas encriptadas con bcrypt
- Tokens JWT para autenticación
- Protección de rutas con middleware
- Validación de stock en tiempo real

## Contribución

1. Fork el proyecto
2. Crea tu rama de características (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles. 