import jwks from "jwks-rsa";
import jwt_internal from "koa-jwt";
import compose from 'koa-compose'
import { jwtAuthz } from "./koa-jwt-authz";

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

export const jwt = compose([jwt_first, jwtAuthz(["create:post"])]);
