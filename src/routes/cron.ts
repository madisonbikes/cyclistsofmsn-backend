import express from "express";
import { dispatchPostOnSchedule } from "../posts/dispatcher";
import { populatePostsOnSchedule } from "../posts/populate";
import { ExpressMiddleware } from "../security";
import { logger } from "../utils";
import { configuration } from "../config";

function routes() {
  return (
    express
      .Router()
      // */5 * * * * curl -X POST http://localhost:3000/api/v1/cron/dispatchPost -H "Authorization: Bearer $CRON_AUTHORIZATION_API_KEY"
      .post(
        "/dispatchPost",
        validateCronAuthorization(),
        async (_, response) => {
          await dispatchPostOnSchedule();
          response.sendStatus(204);
        },
      )
      // 5 */6 * * * curl -X POST http://localhost:3000/api/v1/cron/populatePosts -H "Authorization: Bearer $CRON_AUTHORIZATION_API_KEY"
      .post(
        "/populatePosts",
        validateCronAuthorization(),
        async (_, response) => {
          await populatePostsOnSchedule();
          response.sendStatus(204);
        },
      )
  );
}

// This function is used to extract the Bearer token from the Authorization header
function extractBearerAuthorizationToken(request: express.Request) {
  const authHeader = request.get("Authorization");
  if (authHeader !== undefined) {
    if (authHeader.startsWith("Bearer ")) {
      return authHeader.substring(7, authHeader.length).trimEnd();
    }
  }
  return "";
}

// This function is used to validate the cron authorization
function validateCronAuthorization(): ExpressMiddleware {
  return (request, response, next) => {
    logger.trace(request.user, `validating cron authorization`);
    if (
      extractBearerAuthorizationToken(request) !==
      configuration.cronAuthorizationApiKey
    ) {
      response.sendStatus(401);
    } else {
      next();
    }
  };
}
export default { routes };
