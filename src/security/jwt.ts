import jwt from "jsonwebtoken";
import { ExtractJwt, StrategyOptions } from "passport-jwt";
import { injectable, singleton } from "tsyringe";
import { ServerConfiguration } from "../config";
import { AuthenticatedUser } from "./authentication";

export type JwtPayload = Omit<AuthenticatedUser, "username"> & {
  sub?: string;
};

@singleton()
@injectable()
export class JwtManager {
  constructor(private configuration: ServerConfiguration) {}

  sign(user: AuthenticatedUser): string {
    const { username, ...payload } = user;

    return jwt.sign(payload, this.configuration.jwt.secret, {
      expiresIn: this.configuration.jwt.expiresIn,
      audience: this.configuration.jwt.audience,
      issuer: this.configuration.jwt.issuer,
      subject: username,
    });
  }

  /** return configuration for passport strategy, localized here for comparity with sign function above */
  strategyOptions(): StrategyOptions {
    return {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: this.configuration.jwt.secret,
      issuer: this.configuration.jwt.issuer,
      audience: this.configuration.jwt.audience,
    };
  }
}
