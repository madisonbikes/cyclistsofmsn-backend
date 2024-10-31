import { configuration } from "./config";
import redis from "./session_redis";
import session from "express-session";
import { logger } from "./utils";

const COOKIE_MAX_AGE_DAYS = 7;

export function sessionMiddlewareConfigurator() {
  const sessionOptions: session.SessionOptions = {
    proxy: configuration.trustProxy,
    secret: configuration.sessionStoreSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: configuration.secureCookie,
      maxAge: COOKIE_MAX_AGE_DAYS * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: configuration.secureCookie ? "strict" : "lax",
    },
  };
  if (redis.isEnabled()) {
    sessionOptions.store = redis.createStore();
  } else {
    logger.warn("Redis session store is disabled");
  }
  return session(sessionOptions);
}
