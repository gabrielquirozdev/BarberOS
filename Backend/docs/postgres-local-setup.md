# Cómo instalar PostgreSQL y crear la base local

Esta guía es para dejar tu PC lista antes de levantar el backend. Al terminar vas a tener:

- PostgreSQL corriendo en tu máquina.
- Una base vacía llamada `psqlDB`.
- El archivo `Backend/.env` con la `DATABASE_URL` que apunta a esa base.

Después de esto sigue con el paso 4 del [README](../../README.md#levantar-el-backend) (`npm run db:migrate`).

> Cada persona tiene **su propia base local**. No compartimos base ni contraseñas: el `.env` no se sube a git.

## 1. Descargar e instalar PostgreSQL

### Windows

1. Entra a <https://www.postgresql.org/download/windows/> y haz clic en **Download the installer** (te lleva a la página de EDB).
2. Descarga la última versión para **Windows x86-64**. El proyecto se probó con la **18**; cualquier versión actual sirve.
3. Ejecuta el instalador y deja los valores por defecto, salvo lo siguiente:

| Pantalla | Qué poner | Por qué |
|---|---|---|
| **Select Components** | Deja marcados **PostgreSQL Server**, **pgAdmin 4** y **Command Line Tools**. **Stack Builder** se puede desmarcar | pgAdmin es la interfaz gráfica que usamos en esta guía |
| **Password** | Una contraseña para el usuario `postgres` | **Anótala.** Es la que va en el `.env` y no se puede recuperar después (solo resetear) |
| **Port** | `5432` | Es el puerto que asume `.env.example`. Si el instalador propone otro (por ejemplo `5433`), es porque ya hay un Postgres instalado: anota ese número |
| **Locale** | `[Default locale]` | No afecta al proyecto |

4. Al final, si pregunta por **Stack Builder**, desmarca la opción y cierra.

El instalador deja Postgres como **servicio de Windows** (`postgresql-x64-18`) que arranca solo con la PC. No hace falta abrir nada para que funcione.

### macOS / Linux

- **macOS**: instala [Postgres.app](https://postgresapp.com/) y [pgAdmin](https://www.pgadmin.org/download/pgadmin-4-macos/) por separado. Postgres.app crea un usuario con tu nombre de usuario del sistema y sin contraseña; úsalo en el `.env` o crea el usuario `postgres` con contraseña.
- **Linux (Debian/Ubuntu)**: `sudo apt install postgresql` y pgAdmin desde <https://www.pgadmin.org/download/>. Para ponerle contraseña al usuario `postgres`: `sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'tu_password';"`.

El resto de la guía es igual.

## 2. Conectarse al servidor desde pgAdmin

1. Abre **pgAdmin 4** desde el menú Inicio. La primera vez puede pedirte una *master password*: es solo para que pgAdmin guarde tus contraseñas, no es la de Postgres. Pon la que quieras.
2. En el panel izquierdo, despliega **Servers** → **PostgreSQL 18**.
3. Te pide la contraseña del usuario `postgres`: es la que pusiste en el instalador. Puedes marcar **Save password**.

Si conecta, vas a ver adentro **Databases**, **Login/Group Roles** y **Tablespaces**.

## 3. Crear la base de datos

1. Clic derecho en **Databases** → **Create** → **Database...**
2. En la pestaña **General**:
   - **Database**: `psqlDB` (respetando mayúsculas)
   - **Owner**: `postgres`
3. **Save**.

No hay que crear tablas a mano. Las crea Prisma con las migraciones del repo (`npm run db:migrate`).

> **El nombre importa.** Si le pones otro nombre a la base, tienes que usar ese mismo nombre en la `DATABASE_URL`. Para evitar confusiones, usa `psqlDB`.

> **Ojo con las mayúsculas.** En Postgres, `psqlDB`, `psqldb` y `PSQLDB` son tres bases distintas. pgAdmin y `createdb` guardan el nombre tal cual lo escribes, y la `DATABASE_URL` tiene que coincidir exactamente. Si alguna vez la creas con SQL, el nombre va entre comillas dobles: `CREATE DATABASE "psqlDB";`. Sin comillas, Postgres lo pasa a minúsculas y crea `psqldb`.

### Alternativa por consola

Si agregaste `C:\Program Files\PostgreSQL\18\bin` al `PATH`, el paso anterior equivale a:

```bash
createdb -U postgres psqlDB
```

## 4. Cargar las credenciales en el `.env`

1. Dentro de `Backend/`, copia la plantilla:

   ```bash
   cp .env.example .env
   ```

   En PowerShell: `Copy-Item .env.example .env`.

2. Abre `Backend/.env` y reemplaza `TU_PASSWORD` por la contraseña del usuario `postgres`:

   ```env
   PORT=3000
   NODE_ENV=development
   DATABASE_URL="postgresql://postgres:TU_PASSWORD@localhost:5432/psqlDB?schema=public"
   ```

### Qué es cada parte de la URL

```
postgresql://postgres:TU_PASSWORD@localhost:5432/psqlDB?schema=public
             └──┬───┘ └────┬────┘ └───┬───┘ └┬─┘ └─┬──┘ └─────┬─────┘
             usuario   contraseña    host  puerto base     schema
```

| Parte | Valor normal | Cuándo cambiarlo |
|---|---|---|
| usuario | `postgres` | Si usas otro usuario (ver [Usar un usuario propio](#opcional-usar-un-usuario-propio-en-vez-de-postgres)) |
| contraseña | La del instalador | Siempre |
| host | `localhost` | Nunca, en local |
| puerto | `5432` | Si el instalador eligió otro |
| base | `psqlDB` | Si creaste la base con otro nombre |
| schema | `public` | Nunca |

### Contraseñas con caracteres especiales

La contraseña va dentro de una URL, así que algunos caracteres rompen el parseo y dan errores confusos (`P1000`, `P1013` o `Variables de entorno inválidas`). Si tu contraseña tiene alguno de estos, reemplázalo por su código:

| Carácter | Se escribe |
|---|---|
| `@` | `%40` |
| `:` | `%3A` |
| `/` | `%2F` |
| `#` | `%23` |
| `?` | `%3F` |
| `%` | `%25` |
| espacio | `%20` |

Ejemplo: la contraseña `barber@2026#` queda `barber%402026%23`.

La forma más simple de evitarlo es usar una contraseña local solo con letras y números.

### Quién lee este archivo

- `src/config/env.ts` lo valida al arrancar el servidor. Si `DATABASE_URL` falta o no es una URL válida, el servidor no inicia y muestra `Variables de entorno inválidas`.
- `prisma.config.ts` lo lee cuando corres comandos de Prisma (`db:migrate`, `db:studio`, etc.).
- `src/shared/db/connection.ts` usa la URL para conectar el cliente de Prisma.

Por eso el `.env` tiene que estar en **`Backend/.env`**, no en la raíz del repo.

## 5. Comprobar que todo funciona

Desde `Backend/`:

```bash
npm install          # si todavía no lo hiciste
npm run db:migrate   # crea las tablas
npm run dev
```

Luego abre <http://localhost:3000/api/health>. Tienes que ver:

```json
{ "status": "OK", "db": "connected" }
```

Si ves `"db": "disconnected"` (HTTP 503), el servidor arrancó pero no llega a la base: revisa la tabla de abajo.

También puedes comprobarlo en pgAdmin: clic derecho en `psqlDB` → **Refresh**, y en **Schemas** → **public** → **Tables** aparecen las tablas creadas por las migraciones (más `_prisma_migrations`, que Prisma usa para llevar el registro).

## Opcional: usar un usuario propio en vez de `postgres`

Para desarrollo local alcanza con `postgres`. Si prefieres no usar el superusuario:

1. En pgAdmin: clic derecho en **Login/Group Roles** → **Create** → **Login/Group Role...**
2. **General** → **Name**: `psqlUser`.
3. **Definition** → **Password**: la que quieras.
4. **Privileges**: activa **Can login?** y **Create databases?**.
5. **Save**, y en la base `psqlDB` → **Properties** → **Owner**: `psqlUser`.

**Create databases?** es necesario: `prisma migrate dev` crea una base temporal (*shadow database*) para validar las migraciones y la borra al terminar. Sin ese permiso falla con `P3014`.

La URL queda:

```env
DATABASE_URL="postgresql://psqlUser:TU_PASSWORD@localhost:5432/psqlDB?schema=public"
```

## Problemas comunes

| Síntoma | Causa | Solución |
|---|---|---|
| `P1000: Authentication failed` | Usuario o contraseña incorrectos | Revisa el `.env`. Si la contraseña tiene caracteres especiales, codifícalos ([ver arriba](#contraseñas-con-caracteres-especiales)) |
| `P1001: Can't reach database server at localhost:5432` | Postgres no está corriendo o el puerto es otro | Abre `services.msc`, busca `postgresql-x64-18` y dale **Iniciar**. Si sigue, revisa el puerto en pgAdmin: clic derecho en el servidor → **Properties** → **Connection** |
| `P1003: Database psqlDB does not exist` | No se creó la base, tiene otro nombre o las mayúsculas no coinciden (`psqldb` ≠ `psqlDB`) | Paso 3, o corrige el nombre en la URL |
| `P3014: Prisma Migrate could not create the shadow database` | El usuario no tiene permiso para crear bases | Activa **Create databases?** en el usuario, o usa `postgres` |
| `Variables de entorno inválidas` al arrancar | Falta `Backend/.env`, falta `DATABASE_URL` o la URL está mal formada | Paso 4. Revisa que el archivo esté en `Backend/` y no en la raíz |
| Olvidaste la contraseña de `postgres` | - | Si pgAdmin la tiene guardada: clic derecho en **Login/Group Roles** → `postgres` → **Properties** → **Definition** y pon una nueva. Si no, lo más rápido en local es desinstalar y reinstalar Postgres |
| El instalador puso el puerto `5433` | Ya había otro Postgres instalado | Usa `5433` en la URL, o desinstala la versión vieja |
