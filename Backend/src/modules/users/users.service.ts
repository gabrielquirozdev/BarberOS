import { argon2id, hash } from "argon2";
import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../../shared/db/connection";
import type {
  DatosActualizarUsuario,
  DatosCrearUsuario,
  PaginacionUsuarios,
} from "./users.schemas";

type CodigoErrorUsuarios = "USUARIO_NO_ENCONTRADO" | "EMAIL_DUPLICADO" | "ROL_INEXISTENTE";

export class ErrorUsuarios extends Error {
  constructor(public readonly codigo: CodigoErrorUsuarios, mensaje: string) {
    super(mensaje);
    this.name = "ErrorUsuarios";
  }
}

// Selección positiva: las credenciales nunca salen de la capa de datos.
const camposPublicosUsuario = {
  id: true,
  name: true,
  surname: true,
  email: true,
  phone: true,
  enabled: true,
  roleId: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

function traducirErrorPrisma(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        throw new ErrorUsuarios("EMAIL_DUPLICADO", "Ya existe un usuario con ese correo electrónico.");
      case "P2025":
        throw new ErrorUsuarios("USUARIO_NO_ENCONTRADO", "Usuario inexistente o desactivado.");
      case "P2003":
        throw new ErrorUsuarios("ROL_INEXISTENTE", "El rol indicado no existe.");
    }
  }
  throw error;
}

export async function listarUsuarios({ pagina, limite }: PaginacionUsuarios) {
  const [usuarios, total] = await prisma.$transaction([
    prisma.user.findMany({
      where: { enabled: true },
      select: camposPublicosUsuario,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: (pagina - 1) * limite,
      take: limite,
    }),
    prisma.user.count({ where: { enabled: true } }),
  ], { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead });

  return {
    datos: usuarios,
    paginacion: { pagina, limite, total, totalPaginas: Math.ceil(total / limite) },
  };
}

export async function obtenerUsuario(id: string) {
  const usuarioEncontrado = await prisma.user.findFirst({
    where: { id, enabled: true },
    select: camposPublicosUsuario,
  });

  if (!usuarioEncontrado) {
    throw new ErrorUsuarios("USUARIO_NO_ENCONTRADO", "Usuario inexistente o desactivado.");
  }
  return usuarioEncontrado;
}

export async function crearUsuario(datos: DatosCrearUsuario) {
  const rolExistente = await prisma.role.findUnique({
    where: { id: datos.roleId },
    select: { id: true },
  });

  if (!rolExistente) {
    throw new ErrorUsuarios("ROL_INEXISTENTE", "El rol indicado no existe.");
  }

  const hashContrasena = await hash(datos.password, {
    type: argon2id,
    memoryCost: 19_456,
    timeCost: 2,
    parallelism: 1,
  });

  try {
    return await prisma.user.create({
      data: {
        name: datos.name,
        surname: datos.surname,
        email: datos.email,
        passwordHash: hashContrasena,
        roleId: datos.roleId,
        phone: datos.phone ?? null,
      },
      select: camposPublicosUsuario,
    });
  } catch (error) {
    traducirErrorPrisma(error);
  }
}

export async function actualizarUsuario(id: string, datos: DatosActualizarUsuario) {
  const cambios: Prisma.UserUpdateInput = {};
  if (datos.name !== undefined) cambios.name = datos.name;
  if (datos.surname !== undefined) cambios.surname = datos.surname;
  if (datos.email !== undefined) cambios.email = datos.email;
  if (datos.phone !== undefined) cambios.phone = datos.phone;

  try {
    return await prisma.user.update({
      where: { id, enabled: true },
      data: cambios,
      select: camposPublicosUsuario,
    });
  } catch (error) {
    traducirErrorPrisma(error);
  }
}

export async function desactivarUsuario(id: string) {
  try {
    await prisma.user.update({
      where: { id, enabled: true },
      data: { enabled: false },
      select: { id: true },
    });
  } catch (error) {
    traducirErrorPrisma(error);
  }
}
