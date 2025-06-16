import http, { Server } from "http";
import cors from "cors";
import { Lifecycle, logger } from "./utils";
import { configuration } from "./config";
import imageRepositoryScanner from "./scan";
import { database } from "./database";
import api from "./routes";
import express, { NextFunction, Request, Response } from "express";
import passport from "passport";
import { strategies } from "./security";
import { valkeySessionStore } from "./session_valkey";
import { sessionMiddlewareConfigurator } from "./session";
import persistent_cache from "./utils/persistent_cache";

/** expose command-line launcher */
if (require.main === module) {
  /** launches server. this syntax allows server startup to run as async function */
  Promise.resolve()
    .then(() => {
      const server = new PhotoServer();
      return server.start();
    })
    .catch((error: unknown) => {
      logger.error(error);
    });
}

export class PhotoServer implements Lifecycle {
  constructor() {
    this.components.push(database);
    this.components.push(valkeySessionStore);
    this.components.push(imageRepositoryScanner);
    this.components.push(persistent_cache);
  }

  components: Lifecycle[] = [];
  server: Server | undefined;

  /** create server but don't start main listener, for testing */
  async create(): Promise<Server> {
    for (const c of this.components) {
      await c.start();
    }

    const app = express();

    app.use(express.json());

    if (configuration.enableCors) {
      // cors should only be used for development -- production serves from same server/port
      app.use(cors());
    }

    // in production mode, serve the production React app from here
    if (configuration.reactStaticRootDir) {
      app.use("/", express.static(configuration.reactStaticRootDir));
    }

    // init passport
    passport.use(strategies.local);
    passport.serializeUser<string>((user, done) => {
      logger.trace(user, "serialize user");
      const data = JSON.stringify(user);
      done(null, data);
    });

    passport.deserializeUser<string>((data, done) => {
      const user = JSON.parse(data) as unknown as Express.User;
      logger.trace(user, "deserialize user");
      done(null, user);
    });

    app.use(sessionMiddlewareConfigurator());
    app.use(passport.initialize());
    app.use(passport.session());

    app.use("/api/v1", api.routes());

    // in production mode, redirect any unknown routes to the root in case of weird bookmarks etc
    if (configuration.reactStaticRootDir) {
      app.get("*", (_req, res) => {
        res.redirect("/");
      });
    }

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
    this.server?.listen(configuration.serverPort);
    logger.info("Server is listening on port %d", configuration.serverPort);
  }

  async stop(): Promise<void> {
    this.server?.close();

    // shut them down in reverse order
    for (const c of this.components.reverse()) {
      await c.stop?.();
    }
  }
}
