import { database } from "./database";
import { server } from "./server";

database.connect()
  .then(() => {
    server.start()
  })
  .catch((error) => {
    console.log(error);
  });
