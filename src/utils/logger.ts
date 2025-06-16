import { ConnectionString } from "connection-string";
import { stdSerializers, pino } from "pino";
import { initEnv } from "./env.ts";
import pretty from "pino-pretty";

initEnv();

const TEST_LOG_LEVEL = process.env.TEST_LOG_LEVEL ?? "fatal";
const LOG_LEVEL = process.env.LOG_LEVEL;

const serializers = {
  err: stdSerializers.errWithCause,
  when: (date: unknown) => {
    if (date instanceof Date) {
      return date.toLocaleString();
    } else {
      return date;
    }
  },
};

let sync = false;

const options: pino.LoggerOptions = { serializers };

if (process.env.NODE_ENV === "test") {
  sync = true;
  options.level = TEST_LOG_LEVEL;
} else if (process.env.NODE_ENV === "development") {
  options.level = LOG_LEVEL ?? "info";
} else {
  // production
  options.level = LOG_LEVEL ?? "warn";
}

let stream: pino.DestinationStream = pino.destination({ dest: 1, sync });

const usePinoPretty = Boolean(process.env.PINO_PRETTY);
if (usePinoPretty) {
  stream = pretty({ colorize: true, sync });
}

export const logger = pino(options, stream);

export const maskUriPassword = (uri: string) => {
  try {
    const logUri = new ConnectionString(uri);
    return logUri.toString({ passwordHash: true });
  } catch (err) {
    logger.warn({ err, uri }, "unparseable/unmaskable URI");
    return uri;
  }
};
