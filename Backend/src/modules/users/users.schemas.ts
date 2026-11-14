import { z } from "zod";

const nombre = z.string().trim().min(1).max(100).regex(/^[^\u0000]*$/u);
const correo = z.string().trim().toLowerCase().max(255).pipe(z.email());
const telefono = z.string().trim().min(1).max(30).regex(/^[^\u0000]*$/u).nullable();

export const esquemaIdUsuario = z.strictObject({ id: z.uuid() });

export const esquemaCrearUsuario = z.strictObject({
  name: nombre,
  surname: nombre,
  email: correo,
  password: z.string().min(12).max(128).refine(
    (contrasena) => contrasena.trim().length > 0,
    { error: "La contraseña no puede contener únicamente espacios." },
  ),
  roleId: z.uuid(),
  phone: telefono.optional(),
});

export const esquemaActualizarUsuario = z.strictObject({
  name: nombre.optional(),
  surname: nombre.optional(),
  email: correo.optional(),
  phone: telefono.optional(),
}).refine(
  (datos) => Object.values(datos).some((valor) => valor !== undefined),
  { error: "Debés enviar al menos un campo permitido para actualizar." },
);

const enteroDeConsulta = z.string().regex(
  /^[1-9]\d*$/u,
  { error: "Debe ser un número entero positivo." },
).transform(Number).pipe(z.int().positive());

export const esquemaPaginacion = z.strictObject({
  pagina: enteroDeConsulta.pipe(z.number().max(1_000_000)).default(1),
  limite: enteroDeConsulta.pipe(z.number().max(100)).default(20),
});

export const opcionesValidacion = { error: z.locales.es().localeError };

export type DatosCrearUsuario = z.infer<typeof esquemaCrearUsuario>;
export type DatosActualizarUsuario = z.infer<typeof esquemaActualizarUsuario>;
export type PaginacionUsuarios = z.infer<typeof esquemaPaginacion>;
