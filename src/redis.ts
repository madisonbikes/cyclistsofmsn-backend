import { configuration } from "./config";
import RedisStore from "connect-redis";
import { createClient, RedisClientType } from "redis";
import { logger, maskUriPassword } from "./utils";

let client: RedisClientType | undefined;
let started = false;

function isEnabled() {
  return configuration.redisUri !== undefined && configuration.redisUri !== "";
}

async function start() {
  if (started) {
    throw new Error("cannot start multiple redis connection instances");
  }
  started = true;
  if (!isEnabled()) {
    logger.info("Redis disabled");
    return;
  }

  client = createClient({ url: configuration.redisUri });
  client.on("error", (err) => logger.warn(err, "Redis Client Error"));
  logger.info(
    `Connecting to redis on ${maskUriPassword(configuration.redisUri)}`,
  );
  await client.connect();
}

async function stop() {
  if (!started) {
    throw new Error("cannot stop a redis connection that isn't started");
  }
  started = false;
  if (client !== undefined) {
    await client.disconnect();
    client = undefined;
  }
}

function createStore() {
  if (!client) {
    throw new Error("Redis connection not started");
  }
  return new RedisStore({ client });
}

export default { isEnabled, start, stop, createStore };
