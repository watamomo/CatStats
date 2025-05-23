# 🗂️ CatStats — Plataforma de Organización de Tareas y Equipos

CatStats es una aplicación web moderna para la organización personal y colaborativa de tareas. Diseñada para fomentar la productividad individual y en equipo, cuenta con una interfaz intuitiva, soporte para grupos, tareas compartidas, estadísticas, chat grupal y un sistema de comentarios

## 🚀 Características Principales

- ✅ Gestión de tareas con título, descripción, fecha límite, barra de progreso y comentarios
- 👥 Equipos: crea grupos, invita miembros, organiza el trabajo colaborativo
- 💬 Chat grupal por cada equipo para facilitar la comunicación
- 📊 Dashboard con estadísticas de productividad y tareas activas
- 🔍 Buscador de tareas en tiempo real
- 🔔 Sistema de notificaciones en el header
- 🌙 Interfaz responsive en modo oscuro con diseño moderno (Tailwind + Framer Motion)

## 🧑‍💻 Tecnologías Utilizadas

### Frontend
- **React** con **TypeScript**
- **Tailwind CSS** + **Framer Motion**
- **React Router** para navegación

### Backend
- **Node.js** con **Express**
- **Base de datos relacional con PostgreSQL**

## 🏗️ Estructura de Funcionalidades

- **Login y Registro:** con efecto parallax 3D en el fondo
- **Sidebar:** lista de grupos, creación de nuevos equipos, y acceso colapsable
- **Dashboard:** resumen de tareas, gráficas y acceso rápido a tareas activas
- **Gestión de tareas:** crear, editar, asignar, filtrar por estado, añadir notas y comentarios
- **Chat grupal:** comunicación por equipo en tiempo real
- **Perfil de usuario:** ver y editar nombre, ver grupos asignados
- **Configuración:** ajustes generales de la aplicación

## 📦 Instalación y Ejecución

### Requisitos
- Node.js
- Docker
- Editor de código (VS Code recomendado)

### Clonar el repositorio

```bash
git clone https://github.com/watamomo/CatStats.git
  ```

### Iniciar el backend

```bash
cd taskflow/backend
npm install
docker compose up -d
```

### Iniciar el frontend

```bash
cd taskflow/frontend
npm install
npm run dev
```
