import { database } from "./database";
import { startupServer } from "./server";

function handleError(e: unknown) {
  console.log(e);
}

database.connect()
  .then(startupServer)
  .catch(handleError);
