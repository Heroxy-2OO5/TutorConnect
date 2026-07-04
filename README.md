# TutorConnect

TutorConnect es una aplicación web full stack desarrollada para facilitar la gestión de tutorías académicas entre estudiantes y tutores.

La plataforma permite administrar usuarios, materias, tutorías, sesiones, inscripciones, asistencias y observaciones académicas desde una interfaz web organizada y fácil de utilizar.

## Funcionalidades principales

- Registro e inicio de sesión de usuarios.
- Autenticación y protección de rutas.
- Gestión de materias.
- Inscripción de estudiantes en materias.
- Creación y administración de tutorías.
- Programación de sesiones académicas.
- Registro de asistencias.
- Registro de observaciones académicas.
- Panel principal con información resumida.
- Formularios con validaciones personalizadas.
- Diferentes opciones según el rol del usuario.
- Notificaciones visuales para confirmar acciones o mostrar errores.
- Importar asistencias en PDF o EXCEL
- Importar observaciones académicas en PDF o EXCEL

## Tecnologías utilizadas

### Frontend

- Angular
- TypeScript
- HTML5
- CSS3
- Angular Router
- Formularios y validaciones de Angular
- Servicios HTTP
- Guards para proteger rutas
- Pipes personalizados

### Backend

- Node.js
- Express.js
- JavaScript
- Variables de entorno con dotenv
- API REST
- Middleware de autenticación
- Arquitectura por capas

### Base de datos

- PostgreSQL -> PgAdmin 4

## Arquitectura del proyecto

El proyecto está dividido en dos aplicaciones:

```text
TutorConnect/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── app.js
│   ├── index.js
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── app/
│   │   ├── environments/
│   │   ├── index.html
│   │   ├── main.ts
│   │   └── styles.css
│   ├── angular.json
│   └── package.json
│
├── .gitignore
├── LICENSE
└── README.md
```

## Módulos del sistema

TutorConnect incluye los siguientes módulos:

- Autenticación.
- Dashboard.
- Materias.
- Inscripciones.
- Tutorías.
- Sesiones.
- Asistencias.
- Observaciones académicas.
- Gestión de usuarios.

## Requisitos previos

Antes de ejecutar el proyecto debes tener instalado:

- Node.js
- npm
- Angular CLI
- PgAdmin 4
- Git

Puedes verificar las instalaciones con los siguientes comandos:

```bash
node --version
npm --version
ng version
git --version
```

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/Heroxy-2005/TutorConnect.git
```

Ingresa a la carpeta del proyecto:

```bash
cd TutorConnect
```

### 2. Instalar el backend

Ingresa a la carpeta del backend:

```bash
cd backend
```

Instala las dependencias:

```bash
npm install
```

Crea un archivo `.env` tomando como referencia el archivo `.env.example`.

Ejemplo:

```env
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_NAME=tutorconnect
DB_USER=root
DB_PASSWORD=

JWT_SECRET=coloca_aqui_una_clave_segura
```

Los nombres de las variables pueden cambiar dependiendo de la configuración utilizada en el proyecto.

Inicia el backend:

```bash
npm start
```

Si el proyecto utiliza un script de desarrollo con nodemon:

```bash
npm run dev
```

El servidor estará disponible normalmente en:

```text
http://localhost:3000
```

### 3. Instalar el frontend

Abre otra terminal y entra en la carpeta del frontend:

```bash
cd frontend
```

Instala las dependencias:

```bash
npm install
```

Verifica la dirección del backend en:

```text
frontend/src/environments/environment.ts
```

Ejemplo:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
```

Inicia la aplicación Angular:

```bash
npm start
```

También puedes ejecutarla con:

```bash
ng serve
```

Abre el navegador en:

```text
http://localhost:4200
```

## Variables de entorno

Las credenciales privadas no se encuentran incluidas en el repositorio.

Debes crear el archivo:

```text
backend/.env
```

Utiliza como referencia:

```text
backend/.env.example
```

Nunca debes publicar en GitHub:

- Contraseñas.
- Tokens.
- Claves JWT.
- Credenciales de la base de datos.
- Claves privadas.
- Archivos `.env`.

## Endpoints principales

La API contiene rutas relacionadas con:

```text
/api/auth
/api/dashboard
/api/materias
/api/inscripciones
/api/tutorias
/api/sesiones
/api/asistencias
/api/observaciones
```

Las rutas exactas pueden variar según la configuración del backend.

## Estado del proyecto

El proyecto se encuentra funcional y puede continuar mejorándose con nuevas características.

Algunas mejoras futuras podrían ser:

- Recuperación de contraseña.
- Confirmación de cuenta mediante correo electrónico.
- Notificaciones en tiempo real.
- Reportes académicos descargables.
- Calendario de tutorías.
- Despliegue del frontend y backend.
- Pruebas unitarias y de integración.
- Documentación de la API con Swagger.
- Faltan algunas validaciones dentro del programa (Se aconseja inciar y probar el programa antes de mover el codigo).

## Aprendizajes obtenidos

Durante el desarrollo de TutorConnect se aplicaron conocimientos relacionados con:

- Desarrollo de aplicaciones web full stack.
- Creación y consumo de API REST.
- Separación del proyecto por capas.
- Comunicación entre Angular y Node.js.
- Manejo de rutas protegidas.
- Implementación de servicios.
- Validación de formularios.
- Gestión de variables de entorno.
- Organización de controladores, modelos, rutas y servicios.
- Uso de Git y GitHub para el control de versiones.

## Autores

**Edison Alexander Cárdenas Chalaco**

- GitHub: [@Heroxy-2005](https://github.com/Heroxy-2OO5)
- LinkedIn: [Edison Cárdenas](https://www.linkedin.com/in/edison-alexander-c%C3%A1rdenas-chalaco/)

**Luis Enrique Urdiales Novillo**

- GitHub: [@luisurdiales019-wq](https://github.com/luisurdiales019-wq)
- LinkedIn: [Luis Urdiales](https://www.linkedin.com/in/luis-urdiales-3408013a9?trk=contact-info)

## Licencia

Este proyecto está distribuido bajo la Licencia MIT. Consulta el archivo [LICENSE](LICENSE) para obtener más información.
