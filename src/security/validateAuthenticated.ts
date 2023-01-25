import { NextFunction, Request, Response } from "express";
import { AuthenticatedUser } from "../routes/types";
import { logger } from "../utils";

export const validateAuthenticated = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  logger.trace(request.user, "validating authenticated");
  const user = request.user as AuthenticatedUser;
  if (user === undefined) {
    response.status(401).send("requires authenticated");
  } else {
    next();
  }
};
