import { createLogger, transports, format } from "winston";

const formatter = format.combine(
  format.timestamp({
    format: "YYYY-MM-DD HH:mm:ss"
  }),
  format.errors({ stack: true }),
  format.printf(info => {
    const { timestamp, level, stack } = info;
    let { code, message } = info;

    // print out http error code w/ a space if we have one
    code = code ? ` ${code}` : "";
    // print the stack if we have it, message otherwise.
    message = stack || message;

    return `${timestamp} ${level}${code}: ${message}`;
  })
);

export const logger = createLogger({

  level: "debug",
  format: formatter,
  transports: [
    new transports.File({ filename: "errors.log", level: "error" })
  ]
});

//
// If we're not in production then **ALSO** log to the `console`
// with the colorized simple format.
//
if (process.env.NODE_ENV !== "test" && process.env.NODE_ENV !== "prod") {
  logger.add(new transports.Console({
    format: format.combine(
      format.colorize(),
      formatter
    )
  }));
}