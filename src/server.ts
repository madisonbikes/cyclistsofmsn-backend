import "reflect-metadata";
import http, { Server } from "http";
import Koa from "koa";
import koaQueryString from "koa-qs";
import koa_logger from "koa-logger";
import serve from "koa-static";
import { Lifecycle, logger } from "./utils";
import { container, injectable } from "tsyringe";
import { ServerConfiguration } from "./config";
import { ImageRepositoryScanner } from "./scan";
import { Database } from "./database";
import { Router } from "./routes";
import { PostDispatcher } from "./posts/dispatcher";

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
export class PhotoServer implements Lifecycle {
  constructor(
    private configuration: ServerConfiguration,
    scanner: ImageRepositoryScanner,
    database: Database,
    private router: Router,
    postDispatcher: PostDispatcher
  ) {
    this.components.push(database);
    this.components.push(scanner);
    this.components.push(postDispatcher);
  }

  components: Lifecycle[] = [];
  server: Server | undefined;

  /** create server but don't start main listener, for testing */
  async create(): Promise<Server> {
    for await (const c of this.components) {
      await c.start();
    }

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
    app.use(this.router.routes());
    app.use(this.router.allowedMethods());
    app.on("error", (err) => {
      logger.error(err);
    });

    this.server = http.createServer(app.callback());
    return this.server;
  }

  /** called to create and start listener */
  async start(): Promise<void> {
    await this.create();
    this.server?.listen(this.configuration.serverPort);
    logger.info(`Server is listening on port ${this.configuration.serverPort}`);
  }

  async stop(): Promise<void> {
    this.server?.close();

    // shut them down in reverse order
    for await (const c of this.components.reverse()) {
      await c.stop?.();
    }
  }
}
