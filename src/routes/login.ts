import express from "express";
import passport from "passport";
import { injectable } from "tsyringe";
import { AuthenticatedUser } from "../security/authentication";
import { validateBodySchema } from "../security/validateSchema";
import { loginSchema } from "./types";

@injectable()
export class LoginRoutes {
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
    );
}
