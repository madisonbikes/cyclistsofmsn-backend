import pino, { Logger } from "pino";
let newLogger: Logger;

if (process.env.NODE_ENV === "test") {
  newLogger = pino({ level: "silent" });
} else {
  const transport = pino.transport({
    targets: [
      {
        level: "info",
        target: "pino-pretty",
        options: { destination: 1 }, // stdout
      },
      {
        level: "debug",
        target: "pino-pretty",
        options: { colorize: false, destination: "debug.log" },
      },
    ],
  });
  newLogger = pino(transport);
}
export const logger = newLogger;
