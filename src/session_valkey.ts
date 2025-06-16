import { configuration } from "./config";
import { RedisStore as ValkeyStore } from "connect-redis";
import { logger, maskUriPassword } from "./utils";
import { Redis as ValKey } from "iovalkey";
import { z } from "zod/v4";

let client: ValKey | undefined;
let started = false;

class ValkeySessionStore {
  private url = configuration.valkeySessionUri;
  private enabled = configuration.valkeySessionUri !== "";

  get isEnabled() {
    return this.enabled;
  }

  async start() {
    if (started) {
      throw new Error("cannot start multiple valkey connection instances");
    }
    started = true;
    if (!this.isEnabled) {
      logger.info("Valkey disabled");
      return;
    }

    const config = urlToValkeyConfiguration(this.url);

    client = new ValKey({ ...config, lazyConnect: true });
    logger.info(`Using Valkey session store on ${maskUriPassword(this.url)}`);
    await client.connect();
  }

  stop() {
    if (!started) {
      throw new Error("cannot stop a Valkey connection that isn't started");
    }
    started = false;
    if (client !== undefined) {
      client.disconnect();
      client = undefined;
    }
  }

  createStore() {
    if (!client) {
      throw new Error("Valkey connection not started");
    }
    return new ValkeyStore({ client });
  }
}

export const valkeySessionStore = new ValkeySessionStore();

type ValkeyConfiguration = {
  db?: number;
  host: string;
  port: number;
  password?: string;
};

export const urlToValkeyConfiguration = (url: string): ValkeyConfiguration => {
  const parsedUrl = new URL(url);
  if (parsedUrl.protocol !== "valkey:" && parsedUrl.protocol !== "redis:") {
    throw new Error(`Invalid valkey session URI: ${url}`);
  }

  const { success: successPort, data: port } = z.coerce
    .number()
    .min(1)
    .max(65535)
    .safeParse(parsedUrl.port);
  if (!successPort) {
    throw new Error(`Invalid port in valkey session URI: ${url}`);
  }
  const { success: successDatabaseId, data: db } = z.coerce
    .number()
    .nonnegative()
    .optional()
    .safeParse(parsedUrl.pathname.substring(1));
  if (!successDatabaseId) {
    throw new Error(`Invalid database ID in valkey session URI: ${url}`);
  }

  let password: string | undefined = parsedUrl.password;
  if (password === "") {
    password = undefined;
  }
  return {
    db,
    host: parsedUrl.hostname,
    password,
    port,
  };
};
