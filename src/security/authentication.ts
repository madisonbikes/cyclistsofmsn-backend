import { injectable } from "tsyringe";
import { Strategy as JwtStrategy } from "passport-jwt";
import passport from "passport";
import { JwtManager, JwtPayload } from "./jwt";

export type AuthenticatedUser = Express.User & {
  username: string;
  admin: boolean;
};

/** passport jwt middleware */
export const jwtMiddleware = passport.authenticate("jwt", { session: false });

@injectable()
export class Strategies {
  constructor(private jwtManager: JwtManager) {}

  /** passport strategy implementation for JWT bearer auth tokens */
  readonly jwt = new JwtStrategy(
    this.jwtManager.strategyOptions(),
    (payload: JwtPayload, done) => {
      done(null, payload);
      /*
      const lookupUser = await this.userModel.findUser(payload?.sub ?? "");
      if (lookupUser) {
        done(null, this.authenticatedUser(lookupUser));
      } else {
        // user deleted?
        done(null, false);
      }
      */
    }
  );

  /** sanitizes user info for export to JWT and into request object */
  /*
  private authenticatedUser(user: User): AuthenticatedUser {
    return { username: user.username, admin: user.admin ?? false };
  }
  */
}
