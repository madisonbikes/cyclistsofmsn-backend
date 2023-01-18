import { NextFunction, Request, Response } from "express";
import { AuthenticatedUser } from "./authentication";

export const verifyAdmin = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const user = request.user as AuthenticatedUser;
  if (!user.admin) {
    response.status(401).send("requires admin");
    return;
  }
  next();
};
