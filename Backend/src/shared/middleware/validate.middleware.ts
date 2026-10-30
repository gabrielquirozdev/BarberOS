// validate.middleware.ts — ¿Los datos que mandaron son válidos?
//
// Recibe un schema de Zod y valida req.body (o req.params / req.query) ANTES
// de llegar al controller. Así el controller recibe datos ya limpios y tipados.
//
// Respuestas:
//   - Datos inválidos → 400 con el detalle de qué campo falló
//   - OK              → next()
//
// Uso:
//   const createAppointmentSchema = z.object({
//     barberId: z.number(),
//     date: z.iso.datetime(),
//   });
//   router.post("/", validate(createAppointmentSchema), createAppointment);
//
// Los schemas de cada módulo viven en el módulo (ej: barbers.schema.ts);
// este archivo es solo el middleware genérico que los aplica.
