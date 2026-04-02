import { Request, Response } from "express";
import prisma from "../libs/prisma.lib.js";
import openai from "../configs/openai.config.js";

// Make revision
const makeRevision = async (req: Request, res: Response) => {
  const userId = req.userId;
  try {
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { projectId } = req.params as { projectId: string };
    const { message } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    if (user.credits < 5)
      return res
        .status(403)
        .json({ message: "Add more credits to make changes" });

    if (!message || message.trim() === "")
      return res.status(400).json({ message: "Please enter a valid prompt" });

    const currentProject = await prisma.websiteProject.findUnique({
      where: { id: projectId, userId },
      include: { versions: true },
    });
    if (!currentProject)
      return res.status(404).json({ message: "Project not found" });

    await prisma.conversation.create({
      data: {
        role: "user",
        content: message,
        projectId,
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { credits: { decrement: 5 } },
    });

    // Enhance user prompt
    const promptEnhaceResponse = await openai.chat.completions.create({
      model: "arcee-ai/trinity-large-preview:free",
      messages: [
        {
          role: "system",
          content: `
            You are a prompt enhancement specialist. The user wants to make changes to their website. Enhance their request to be more specific and actionable for a web developer.

            Enhance this by:
            1. Being specific about what elements to change
            2. Mentioning design details (colors, spacing, sizes)
            3. Clarifying the desired outcome
            4. Using clear technical terms

            Return ONLY the enhanced request, nothing else. Keep it concise (1-2 sentences).
          `,
        },
        {
          role: "user",
          content: `User's request: "${message}"`,
        },
      ],
    });

    const enhancedPrompt = promptEnhaceResponse.choices[0].message.content;
    await prisma.conversation.create({
      data: {
        role: "assistant",
        content: `I've enhanced your prompt to: "${enhancedPrompt}"`,
        projectId,
      },
    });
    await prisma.conversation.create({
      data: {
        role: "assistant",
        content: "Now making changes to your website...",
        projectId,
      },
    });

    // Generate website code
    const codeGenerationResponse = await openai.chat.completions.create({
      model: "arcee-ai/trinity-large-preview:free",
      messages: [
        {
          role: "system",
          content: `
            You are an expert web developer. 

            CRITICAL REQUIREMENTS:
            - Return ONLY the complete updated HTML code with the requested changes.
            - Use Tailwind CSS for ALL styling (NO custom CSS).
            - Use Tailwind utility classes for all styling changes.
            - Include all JavaScript in <script> tags before closing </body>
            - Make sure it's a complete, standalone HTML document with Tailwind CSS
            - Return the HTML Code Only, nothing else
            
            Apply the requested changes while maintaining the Tailwind CSS styling approach.
          `,
        },
        {
          role: "user",
          content: `Here is the current website code: "${currentProject.current_code}" The user wants this change: "${enhancedPrompt}"`,
        },
      ],
    });

    const code = codeGenerationResponse.choices[0].message.content || "";
    if (!code) {
      await prisma.conversation.create({
        data: {
          role: "assistant",
          content: "Unable to generate the code, please try again",
          projectId,
        },
      });

      await prisma.user.update({
        where: { id: userId },
        data: { credits: { increment: 5 } },
      });

      return;
    }

    const version = await prisma.version.create({
      data: {
        code: code
          .replace(/```[a-z]*\n?/gi, "")
          .replace(/```$/g, "")
          .trim(),
        description: "changes made",
        projectId,
      },
    });

    await prisma.conversation.create({
      data: {
        role: "assistant",
        content:
          "I've made the changes to your website! You can now preview it",
        projectId,
      },
    });

    await prisma.websiteProject.update({
      where: { id: projectId },
      data: {
        current_code: code
          .replace(/```[a-z]*\n?/gi, "")
          .replace(/```$/g, "")
          .trim(),
        current_version_index: version.id,
      },
    });

    res.status(200).json({ message: "Changes made successfully" });
  } catch (error: any) {
    await prisma.user.update({
      where: { id: userId },
      data: { credits: { increment: 5 } },
    });

    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

// Rollback to specific version
const rollbackToVersion = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { projectId, versionId } = req.params as {
      projectId: string;
      versionId: string;
    };
    const project = await prisma.websiteProject.findUnique({
      where: { id: projectId, userId },
      include: { versions: true },
    });
    if (!project) return res.status(404).json({ message: "Project not found" });

    const version = project.versions.find(
      (version) => version.id === versionId,
    );
    if (!version) return res.status(404).json({ message: "Version not found" });

    await prisma.websiteProject.update({
      where: { id: projectId, userId },
      data: {
        current_code: version.code,
        current_version_index: version.id,
      },
    });

    await prisma.conversation.create({
      data: {
        role: "assistant",
        content:
          "I've rolled back your website to selected version. You can now preview it.",
        projectId,
      },
    });

    res.status(200).json({ message: "Version roll back" });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

// Getting project code for preview
const getProjectPreview = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { projectId } = req.params as { projectId: string };
    const project = await prisma.websiteProject.findFirst({
      where: { id: projectId, userId },
      include: { versions: true },
    });
    if (!project) return res.status(404).json({ message: "Project not found" });

    res.status(200).json({ project });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

// Get published projects
const getPublishedProjects = async (req: Request, res: Response) => {
  try {
    const projects = await prisma.websiteProject.findMany({
      where: { isPublished: true },
      include: { user: true },
    });

    res.status(200).json({ projects });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

// Get a single project by id
const getProjectById = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params as { projectId: string };

    const project = await prisma.websiteProject.findFirst({
      where: { id: projectId },
    });
    if (!project || project.isPublished === false || !project?.current_code)
      return res.status(404).json({ message: "Project not found" });

    res.status(200).json({ code: project.current_code });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

// Save project code
const saveProjectCode = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { projectId } = req.params as { projectId: string };
    const { code } = req.body;
    if (!code) return res.status(400).json({ message: "Code is required" });

    const project = await prisma.websiteProject.findUnique({
      where: { id: projectId, userId },
    });
    if (!project) return res.status(404).json({ message: "Project not found" });

    await prisma.websiteProject.update({
      where: { id: projectId },
      data: { current_code: code, current_version_index: "" },
    });

    res.status(200).json({ message: "Project saved successfully" });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

// Delete a project
const deleteProject = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { projectId } = req.params as { projectId: string };
    await prisma.websiteProject.delete({
      where: { id: projectId, userId },
    });

    res.status(200).json({ message: "Project deleted" });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export {
  makeRevision,
  rollbackToVersion,
  getProjectPreview,
  getPublishedProjects,
  getProjectById,
  saveProjectCode,
  deleteProject,
};
