// auth.middleware.ts — ¿Quién hace la petición?
//
// Corre ANTES de las rutas protegidas. Lee el header:
//   Authorization: Bearer <token>
// verifica el JWT y deja los datos del usuario en req.user para que los
// controllers sepan quién es (ej: { userId, role }).
//
// Respuestas:
//   - Sin header o sin "Bearer "      → 401 "Token no proporcionado"
//   - Token vencido (TokenExpiredError) → 401 "Sesión expirada"
//   - Token inválido                  → 401 "Token inválido"
//   - OK                              → next()
//
// Uso (en el router de un módulo):
//   router.use(authMiddleware);              // protege todas las rutas del router
//   router.get("/", authMiddleware, handler); // o solo una
//
// TypeScript: req.user no existe en el tipo Request de Express. Hay que
// extenderlo (declaration merging) en un archivo src/types/express.d.ts.
//
// Necesita: npm install jsonwebtoken && npm install -D @types/jsonwebtoken
//           JWT_SECRET en env.ts
