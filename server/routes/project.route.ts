import express from "express";
import protect from "../middlewares/auth.middleware.js";
import {
  makeRevision,
  rollbackToVersion,
  getProjectPreview,
  getPublishedProjects,
  getProjectById,
  saveProjectCode,
  deleteProject,
} from "../controllers/project.controller.js";

const projectRouter = express.Router();

projectRouter.post("/revision/:projectId", protect, makeRevision);
projectRouter.get(
  "/rollback/:projectId/:versionId",
  protect,
  rollbackToVersion,
);
projectRouter.get("/preview/:projectId", protect, getProjectPreview);
projectRouter.get("/published", getPublishedProjects);
projectRouter.get("/published/:projectId", getProjectById);
projectRouter.put("/save/:projectId", protect, saveProjectCode);
projectRouter.delete("/:projectId", protect, deleteProject);

export default projectRouter;
