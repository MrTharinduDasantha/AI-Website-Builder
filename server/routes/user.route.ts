import express from "express";
import protect from "../middlewares/auth.middleware.js";
import {
  getUserCredits,
  createUserProject,
  getUserProject,
  getUserProjects,
  togglePublish,
  purchaseCredits,
} from "../controllers/user.controller.js";

const userRouter = express.Router();

userRouter.get("/credits", protect, getUserCredits);
userRouter.post("/project", protect, createUserProject);
userRouter.get("/project/:projectId", protect, getUserProject);
userRouter.get("/projects", protect, getUserProjects);
userRouter.get("/publish-toggle/:projectId", protect, togglePublish);
userRouter.post("/purchase-credits", protect, purchaseCredits);

export default userRouter;
