import { NextFunction, Request, Response } from "express";
import { logger } from "../utils";
import { AuthenticatedUser } from "./authentication";

const validateAdmin = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  logger.trace(request.user, "validating admin");
  const user = request.user as AuthenticatedUser;
  if (user === undefined || user.admin !== true) {
    response.status(401).send("requires admin");
  } else {
    next();
  }
};

export default validateAdmin;
