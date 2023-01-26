import express from "express";
import passport from "passport";
import { injectable } from "tsyringe";
import { validateBodySchema, validateAuthenticated } from "../security";
import { loginBodySchema, AuthenticatedUser } from "./contract";

@injectable()
export class SecurityRoutes {
  readonly routes = express
    .Router()
    .post(
      "/login",
      validateBodySchema(loginBodySchema),
      passport.authenticate("local", { session: true, failWithError: false }),
      (request, response) => {
        const user = request.user as AuthenticatedUser;
        response.status(200).send(user);
      }
    )
    .post("/logout", (request, response, next) => {
      if (request.user == null) {
        response.status(400).send("not logged in");
      } else {
        request.logout((err) => {
          if (err) {
            return next(err);
          } else {
            response.status(200).send("logged out");
          }
        });
      }
    })
    .get("/sessioninfo", validateAuthenticated, (request, response) => {
      response.status(200).send(request.user);
    });
}
