# BarberOS

Sistema de reserva de turnos para barberías.

El proyecto está en etapa inicial: hoy existe la base del backend. El frontend todavía no está creado.

## Stack

| Parte | Tecnología | Estado |
|---|---|---|
| Runtime | Node.js 20.19 o superior | Definido |
| Lenguaje | TypeScript | Definido |
| Servidor HTTP | Express 5 | Definido |
| Validación | Zod 4 | Definido |
| Base de datos | PostgreSQL o MongoDB | Por definir |
| ORM | Prisma (PostgreSQL) o Mongoose (MongoDB) | Por definir |
| Autenticación | JWT | Previsto |
| Frontend | React con Vite | Previsto, sin crear |
| Tests | - | Por definir |

## Requisitos

- Node.js 20.19 o superior
- npm

## Levantar el backend

La primera vez:

```bash
cd Backend
npm install
cp .env.example .env
npm run dev
```

Las siguientes veces alcanza con `npm run dev` dentro de `Backend/`.

El servidor queda en `http://localhost:3000`. Para comprobar que funciona: `GET http://localhost:3000/api/health`.

### Variables de entorno

Se definen en `Backend/.env` y se validan al arrancar en `src/config/env.ts`. Si alguna es inválida, el servidor no inicia y muestra cuál falla.

| Variable | Obligatoria | Default | Descripción |
|---|---|---|---|
| `PORT` | No | `3000` | Puerto del servidor |
| `NODE_ENV` | No | `development` | `development`, `production` o `test` |

### Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Corre el servidor con recarga automática (tsx) |
| `npm run build` | Compila TypeScript a `dist/` |
| `npm start` | Corre la versión compilada |

## Estructura

```
BarberOS/
└── Backend/
    ├── src/
    │   ├── server.ts           Arranque: pone la app a escuchar en el puerto
    │   ├── app.ts              Configuración de Express: middlewares y rutas
    │   ├── config/
    │   │   └── env.ts          Lectura y validación de variables de entorno
    │   ├── modules/            Un directorio por funcionalidad (users, turnos, clientes...)
    │   │   └── users/          Módulo de ejemplo
    │   └── shared/             Código usado por más de un módulo
    │       ├── db/             Conexión a la base de datos
    │       ├── middleware/     Auth, roles, validación, 404 y manejo de errores
    │       └── utils/          Funciones auxiliares
    ├── .env.example
    ├── package.json
    └── tsconfig.json
```

Cada módulo agrupa su propia capa HTTP y su lógica:

```
modules/users/
├── users.routes.ts       Define los endpoints de /api/users
├── users.controller.ts   Lee la request, llama al service y arma la response
└── users.service.ts      Lógica de negocio y acceso a datos
```

Si algo lo usa un solo módulo, va dentro de ese módulo. Si lo usan varios, va en `shared/`.
