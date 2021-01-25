import axios from "axios";
import server from "./server";

afterAll(() => {
  server.close();
});

test("hit image api", async () => {
  return axios.get("http://localhost:3001/images");
});
