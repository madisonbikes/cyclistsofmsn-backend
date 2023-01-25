import { injectable } from "tsyringe";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { User, UserDocument } from "../database";
import { logger } from "../utils";
import { AuthenticatedUser } from "../routes/types";

export type AuthenticatedExpressUser = Express.User & AuthenticatedUser;

export const localMiddleware = passport.authenticate("local", {
  session: true,
});

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
    return {
      username: user.username,
      admin: user.admin ?? false,
    };
  }
}
