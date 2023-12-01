/* istanbul ignore file */
import { ConnectionString } from "connection-string";
import pino, { Logger, stdSerializers, TransportTargetOptions } from "pino";
import { initEnv } from "./env";

initEnv();

const logFile = process.env.LOG_FILE ?? "backend.log";
const logLevel = process.env.LOG_LEVEL ?? "info";
const consoleLogLevel = process.env.CONSOLE_LOG_LEVEL ?? "info";
const testLogLevel = process.env.TEST_LOG_LEVEL ?? "silent";

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

let newLogger: Logger;
if (process.env.NODE_ENV === "test") {
  const transport = pino.transport({
    targets: [
      {
        level: testLogLevel,
        target: "pino-pretty",
        options: { destination: 1 }, // stdout
      },
    ],
  });
  newLogger = pino({ level: testLogLevel, serializers }, transport);
} else {
  const targets: TransportTargetOptions[] = [
    {
      level: consoleLogLevel,
      target: "pino-pretty",
      options: { destination: 1 }, // stdout
    },
    {
      level: logLevel,
      target: "pino-pretty",
      options: { colorize: false, destination: logFile },
    },
  ];

  const transport = pino.transport({
    targets,
  });

  // ensure pino base logger level is set to minimum of the transports
  const levels = [consoleLogLevel, logLevel].map((l) => pino.levels.values[l]);
  const minLevel = Math.min(...levels);
  const level = pino.levels.labels[minLevel];
  newLogger = pino({ level, serializers }, transport);
}
export const logger = newLogger;

export const maskUriPassword = (uri: string) => {
  try {
    const logUri = new ConnectionString(uri);
    return logUri.toString({ passwordHash: true });
  } catch (err) {
    logger.warn({ err, uri }, "unparseable/unmaskable URI");
    return uri;
  }
};
