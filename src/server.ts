import Koa from "koa";
import koaQueryString from "koa-qs";
import logger from "koa-logger";
import serve from "koa-static";
import { router } from "./routes";
import { configuration } from "./config";
import { Server } from "http";
import { scan } from "./scan";
import { database } from "./database";
import { scheduleNextPost, clearSchedule } from "./post_scheduler";

/** expose command-line launcher */
if (require.main === module) {
  /** launches server. this syntax allows server startup to run as async function */
  Promise.resolve()
    .then(() => {
      return startServer();
    })
    .catch((error) => {
      console.error(error);
    });
}

export async function startServer(): Promise<() => Promise<void>> {
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

  const server = app.listen(configuration.serverPort, () => {
    console.log(`Server is listening on port ${configuration.serverPort}`);
  });

  return async () => {
    server.close()

    await database.disconnect()
    await clearSchedule()
  }
}
