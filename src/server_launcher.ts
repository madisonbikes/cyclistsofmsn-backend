import { startServer } from "./server";

/** launches server. this syntax allows server startup to run as async function */
Promise.resolve()
  .then(() => {
    return startServer();
  })
  .catch((error) => {
    console.error(error);
  });
