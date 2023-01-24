import express from "express";
import passport from "passport";
import { injectable } from "tsyringe";
import { AuthenticatedUser, validateBodySchema } from "../security";
import { loginSchema } from "./types";

@injectable()
export class SecurityRoutes {
  readonly routes = express
    .Router()
    .post(
      "/login",
      validateBodySchema(loginSchema),
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
    .get("/sessioninfo", (request, response) => {
      response.status(200).send(request.user);
    });
}
