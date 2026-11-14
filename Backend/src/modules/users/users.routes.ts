import { json, Router } from "express";
import {
  actualizarUsuario,
  crearUsuario,
  desactivarUsuario,
  listarUsuarios,
  manejarErroresUsuarios,
  obtenerUsuario,
} from "./users.controller";

const rutasUsuarios = Router();

rutasUsuarios.use(json({ limit: "16kb" }));
rutasUsuarios.get("/", listarUsuarios);
rutasUsuarios.get("/:id", obtenerUsuario);
rutasUsuarios.post("/", crearUsuario);
rutasUsuarios.patch("/:id", actualizarUsuario);
rutasUsuarios.delete("/:id", desactivarUsuario);
rutasUsuarios.use(manejarErroresUsuarios);

export default rutasUsuarios;
