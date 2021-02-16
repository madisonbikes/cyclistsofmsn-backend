import { configuration } from "../config";
import { database } from "../database";
import path from "path";
import axios from "axios";

configuration.photosDir = path.resolve(__dirname, "../../test_resources");
// eslint-disable-next-line
configuration.mongodbUri = process.env.MONGO_URL!;

axios.defaults.baseURL = `http://localhost:${configuration.serverPort}`;