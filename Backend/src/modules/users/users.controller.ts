import type { ErrorRequestHandler, Request, Response } from "express";
import { ZodError } from "zod";
import * as servicioUsuarios from "./users.service";
import {
  esquemaActualizarUsuario,
  esquemaCrearUsuario,
  esquemaIdUsuario,
  esquemaPaginacion,
  opcionesValidacion,
} from "./users.schemas";

export async function listarUsuarios(solicitud: Request, respuesta: Response) {
  const paginacion = esquemaPaginacion.parse(solicitud.query, opcionesValidacion);
  const resultado = await servicioUsuarios.listarUsuarios(paginacion);
  respuesta.status(200).json(resultado);
}

export async function obtenerUsuario(solicitud: Request, respuesta: Response) {
  const { id } = esquemaIdUsuario.parse(solicitud.params, opcionesValidacion);
  const usuario = await servicioUsuarios.obtenerUsuario(id);
  respuesta.status(200).json({ datos: usuario });
}

export async function crearUsuario(solicitud: Request, respuesta: Response) {
  const datosValidados = esquemaCrearUsuario.parse(solicitud.body, opcionesValidacion);
  const usuario = await servicioUsuarios.crearUsuario(datosValidados);
  respuesta.location(`${solicitud.baseUrl}/${usuario.id}`).status(201).json({ datos: usuario });
}

export async function actualizarUsuario(solicitud: Request, respuesta: Response) {
  const { id } = esquemaIdUsuario.parse(solicitud.params, opcionesValidacion);
  const datosValidados = esquemaActualizarUsuario.parse(solicitud.body, opcionesValidacion);
  const usuario = await servicioUsuarios.actualizarUsuario(id, datosValidados);
  respuesta.status(200).json({ datos: usuario });
}

export async function desactivarUsuario(solicitud: Request, respuesta: Response) {
  const { id } = esquemaIdUsuario.parse(solicitud.params, opcionesValidacion);
  await servicioUsuarios.desactivarUsuario(id);
  respuesta.status(204).end();
}

export const manejarErroresUsuarios: ErrorRequestHandler = (
  error: unknown, _solicitud, respuesta, siguiente,
) => {
  if (respuesta.headersSent) {
    siguiente(error);
    return;
  }

  if (error instanceof ZodError) {
    respuesta.status(400).json({
      error: {
        codigo: "DATOS_INVALIDOS",
        mensaje: "Los datos enviados no son válidos.",
        detalles: error.issues.map((problema) => ({
          campo: problema.path.join("."),
          mensaje: problema.message,
        })),
      },
    });
    return;
  }

  if (error instanceof servicioUsuarios.ErrorUsuarios) {
    const estados = { USUARIO_NO_ENCONTRADO: 404, EMAIL_DUPLICADO: 409, ROL_INEXISTENTE: 400 };
    respuesta.status(estados[error.codigo]).json({
      error: { codigo: error.codigo, mensaje: error.message },
    });
    return;
  }

  if (error instanceof Error && "type" in error) {
    if (error.type === "entity.too.large") {
      respuesta.status(413).json({
        error: { codigo: "CUERPO_DEMASIADO_GRANDE", mensaje: "El cuerpo de la petición supera el límite permitido." },
      });
      return;
    }
    if (["entity.parse.failed", "request.aborted", "request.size.invalid"].includes(String(error.type))) {
      respuesta.status(400).json({
        error: { codigo: "JSON_INVALIDO", mensaje: "El cuerpo debe contener JSON válido." },
      });
      return;
    }
    if (["encoding.unsupported", "charset.unsupported"].includes(String(error.type))) {
      respuesta.status(415).json({
        error: { codigo: "FORMATO_NO_SOPORTADO", mensaje: "La codificación del cuerpo no está soportada." },
      });
      return;
    }
  }

  respuesta.status(500).json({
    error: { codigo: "ERROR_INTERNO", mensaje: "Error interno del servidor." },
  });
};
