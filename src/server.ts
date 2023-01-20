import "reflect-metadata";
import http, { Server } from "http";
import { Lifecycle, logger } from "./utils";
import { container, injectable } from "tsyringe";
import { ServerConfiguration } from "./config";
import { ImageRepositoryScanner } from "./scan";
import { Database } from "./database";
import MainRouter from "./routes";
import { PostDispatcher } from "./posts/dispatcher";

import express from "express";
import session from "express-session";
import passport from "passport";
import { Strategies } from "./security/authentication";
import { RedisConnection } from "./redis";

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
    private redis: RedisConnection,
    private apiRouter: MainRouter,
    postDispatcher: PostDispatcher,
    private strategies: Strategies
  ) {
    this.components.push(database);
    this.components.push(redis);
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

    const app = express();

    app.use(express.json());

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

    const sessionOptions: session.SessionOptions = {
      secret: this.configuration.sessionStoreSecret,
      resave: false,
      saveUninitialized: false,
    };
    if (this.redis.isEnabled()) {
      sessionOptions.store = this.redis.createStore();
    }
    app.use(session(sessionOptions));
    app.use(passport.initialize());
    app.use(passport.session());

    app.use("/api/v1", this.apiRouter.routes);
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
