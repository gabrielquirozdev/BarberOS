// requireRole.middleware.ts — ¿Tiene permiso para esto?
//
// Va DESPUÉS de authMiddleware (usa req.user.role). Es una
// función que recibe los roles permitidos y devuelve el middleware.
//
// Roles tentativos para BarberOS: "admin" (dueño), "barber", "client".
//
// Respuestas:
//   - Sin req.user            → 401 "No autenticado"
//   - Rol no está en la lista → 403 "Sin permisos"
//   - OK                      → next()
//
// Uso:
//   router.delete("/:id", authMiddleware, requireRole("admin"), handler);
//   router.get("/agenda", authMiddleware, requireRole(["admin", "barber"]), handler);
//
