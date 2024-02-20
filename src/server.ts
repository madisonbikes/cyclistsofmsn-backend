import "reflect-metadata";
import http, { Server } from "http";
import cors from "cors";
import { Lifecycle, logger } from "./utils";
import { container, injectable } from "tsyringe";
import { ServerConfiguration } from "./config";
import { ImageRepositoryScanner } from "./scan";
import { Database } from "./database";
import { MainRouter } from "./routes";
import { PostDispatcher } from "./posts/dispatcher";
import { PostPopulate } from "./posts/populate";

import express, { NextFunction, Request, Response } from "express";
import passport from "passport";
import { Strategies } from "./security";
import { RedisConnection } from "./redis";
import { SessionMiddlewareConfigurator } from "./session";

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
    private strategies: Strategies,
    private sessionMiddlewareConfigurator: SessionMiddlewareConfigurator,
    private apiRouter: MainRouter,

    database: Database,
    redis: RedisConnection,
    scanner: ImageRepositoryScanner,
    postDispatcher: PostDispatcher,
    postPopulate: PostPopulate,
  ) {
    this.components.push(database);
    this.components.push(redis);
    this.components.push(scanner);
    this.components.push(postDispatcher);
    this.components.push(postPopulate);
  }

  components: Lifecycle[] = [];
  server: Server | undefined;

  /** create server but don't start main listener, for testing */
  async create(): Promise<Server> {
    for await (const c of this.components) {
      await c.start();
    }

    const app = express();

    app.use(express.json());

    if (this.configuration.enableCors) {
      // cors should only be used for development -- production serves from same server/port
      app.use(cors());
    }

    // in production mode, serve the production React app from here
    if (this.configuration.reactStaticRootDir) {
      app.use("/", express.static(this.configuration.reactStaticRootDir));
    }

    // init passport
    passport.use(this.strategies.local);
    passport.serializeUser<string>((user, done) => {
      logger.trace(user, "serialize user");
      const data = JSON.stringify(user);
      done(null, data);
    });

    passport.deserializeUser<string>((data, done) => {
      const user = JSON.parse(data);
      logger.trace(user, "deserialize user");
      done(null, user);
    });

    app.use(this.sessionMiddlewareConfigurator.build());
    app.use(passport.initialize());
    app.use(passport.session());

    app.use("/api/v1", this.apiRouter.routes());

    app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
      logger.error(err, "Unhandled server error");
      res.sendStatus(500);
    });

    app.on("error", (err) => {
      logger.error(err);
    });

    this.server = http.createServer(app);
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
