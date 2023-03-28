import { ObjectId } from "mongodb";

export const bufferToStringId = (buffer: Buffer) => {
  return new ObjectId(buffer).toString();
};
