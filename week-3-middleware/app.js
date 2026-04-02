import express from "express";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { fileURLToPath } from "url";
import dogsRouter from "./routes/dogs.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();



app.use("/", dogsRouter); // Do not remove this line


if (!process.env.VITEST) {
  app.listen(3000, () => console.log("Server listening on port 3000"));
}

export default app;

