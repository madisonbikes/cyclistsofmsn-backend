import Router from "koa-router";
import sharp from "sharp";
import { Image } from "../../database/images.model";
import { repository } from "../../fs_repository";

export const router = new Router({ prefix: "/images"});
router.get("/", async (ctx) => {
  ctx.set("Cache-Control", "max-age=60, s-max-age=3600");
  const images = await Image.find({ deleted: false });
  ctx.body = images.map(doc => {
    return { id: doc.id, filename: doc.filename };
  });
});

router.get("/:id", async (ctx) => {
  const filename = (await
      Image.findById(ctx.params.id)
        .and([{ deleted: false }])
  )
    ?.filename;
  if (filename === undefined) return;

  const imageFile = repository().photoPath(filename);

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

function safeParseInt(value?: string): number | undefined {
  if (value === undefined) {
    return undefined;
  }
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    return undefined;
  }
  return parsed;
}
