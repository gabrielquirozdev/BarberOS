# Cómo se configuró Prisma

> **⚠️ No ejecutes estos comandos.** Este documento explica cómo se agregó Prisma al proyecto. Eso se hizo **una sola vez** y los archivos resultantes ya están en el repo. Para levantar el proyecto en tu PC, sigue el [README](../../README.md#levantar-el-backend).

## Qué es cada cosa

- **PostgreSQL** es la base de datos. Cada persona usa la suya, local.
- **Prisma ORM** es la librería que usamos para hablar con la base desde TypeScript.
- **Prisma Postgres** es un servicio de hosting en la nube de la empresa Prisma. **No lo usamos**. Si la documentación de Prisma menciona `--db`, `create-db` o URLs `prisma+postgres://`, todo eso es de ese servicio y se puede ignorar.

## Pasos que se hicieron

### 1. Instalar las librerías

```bash
npm i -D prisma@7 @types/pg
npm i @prisma/client@7 @prisma/adapter-pg pg
```

- `prisma` es la CLI (migraciones y generación del cliente). Solo se usa en desarrollo.
- `@prisma/client` es el runtime del cliente.
- `@prisma/adapter-pg` y `pg` son el driver con el que el cliente se conecta a Postgres. Desde Prisma 7 son obligatorios.

`prisma` y `@prisma/client` **tienen que estar en la misma versión**.

### 2. Generar la estructura base

```bash
npx prisma init --datasource-provider postgresql --output ../src/generated/prisma
```

Este comando creó tres archivos:

| Archivo | Para qué sirve | ¿Va a git? |
|---|---|---|
| `prisma/schema.prisma` | Define los modelos (tablas) | Sí |
| `prisma.config.ts` | Le dice a la CLI dónde está el schema, las migraciones y la URL de la base | Sí |
| `.env` | Guarda `DATABASE_URL` | **No** |

### 3. Ajustes a mano

- **`schema.prisma`**: se agregó `moduleFormat = "cjs"` en el `generator`, porque el proyecto es CommonJS.
- **`src/shared/db/connection.ts`**: crea y exporta `prisma`, la única instancia del cliente. Los services la importan desde ahí.
- **`src/config/env.ts`**: valida que exista `DATABASE_URL` al arrancar.
- **`.env.example`**: plantilla del `.env` sin contraseñas reales.
- **`.gitignore`**: se agregó `src/generated/prisma`.
- **`package.json`**: se agregaron estos scripts:

| Script | Qué hace |
|---|---|
| `postinstall` → `prisma generate` | Corre solo después de cada `npm install` y genera el cliente |
| `db:migrate` → `prisma migrate dev` | Crea y aplica migraciones |
| `db:generate` → `prisma generate` | Regenera el cliente a mano |
| `db:studio` → `prisma studio` | Abre una interfaz web para ver los datos |

## Cómo encaja todo

```
schema.prisma ──(migrate)──> prisma/migrations/*.sql ──> tablas en tu Postgres
      │
      └──(generate)──> src/generated/prisma ──> connection.ts ──> services
```

- **`schema.prisma`** es la fuente de verdad: describe cómo debe ser la base.
- **`prisma/migrations/`** es el historial de cambios en SQL. Va a git para que todas las bases locales queden iguales.
- **`src/generated/prisma/`** es código TypeScript con tipos derivados del schema. No va a git porque se puede regenerar en cualquier momento.

## Errores que tuvimos al configurarlo

- **Versiones mezcladas** (`prisma` 8 rc con `@prisma/client` 7): rompían la CLI. Se alinearon en la 7.
- **`init` creó `prisma7.config.ts`** porque ya existía un `prisma.config.ts` vacío. La CLI solo lee `prisma.config.ts`, así que se renombró.
- **El import de `PrismaClient` fallaba** porque el cliente no estaba generado. Desde Prisma 7 el cliente no viene dentro del paquete: se genera en `src/generated/prisma/`. Por eso existe el `postinstall`.
