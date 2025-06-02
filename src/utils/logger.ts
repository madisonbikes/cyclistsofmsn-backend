import { ConnectionString } from "connection-string";
import { stdSerializers, pino } from "pino";
import { initEnv } from "./env.js";

initEnv();

const TEST_LOG_LEVEL = process.env.TEST_LOG_LEVEL ?? "fatal";
const LOG_LEVEL = process.env.LOG_LEVEL;

const serializers = {
  err: stdSerializers.err,
  when: (date: unknown) => {
    if (date instanceof Date) {
      return date.toLocaleString();
    } else {
      return date;
    }
  },
};

const options: pino.LoggerOptions = { serializers };

if (process.env.NODE_ENV === "test") {
  options.level = TEST_LOG_LEVEL;
} else if (process.env.NODE_ENV === "development") {
  options.level = LOG_LEVEL ?? "info";
} else {
  // production
  options.level = LOG_LEVEL ?? "warn";
}

const usePinoPretty = Boolean(process.env.PINO_PRETTY);
if (usePinoPretty) {
  options.transport = {
    target: "pino-pretty",
  };
}

export const logger = pino(options);

export const maskUriPassword = (uri: string) => {
  try {
    const logUri = new ConnectionString(uri);
    return logUri.toString({ passwordHash: true });
  } catch (err) {
    logger.warn({ err, uri }, "unparseable/unmaskable URI");
    return uri;
  }
};
