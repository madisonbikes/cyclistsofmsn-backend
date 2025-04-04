import { ConnectionString } from "connection-string";
import pino, {
  DestinationStream,
  Logger,
  stdSerializers,
  TransportTargetOptions,
} from "pino";
import { initEnv } from "./env";
import fs from "fs-extra";
import { PinoPretty } from "pino-pretty";

initEnv();

const logFile = process.env.LOG_FILE ?? "output/backend.log";
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
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const transport = pino.transport({
    targets: [
      {
        level: testLogLevel,
        target: "pino-pretty",
        options: { destination: 1 } satisfies PinoPretty.PrettyOptions,
      },
    ],
  });
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  newLogger = pino({ level: testLogLevel, serializers }, transport);
} else {
  fs.ensureFileSync(logFile); // ensure log file/directory exists before creating logger
  const targets: TransportTargetOptions[] = [
    {
      level: consoleLogLevel,
      target: "pino-pretty",
      options: { destination: 1 } satisfies PinoPretty.PrettyOptions,
    },
    {
      level: logLevel,
      target: "pino-pretty",
      options: {
        colorize: false,
        destination: logFile,
      } satisfies PinoPretty.PrettyOptions,
    },
  ];

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const transport: DestinationStream = pino.transport({
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
