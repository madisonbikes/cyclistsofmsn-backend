import { type TestRequest } from "./request.js";

export const loginTestUser = (request: TestRequest) => {
  return request
    .post("/api/v1/session/login")
    .send({ username: "testuser", password: "password" })
    .expect(200);
};

export const loginTestAdminUser = (request: TestRequest) => {
  return request
    .post("/api/v1/session/login")
    .send({ username: "testadmin", password: "password" })
    .expect(200);
};

export const loginTestEditorUser = (request: TestRequest) => {
  return request
    .post("/api/v1/session/login")
    .send({ username: "testeditor", password: "password" })
    .expect(200);
};
