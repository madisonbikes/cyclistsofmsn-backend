import Koa from "koa";
import logger from "koa-logger";
import serve from "koa-static";
import { router } from "./router";
import { databaseConnect } from "./connection";
import { scan } from "./scan";
import { PORT, STATIC_ROOT_DIR } from "./env";

databaseConnect().then(async (connection) => {
  // scan filesystem/db first, then start serve
  scan(connection);

  const app = new Koa();
  app.use(logger());

  // in production mode, serve the production React app from here
  if (STATIC_ROOT_DIR) {
    app.use(serve(STATIC_ROOT_DIR));
  }
  app.use(router.routes());
  app.use(router.allowedMethods());
  app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
  });
});
