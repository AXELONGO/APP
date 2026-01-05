# Documentación Técnica - APP Comercial ERP/CRM

## 1. Descripción General del Proyecto
Esta aplicación es un sistema integral de **ERP/CRM (Enterprise Resource Planning / Customer Relationship Management)** diseñado para la gestión comercial. Permite centralizar el seguimiento de prospectos (leads), clientes, historial de interacciones y gestión de soporte técnico en un panel de control unificado y moderno.

El sistema destaca por su integración con herramientas de productividad externas (Notion) y el uso de Inteligencia Artificial para la generación y enriquecimiento de datos comerciales.

## 2. Objetivo de la Aplicación
El objetivo principal es optimizar el flujo de ventas y atención al cliente de la organización mediante:
- **Centralización de Datos**: Uso de Notion como base de datos compartida y accesible.
- **Automatización de Leads**: Generación de prospectos mediante IA (Google Gemini).
- **Seguimiento Detallado**: Registro cronológico de cada interacción con clientes y leads.
- **Comunicación Masiva**: Interfaz para lanzamientos de campañas via Email y WhatsApp mediante webhooks.
- **Gestión de Soporte**: Visualización y seguimiento de tickets de atención.

## 3. Arquitectura y Estructura de Carpetas
La aplicación utiliza una arquitectura de **Frontend y Backend desacoplados**, facilitando el mantenimiento y la escalabilidad.

### Estructura de Directorios
```text
APP-main/
├── backend/                # API REST (Node.js/Express)
│   ├── prisma/            # ORM y Esquema de Base de Datos Local (SQLite)
│   ├── src/
│   │   ├── controllers/   # Lógica de negocio (Modular - WIP)
│   │   ├── routes/        # Definición de endpoints (Modular - WIP)
│   │   ├── server.js      # Servidor principal (Versión Notion-Activa)
│   │   └── app.js         # Servidor alternativo (Versión Prisma)
│   └── package.json
├── frontend/               # Aplicación Web (React + Vite)
│   ├── src/
│   │   ├── components/    # Componentes modulares de la interfaz
│   │   ├── contexts/      # Gestión de estado global (AppContext)
│   │   ├── services/      # Lógica de consumo de API
│   │   └── App.tsx        # Componente raíz y enrutamiento
│   └── package.json
├── docker-compose.yml      # Orquestación de contenedores
└── DEPLOYMENT.md           # Instrucciones de despliegue
```

## 4. Tecnologías y Librerías Utilizadas

### Frontend
- **React 18**: Librería principal de UI.
- **TypeScript**: Tipado estático para mayor robustez.
- **Vite**: Herramienta de construcción rápida.
- **Tailwind CSS**: Estilizado moderno y responsivo.
- **Lucide React**: Set de iconos optimizado.
- **jsPDF & AutoTable**: Generación de presupuestos y reportes en PDF.
- **Google OAuth**: Autenticación de usuarios.

### Backend
- **Node.js & Express**: Entorno de ejecución y framework web.
- **Prisma ORM**: Para interacción con base de datos local (SQLite).
- **Notion SDK (@notionhq/client)**: Integración principal para almacenamiento de datos.
- **Google Generative AI**: Integración con **Gemini Pro** para generación de contenido.
- **Google Auth Library**: Verificación de tokens de identidad.

### Infraestructura
- **Docker & Docker Compose**: Contenerización para despliegue consistente.
- **SQLite**: Base de datos local ligera (utilizada en la versión Prisma).

## 5. Flujo Principal de la Aplicación
1.  **Autenticación**: El usuario ingresa mediante Google OAuth. El backend valida el correo contra una lista de usuarios permitidos (`allowed_users.json`).
2.  **Dashboard de Ventas**: El usuario visualiza los leads sincronizados desde Notion.
3.  **Generación de Leads con IA**: El usuario puede solicitar a Gemini que genere prospectos basados en una ubicación geográfica.
4.  **Gestión de Clientes**: Transición de Leads a Clientes una vez concretada la venta.
5.  **Interacciones**: Registro de llamadas, correos o notas que se sincronizan en tiempo real con la base de datos de historial en Notion.
6.  **Acciones Especiales**: 
    - Generación de cotizaciones en PDF.
    - Envío de mensajes masivos conectando con webhooks de automatización (n8n).

## 6. Descripción de Módulos y Archivos Críticos

### Backend
- `src/server.js`: Corazón de la API actual. Maneja la lógica de proxy hacia Notion y la integración con Gemini AI.
- `prisma/schema.prisma`: Define la estructura de datos para la futura migración a una base de datos local completa.

### Frontend
- `src/contexts/AppContext.tsx`: Centraliza el estado de la aplicación (leads, clientes, historial) y coordina las llamadas a la API.
- `src/components/NotionDataViewer.tsx`: Componente complejo encargado de renderizar y filtrar datos provenientes de la integración externa.
- `src/components/MassSenderView.tsx`: Módulo de comunicación que dispara acciones externas vía Webhooks.

## 7. Ejecución del Proyecto Locamente

### Requisitos Previos
- Node.js (v18+)
- Docker (Opcional, para despliegue simplificado)

### Método Manual (npm)
1.  **Backend**:
    ```bash
    cd backend
    npm install
    npx prisma generate
    # Configurar archivo .env con las API Keys necesarias
    npm run dev
    ```
2.  **Frontend**:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

### Método Docker (Recomendado)
Desde la raíz del proyecto:
```bash
docker-compose up --build
```

## 8. Posibles Puntos de Mejora y Riesgos Técnicos

### Riesgos
- **Dependencia de Notion**: La latencia y los límites de tasa (rate-limits) de la API de Notion pueden afectar la experiencia de usuario en operaciones masivas.
- **Seguridad**: El sistema de autenticación depende de un archivo local `allowed_users.json`. Se recomienda migrar a una tabla de usuarios en base de datos.
- **Sincronización Híbrida**: Existe código dual (Versión Notion vs Versión Prisma). Esto puede causar confusión en el mantenimiento si no se unifica la fuente de verdad.

### Oportunidades de Mejora
- **Caché Local**: Implementar el uso de Prisma/SQLite como caché persistente para acelerar la carga de datos de Notion.
- **Pruebas Automatizadas**: Actualmente la cobertura de tests es mínima. Es vital añadir tests de integración para los flujos de sincronización.
- **Refactorización de server.js**: El archivo `server.js` ha crecido significativamente (monolito). Se recomienda mover la lógica a los controladores y rutas ya definidos.
- **Manejo de Estados**: Implementar una librería de gestión de estado como React Query para manejar la sincronización y el caché de datos de forma más eficiente.
