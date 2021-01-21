import Koa from "koa";
import logger from "koa-logger";
import { router } from "./router";
import { databaseConnect } from "./connection";
import { scan } from "./scan";

const PORT = process.env.PORT || 3001;

databaseConnect().then(async (connection) => {
  scan(connection);

  const app = new Koa();
  app.use(logger());
  app.use(router.routes());
  app.use(router.allowedMethods());
  app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
  });
});
