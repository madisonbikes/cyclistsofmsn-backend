import { configuration } from "./config";
import RedisStore from "connect-redis";
import { logger, maskUriPassword } from "./utils";
import { GlideClient, GlideClientConfiguration } from "@valkey/valkey-glide";
import { z } from "zod";

let client: GlideClient | undefined;
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

    client = await GlideClient.createClient(
      urlToValkeyGlideClientConfiguration(this.url),
    );
    logger.info(`Using Valkey session store on ${maskUriPassword(this.url)}`);
  }

  stop() {
    if (!started) {
      throw new Error("cannot stop a Valkey connection that isn't started");
    }
    started = false;
    if (client !== undefined) {
      client.close();
      client = undefined;
    }
  }

  createStore() {
    if (!client) {
      throw new Error("Valkey connection not started");
    }
    return new RedisStore({ client });
  }
}

export const valkeySessionStore = new ValkeySessionStore();

export const urlToValkeyGlideClientConfiguration = (
  url: string,
): GlideClientConfiguration => {
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
  const { success: successDatabaseId, data: databaseId } = z.coerce
    .number()
    .min(0)
    .default(0)
    .safeParse(parsedUrl.pathname.substring(1));
  if (!successDatabaseId) {
    throw new Error(`Invalid database ID in valkey session URI: ${url}`);
  }
  return {
    databaseId,
    addresses: [{ host: parsedUrl.hostname, port }],
  };
};
