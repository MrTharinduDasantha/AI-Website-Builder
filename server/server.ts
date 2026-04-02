import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import auth from "./libs/auth.lib.js";
import userRouter from "./routes/user.route.js";
import projectRouter from "./routes/project.route.js";

const app = express();
const port = 3000;
const corsOptions = {
  origin: process.env.TRUSTED_ORIGINS?.split(",") || [],
  credentials: true,
};

app.use(cors(corsOptions));

app.all("/api/auth/{*any}", toNodeHandler(auth));

app.use(express.json({ limit: "50mb" }));

app.get("/", (req: Request, res: Response) => {
  res.send("Server is running!");
});
app.use("/api/user", userRouter);
app.use("/api/project", projectRouter);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
