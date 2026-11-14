import app from "./app";
import { env } from "./config/env";

const opcionesEscucha = {
  port: env.PORT,
  ...(env.NODE_ENV === "development" ? { host: "127.0.0.1" } : {}),
};

app.listen(opcionesEscucha, () => {
  console.log(`BarberOS backend en http://localhost:${env.PORT}`);
  console.log(` -Health: http://localhost:${env.PORT}/api/health`);
});
