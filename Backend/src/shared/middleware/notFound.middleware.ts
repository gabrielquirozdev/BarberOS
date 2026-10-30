// notFound.middleware.ts — Ninguna ruta coincidió
//
// Se registra en app.ts DESPUÉS de todas las rutas. Si la petición llegó
// hasta acá es porque nadie respondió.
//
// Respuesta: 404 { error: "Ruta no encontrada: GET /api/xxx" }
//
// Uso en app.ts:
//   app.use("/api/barbers", barbersRoutes);
//   ...
//   app.use(notFound);       // después de las rutas
//   app.use(errorHandler);   // siempre el último
//
