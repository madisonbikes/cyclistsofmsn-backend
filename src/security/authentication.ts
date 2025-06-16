import { Strategy as LocalStrategy } from "passport-local";
import { logger } from "../utils";
import {
  type AuthenticatedUser,
  authenticatedUserSchema,
} from "../routes/contract";
import bcrypt from "bcryptjs";
import { userModel } from "../database/database";
import type { DbUser } from "../database/types";
import type { NextFunction, Request, Response } from "express";

export type Roles = "admin" | "editor";

/** check this level every few years, eventually bump to higher hash size to improve security */
const BCRYPT_HASH_SIZE = 10;

export const userHasRole = (user: AuthenticatedUser, role: Roles) => {
  return user.roles.find((r) => r === role) !== undefined;
};

export type ExpressMiddleware = (
  request: Request,
  response: Response,
  next: NextFunction,
) => void;

class Strategies {
  /** passport strategy implementation for username/pw against mongodb */
  readonly local = new LocalStrategy(async (username, password, done) => {
    logger.trace({ username }, "local passport auth");
    let success = false;
    if (!username) {
      done("null username", false);
      return;
    }
    try {
      const user = await userModel.findByUsername(username);
      if (user) {
        success = await this.checkPassword(user.hashed_password, password);
      } else {
        // even with missing user, waste cpu cycles "checking" password to hide this API consumers
        await generateHashedPassword("no_password");
      }
      if (!success || !user) {
        done(null, false);
      } else {
        done(null, this.authenticatedUser(user));
      }
    } catch (err) {
      done(err, false);
    }
  });

  checkPassword(hashedPassword: string, checkPassword: string) {
    return bcrypt.compare(checkPassword, hashedPassword);
  }

  /** sanitizes user info for export to JWT and into request object */
  private authenticatedUser(user: DbUser): AuthenticatedUser {
    return authenticatedUserSchema.parse(user);
  }
}

const generateHashedPassword = (password: string) => {
  return bcrypt.hash(password, BCRYPT_HASH_SIZE);
};

export const strategies = new Strategies();
