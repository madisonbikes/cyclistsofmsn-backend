import Router from "koa-router";
import sharp from "sharp";
import { container } from "tsyringe";
import { Image } from "../../database/images.model";
import { FilesystemRepository } from "../../fs_repository";

export const router = new Router({ prefix: "/images" });
router.get("/", async (ctx) => {
  ctx.set("Cache-Control", "max-age=60, s-max-age=3600");
  const images = await Image.find({ deleted: false });
  ctx.body = images.map((doc) => {
    return { id: doc.id, filename: doc.filename };
  });
});

router.get("/:id", async (ctx) => {
  const id = ctx.params.id;
  const filename = (await Image.findById(id).and([{ deleted: false }]))
    ?.filename;
  if (filename === undefined) return;

  const repository = container.resolve(FilesystemRepository);
  const imageFile = repository.photoPath(filename);

  let width = safeParseInt(ctx.query.width);
  const height = safeParseInt(ctx.query.height);
  if (!width && !height) {
    width = 1024;
  }

  const buffer = await sharp(imageFile)
    .resize({ width, height, withoutEnlargement: true })
    .toFormat("jpeg")
    .toBuffer();
  ctx.type = "jpeg";
  ctx.set("Cache-Control", "max-age=3600, s-max-age=36000");
  ctx.body = buffer;
});

function safeParseInt(value: string | string[] | undefined) {
  if (!value) {
    return undefined;
  }
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    return undefined;
  }
  return parsed;
}
