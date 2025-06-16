import express, { type RequestHandler } from "express";
import passport from "passport";
import {
  validateBodySchema,
  validateAuthenticated,
} from "../security/index.ts";
import { loginBodySchema, type AuthenticatedUser } from "./contract/index.ts";

function routes() {
  return express
    .Router()
    .post(
      "/login",
      validateBodySchema({ schema: loginBodySchema }),
      passport.authenticate("local", {
        session: true,
        failWithError: false,
      }) as unknown as RequestHandler,
      (request, response) => {
        const user = request.user as AuthenticatedUser;
        response.send(user);
      },
    )
    .post("/logout", (request, response, next) => {
      if (request.user == null) {
        response.status(400).send("not logged in");
      } else {
        request.logout((err) => {
          if (err !== undefined) {
            next(err);
          } else {
            response.send("logged out");
          }
        });
      }
    })
    .get("/info", validateAuthenticated(), (request, response) => {
      response.send(request.user);
    });
}

export default { routes };
