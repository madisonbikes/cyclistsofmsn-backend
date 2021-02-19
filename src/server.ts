import "reflect-metadata";
import Koa from "koa";
import koaQueryString from "koa-qs";
import koa_logger from "koa-logger";
import serve from "koa-static";
import { router } from "./routes";
import { configuration } from "./config";
import { scan } from "./scan";
import { database } from "./database";
import { startExecutor, stopExecutor } from "./post_executor";
import { logger } from "./utils/logger";

/** expose command-line launcher */
if (require.main === module) {
  /** launches server. this syntax allows server startup to run as async function */
  Promise.resolve()
    .then(() => {
      return startServer();
    })
    .catch((error) => {
      logger.error(error);
    });
}

/** returns async function that can be used to shutdown the server */
export async function startServer(): Promise<() => Promise<void>> {
  await database.connect();
  await scan();
  await startExecutor();

  const app = new Koa();

  // for query strings, only the first value for the given parameter is passed
  // to keep our APIs simple
  koaQueryString(app, "first");

  app.use(
    koa_logger({
      transporter: (str: string, args: unknown) => {
        logger.debug(str, args);
      }
    })
  );

  // in production mode, serve the production React app from here
  if (configuration.reactStaticRootDir) {
    app.use(serve(configuration.reactStaticRootDir));
  }
  app.use(router.routes());
  app.use(router.allowedMethods());

  const server = app.listen(configuration.serverPort, () => {
    logger.info(`Server is listening on port ${configuration.serverPort}`);
  });

  return async () => {
    server.close();
    await stopExecutor();

    await database.disconnect();
  };
}
