import app from "./app";
import { env } from "./config/env";

app.listen(env.PORT, () => {
  console.log(`BarberOS backend en http://localhost:${env.PORT}`);
  console.log(` -Health: http://localhost:${env.PORT}/api/health`);
});