/** exposes a JWT-checking middleware that combines the JWT extraction and parsing along with an optional authorization check */
import jwks from "jwks-rsa";
import jwt_internal from "koa-jwt";
import compose from "koa-compose";
import { jwtAuthz } from "./koa-jwt-authz";
import Koa from "koa";

const secret = jwks.koaJwtSecret({
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 5,
  jwksUri: "https://db122.us.auth0.com/.well-known/jwks.json"
});

// fixme the audience might need to be more flexible in api
const jwt_first = jwt_internal(
  {
    secret: secret,
    audience: "https://cyclists_of_msn/api",
    issuer: "https://db122.us.auth0.com/",
    algorithms: ["RS256"]
  }
);

export function jwt(requiredScopes: string[] = []): Koa.Middleware {
  if (requiredScopes.length == 0) {
    return jwt_first;
  } else {
    return compose([jwt_first, jwtAuthz(requiredScopes)]);
  }
}
