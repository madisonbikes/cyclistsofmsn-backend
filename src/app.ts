import Koa from "koa";
import logger from "koa-logger";
import { router } from "./router";
import { databaseConnect } from "./connection";
import { scan } from "./scan";

databaseConnect().then(async (connection) => {
  scan(connection);

  const app = new Koa();
  app.use(logger());
  app.use(router.routes());
  app.use(router.allowedMethods());
  app.listen(3000);
});
