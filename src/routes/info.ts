import express from "express";
import { type GetInfo } from "./contract";
import backendVersion from "../backend-version";

function routes() {
  return express.Router().get("/", (_, response) => {
    response.send({ version: backendVersion } satisfies GetInfo);
  });
}

export default { routes };
