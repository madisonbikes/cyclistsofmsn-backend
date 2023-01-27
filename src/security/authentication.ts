import "reflect-metadata";
import { injectable } from "tsyringe";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { User, UserDocument } from "../database";
import { logger } from "../utils";
import { AuthenticatedUser, authenticatedUserSchema } from "../routes/contract";
import { Request, Response, NextFunction } from "express";

export type AuthenticatedExpressUser = Express.User & AuthenticatedUser;

export enum Roles {
  ADMIN = "admin",
  EDITOR = "editor",
}

export const userHasRole = (user: AuthenticatedUser, role: string) => {
  return user.roles.find((r) => r === role) !== undefined;
};

export const localMiddleware = passport.authenticate("local", {
  session: true,
});

export type ExpressMiddleware = (
  request: Request,
  response: Response,
  next: NextFunction
) => void;

@injectable()
export class Strategies {
  /** passport strategy implementation for username/pw against mongodb */
  readonly local = new LocalStrategy(async (username, password, done) => {
    logger.trace({ username }, "local passport auth");
    let success = false;
    if (!username) {
      done("null username", false);
      return;
    }

    const user = await User.findOne({ username });
    if (user) {
      success = await user.checkPassword(password);
    }
    if (!success || !user) {
      done(null, false);
    } else {
      done(null, this.authenticatedUser(user));
    }
  });

  /** sanitizes user info for export to JWT and into request object */
  private authenticatedUser(user: UserDocument): AuthenticatedUser {
    return authenticatedUserSchema.parse(user);
  }
}
