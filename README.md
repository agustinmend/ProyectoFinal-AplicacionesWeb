# PolerasBO - Plataforma E-commerce y Personalización B2C

PolerasBO es un sistema de comercio electrónico monolítico modular diseñado para la exploración, personalización básica y cotización de prendas de vestir, derivando la transacción final hacia WhatsApp.

La arquitectura implementa un enfoque de **Headless CMS asimétrico**, donde Django gestiona el inventario de forma administrativa y FastAPI expone los servicios públicos y transaccionales consumidos por una Single Page Application (SPA) en React.

## 🛠️ Stack Tecnológico

* **Frontend:** React, Vite, TypeScript.
* **Backend API:** FastAPI (Python 3.12), SQLAlchemy (ORM), Pydantic.
* **Headless CMS:** Django 5.0 (Modelos configurados con `managed = False`).
* **Base de Datos:** PostgreSQL (dividido en esquemas lógicos: `auth`, `catalog`, `negocio`, `ugc`).
* **Infraestructura Backend:** Docker y Docker Compose.

## 📂 Estructura del Proyecto

```text
├── backend/
│   ├── admin/                  # Panel de administración e inventario (Django)
│   └── app/                    # API núcleo transaccional y servicios públicos (FastAPI)
├── frontend/
│   └── poleras-web/            # Single Page Application (React)
├── docker-compose.yml          # Orquestador de servicios backend
└── .env.example                # Plantilla de variables de entorno
```

## 🚀 Instalación y Despliegue Local

### Requisitos Previos

* Docker instalado.
* Docker Compose instalado.
* Node.js 20+ instalado.

### Paso 1: Configurar Variables de Entorno

Copia la plantilla de entorno:

```bash
cp .env.example .env
cp /frontend/poleras-web/src/.env.example /frontend/poleras-web/src/.env
```


Configura las credenciales de PostgreSQL y las variables necesarias para Google OAuth2.

### Paso 2: Iniciar los Servicios Backend

Desde la raíz del proyecto:

```bash
docker compose up --build -d
```

Este comando iniciará:

* PostgreSQL
* FastAPI
* Django Admin

### Paso 3: Iniciar el Frontend

El frontend no forma parte de la infraestructura Docker y debe ejecutarse manualmente.

```bash
cd frontend/poleras-web
npm install
npm run dev
```

Por defecto Vite expondrá la aplicación en:

```text
http://localhost:5173
```

## 🌐 Accesos a los Servicios Locales

| Servicio              | URL                         |
| --------------------- | --------------------------- |
| Frontend React (Vite) | http://localhost:5173       |
| API FastAPI           | http://localhost:8001       |
| Swagger UI            | http://localhost:8001/docs  |
| Django Admin          | http://localhost:8000/admin |

## 🏗️ Arquitectura General

La solución se compone de tres bloques principales:

### Frontend React

* Interfaz de usuario para clientes.
* Ejecutado localmente mediante Vite.
* Consume exclusivamente la API pública de FastAPI.

### FastAPI

* Gestiona autenticación, catálogo y lógica de negocio.
* Expone los servicios consumidos por el frontend.
* Utiliza SQLAlchemy como ORM sobre PostgreSQL.

### Django Admin

* Proporciona el backoffice administrativo.
* Gestiona productos e inventario.
* Comparte la misma base de datos que FastAPI mediante modelos configurados con `managed = False`.

### PostgreSQL

* Almacena la información del sistema.
* Organizada mediante esquemas lógicos para separar dominios funcionales.

Los servicios backend se ejecutan en contenedores Docker, mientras que el frontend React se ejecuta localmente mediante Vite durante el desarrollo.
