import express from "express";
import { type GetInfo } from "./contract/index.ts";
import backendVersion from "../backend-version.ts";

function routes() {
  return express.Router().get("/", (_, response) => {
    response.send({ version: backendVersion } satisfies GetInfo);
  });
}

export default { routes };
