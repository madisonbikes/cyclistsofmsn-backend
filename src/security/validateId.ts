import { isValidObjectId } from "../database/database.js";
import { type ExpressMiddleware } from "./authentication.js";

export const validateId = (): ExpressMiddleware => {
  return (request, response, next) => {
    const id = request.params.id;
    if (!isValidObjectId(id)) {
      // bad object id throws exception later, so check early
      return response.sendStatus(404);
    } else {
      next();
    }
  };
};
