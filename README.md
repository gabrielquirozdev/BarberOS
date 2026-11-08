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
| Base de datos | PostgreSQL | Definido |
| ORM | Prisma 7 con `@prisma/adapter-pg` | Definido |
| Autenticación | JWT | Previsto |
| Frontend | React con Vite | Previsto, sin crear |
| Tests | - | Por definir |

## Requisitos

- Node.js 20.19 o superior
- npm
- PostgreSQL corriendo en tu máquina (cualquier versión actual; se probó con la 18)

## Levantar el backend

La primera vez:

1. Instalar dependencias. Al terminar, `postinstall` corre `prisma generate` y crea el cliente en `src/generated/prisma/`.

   ```bash
   cd Backend
   npm install
   ```

2. Crear la base de datos vacía en tu Postgres local, con pgAdmin o con:

   ```bash
   createdb -U postgres psqlDB
   ```

3. Crear el `.env` y poner tu usuario y contraseña de Postgres en `DATABASE_URL`:

   ```bash
   cp .env.example .env
   ```

4. Crear las tablas aplicando las migraciones del repo:

   ```bash
   npm run db:migrate
   ```

5. Arrancar el servidor:

   ```bash
   npm run dev
   ```

Las siguientes veces alcanza con `npm run dev` dentro de `Backend/`. Después de un `git pull` que traiga migraciones nuevas, corre `npm run db:migrate` antes.

El servidor queda en `http://localhost:3000`. Para comprobar que funciona: `GET http://localhost:3000/api/health`.

### Base de datos (Prisma)

- `prisma/schema.prisma`: los modelos (tablas).
- `prisma/migrations/`: el SQL de cada cambio. Se sube a git.
- `prisma.config.ts`: configuración de la CLI. Lee `DATABASE_URL` del `.env`.
- `src/generated/prisma/`: el cliente generado. **No** se sube a git; se crea con `npm install` o `npm run db:generate`.
- `src/shared/db/connection.ts`: exporta `prisma`, la única instancia del cliente. Los services la importan de ahí.

Para cambiar el modelo de datos:

1. Editar `prisma/schema.prisma`.
2. `npm run db:migrate -- --name descripcion_del_cambio` (crea la migración y la aplica).
3. `npm run db:generate` (actualiza los tipos del cliente).
4. Subir a git el schema y la carpeta nueva en `prisma/migrations/`.

### Problemas comunes

| Síntoma | Causa | Solución |
|---|---|---|
| `Cannot find module '../../generated/prisma/client'` | El cliente no se generó | `npm run db:generate`. Si VS Code sigue marcándolo, `Ctrl+Shift+P` → "TypeScript: Restart TS Server" |
| `P1000: Authentication failed` | Usuario o contraseña incorrectos en `DATABASE_URL` | Revisar `.env` |
| `P1003: Database does not exist` | No se creó la base | Paso 2 |
| `Variables de entorno inválidas` al arrancar | Falta `.env` o `DATABASE_URL` | Paso 3 |

### Variables de entorno

Se definen en `Backend/.env` y se validan al arrancar en `src/config/env.ts`. Si alguna es inválida, el servidor no inicia y muestra cuál falla.

| Variable | Obligatoria | Default | Descripción |
|---|---|---|---|
| `PORT` | No | `3000` | Puerto del servidor |
| `NODE_ENV` | No | `development` | `development`, `production` o `test` |
| `DATABASE_URL` | Sí | - | Conexión a PostgreSQL: `postgresql://USUARIO:PASSWORD@localhost:5432/psqlDB?schema=public` |

### Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Corre el servidor con recarga automática (tsx) |
| `npm run build` | Compila TypeScript a `dist/` |
| `npm start` | Corre la versión compilada |
| `npm run db:migrate` | Aplica las migraciones pendientes y, si cambiaste el schema, crea una nueva |
| `npm run db:generate` | Regenera el cliente de Prisma |
| `npm run db:studio` | Abre Prisma Studio para ver y editar datos en el navegador |

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
    ├── docs/                   Notas técnicas (ej: cómo se configuró Prisma)
    ├── prisma/
    │   ├── schema.prisma       Modelos de la base de datos
    │   └── migrations/         Historial de migraciones (se crea con la primera)
    ├── prisma.config.ts        Configuración de la CLI de Prisma
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
