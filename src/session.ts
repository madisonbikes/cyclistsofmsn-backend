import { injectable } from "tsyringe";
import { ServerConfiguration } from "./config";
import { RedisConnection } from "./redis";
import session from "express-session";

const COOKIE_MAX_AGE_DAYS = 7;

@injectable()
export class SessionMiddlewareConfigurator {
  constructor(
    private configuration: ServerConfiguration,
    private redis: RedisConnection
  ) {}

  build() {
    const sessionOptions: session.SessionOptions = {
      proxy: this.configuration.trustProxy,
      secret: this.configuration.sessionStoreSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: this.configuration.secureCookie,
        maxAge: COOKIE_MAX_AGE_DAYS * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: this.configuration.secureCookie ? "strict" : "lax",
      },
    };
    if (this.redis.isEnabled()) {
      sessionOptions.store = this.redis.createStore();
    }
    return session(sessionOptions);
  }
}
