import express from "express";
import { type GetInfo } from "./contract/index.js";
import backendVersion from "../backend-version.js";

function routes() {
  return express.Router().get("/", (_, response) => {
    response.send({ version: backendVersion } satisfies GetInfo);
  });
}

export default { routes };
