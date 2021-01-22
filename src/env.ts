import { config } from "dotenv";
import { resolve } from "path";

// from dotenv samples:
// https://github.com/motdotla/dotenv/blob/master/examples/typescript/src/lib/env.ts
const file = resolve(__dirname, "../.env");
config({ path: file });

export const PORT = process.env.PORT || 3001;
export const PHOTOS_DIR = process.env.PHOTOS_DIR || "photos";
export const STATIC_ROOT_DIR = process.env.STATIC_ROOT_DIR;
