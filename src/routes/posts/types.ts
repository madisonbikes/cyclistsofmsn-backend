import { DbPopulatedPostHistory } from "../../database/types";
import { Post, postSchema } from "../contract";

function mapPostSchema(p: DbPopulatedPostHistory): Post {
  let post: Post;
  if (p.populatedImage != null && typeof p.populatedImage === "object") {
    const { _id: id, status } = p;
    const idAsString = id.toString();
    post = {
      id: idAsString,
      timestamp: p.timestamp,
      imageid: p.populatedImage._id.toString(),
      status: {
        flag: status.flag,
        error: status.error ?? undefined,
        uri: status.uri ?? undefined,
      },
    };
  } else {
    const { _id: id, status } = p;
    const idAsString = id.toString();
    post = {
      id: idAsString,
      timestamp: p.timestamp,
      imageid: undefined,
      status: {
        flag: status.flag,
        error: status.error ?? undefined,
        uri: status.uri ?? undefined,
      },
    };
  }
  return postSchema.parse(post);
}

export { mapPostSchema };
