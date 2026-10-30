// errorHandler.middleware.ts — Algo lanzó un error
//
// Último middleware de app.ts. Express lo reconoce como error handler porque
// tiene 4 parámetros: (err, req, res, next). Aunque no uses next, NO se quita.
//
// Con Express 5, si un controller async hace throw (o una promesa falla),
// el error llega acá solo: no hace falta try/catch en cada controller
//
// Qué responder según el error:
//   - ZodError                       → 400 con los campos inválidos
//   - Prisma P2025 (registro no existe) → 404
//   - Prisma P2002 (unique duplicado)   → 409 "Ya existe"
//   - Error propio (ej: AppError con status) → su status y mensaje
//   - Cualquier otro                 → 500 "Error interno del servidor"
//
// En development se puede incluir err.message / stack en la respuesta para
// depurar; en production NUNCA (filtra detalles internos). Usar env.NODE_ENV.
