import "reflect-metadata";
import http from "http";
import Koa from "koa";
import koaQueryString from "koa-qs";
import koa_logger from "koa-logger";
import serve from "koa-static";
import { router } from "./routes";
import { startExecutor, stopExecutor } from "./post_executor";
import { logger } from "./utils/logger";
import { container, injectable } from "tsyringe";
import { Server } from "http";
import { ServerConfiguration } from "./config";
import { ImageRepositoryScanner } from "./scan";
import { Database } from "./database";

/** expose command-line launcher */
if (require.main === module) {
  /** launches server. this syntax allows server startup to run as async function */
  Promise.resolve()
    .then(() => {
      const server = container.resolve(PhotoServer);
      return server.start();
    })
    .catch((error) => {
      logger.error(error);
    });
}

@injectable()
export class PhotoServer {
  constructor(
    private configuration: ServerConfiguration,
    private scanner: ImageRepositoryScanner,
    private database: Database
  ) {}

  server: Server | undefined;

  /** returns async function that can be used to shutdown the server */
  async start(): Promise<void> {
    await this.database.connect();
    await this.scanner.scan();
    await startExecutor();

    const app = new Koa();

    // for query strings, only the first value for the given parameter is passed
    // to keep our APIs simple
    koaQueryString(app, "first");

    app.use(
      koa_logger({
        transporter: (str: string, args: unknown) => {
          logger.debug(str, args);
        },
      })
    );

    // in production mode, serve the production React app from here
    if (this.configuration.reactStaticRootDir) {
      app.use(serve(this.configuration.reactStaticRootDir));
    }
    app.use(router.routes());
    app.use(router.allowedMethods());
    app.on("error", (err) => {
      logger.error(err);
    });

    this.server = http
      .createServer(app.callback())
      .listen(this.configuration.serverPort);
    logger.info(`Server is listening on port ${this.configuration.serverPort}`);
  }

  async stop(): Promise<void> {
    this.server?.close();
    await stopExecutor();

    await this.database.disconnect();
  }
}
