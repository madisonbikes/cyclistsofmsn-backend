import express from "express";
import passport from "passport";
import { injectable } from "tsyringe";
import { validateBodySchema, validateAuthenticated } from "../security";
import { loginBodySchema, AuthenticatedUser } from "./contract";

@injectable()
export class SessionRouter {
  readonly routes = express
    .Router()
    .post(
      "/login",
      validateBodySchema({ schema: loginBodySchema }),
      passport.authenticate("local", { session: true, failWithError: false }),
      (request, response) => {
        const user = request.user as AuthenticatedUser;
        response.send(user);
      }
    )
    .post("/logout", (request, response, next) => {
      if (request.user == null) {
        response.status(400).send("not logged in");
      } else {
        request.logout((err) => {
          if (err !== undefined) {
            return next(err);
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
