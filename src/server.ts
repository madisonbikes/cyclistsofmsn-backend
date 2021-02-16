import Koa from "koa";
import koaQueryString from "koa-qs";
import logger from "koa-logger";
import serve from "koa-static";
import { router } from "./routes";
import { configuration } from "./config";
import { Server } from "http";
import { scan } from "./scan";
import { database } from "./database";
import { scheduleNextPost } from "./scheduler";

export async function startServer(): Promise<Server> {
  await database.connect();
  await scan();
  await scheduleNextPost();

  const app = new Koa();

  // for query strings, only the first value for the given parameter is passed
  // to keep our APIs simple
  koaQueryString(app, "first");

  app.use(logger());

  // in production mode, serve the production React app from here
  if (configuration.reactStaticRootDir) {
    app.use(serve(configuration.reactStaticRootDir));
  }
  app.use(router.routes());
  app.use(router.allowedMethods());

  return app.listen(configuration.serverPort, () => {
    console.log(`Server is listening on port ${configuration.serverPort}`);
  });
}
