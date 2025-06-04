import { Schema, model } from "mongoose";

/**
 * Holds a single row (when working correctly) that ID's the version of data in this database.
 * Used to allow for rescans of image metadata or other migration, when necessary.
 */
const versionSchema = new Schema({
  version: { type: Number, required: true, unique: true },
});

export const Version = model("schema_version", versionSchema);
