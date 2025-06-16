import { configuration } from "./config.ts";
import { valkeySessionStore } from "./session_valkey.ts";
import session from "express-session";
import { logger } from "./utils/index.ts";

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
  if (valkeySessionStore.isEnabled) {
    sessionOptions.store = valkeySessionStore.createStore();
  } else {
    logger.warn("Valkey session store is disabled");
  }
  return session(sessionOptions);
}
