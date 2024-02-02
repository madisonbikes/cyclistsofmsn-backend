import supertest from "supertest";
import { runningPhotoServer, Server } from ".";
import TestAgent from "supertest/lib/agent";
export { Server } from "http";

/** helper type alias for supertest request object */
export type TestRequest = TestAgent;

/** helper function to build a supertest test request from a server object */
export const testRequest = (server?: Server) => {
  const s = server ?? runningPhotoServer;
  return supertest.agent(s);
};
