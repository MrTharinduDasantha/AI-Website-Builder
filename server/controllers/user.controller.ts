import { Request, Response } from "express";
import prisma from "../libs/prisma.lib.js";
import openai from "../configs/openai.config.js";
import Stripe from "stripe";

// Get user credits
const getUserCredits = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    res.status(200).json({ credits: user?.credits });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

// Create new project
const createUserProject = async (req: Request, res: Response) => {
  const userId = req.userId;

  try {
    const { initial_prompt } = req.body;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (user && user.credits < 5)
      return res
        .status(403)
        .json({ message: "Add credits to create more projects" });

    // Create a new project
    const project = await prisma.websiteProject.create({
      data: {
        name:
          initial_prompt.length > 50
            ? initial_prompt.substring(0, 47) + "..."
            : initial_prompt,
        initial_prompt,
        userId,
      },
    });

    // Update user's total creation
    await prisma.user.update({
      where: { id: userId },
      data: { totalCreation: { increment: 1 } },
    });

    await prisma.conversation.create({
      data: {
        role: "user",
        content: initial_prompt,
        projectId: project.id,
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { credits: { decrement: 5 } },
    });

    res.status(200).json({ projectId: project.id });

    // Enhance user prompt
    const promptEnhanceResponse = await openai.chat.completions.create({
      model: "arcee-ai/trinity-large-preview:free",
      messages: [
        {
          role: "system",
          content: `
            You are a prompt enhancement specialist. Take the user's website request and expand it into a detailed, comprehensive prompt that will help create the best possible website.

            Enhance this prompt by:
            1. Adding specific design details (layout, color scheme, typography)
            2. Specifying key sections and features
            3. Describing the user experience and interactions
            4. Including modern web design best practices
            5. Mentioning responsive design requirements
            6. Adding any missing but important elements

            Return ONLY the enhanced prompt, nothing else. Make it detailed but concise (2-3 paragraphs max).
          `,
        },
        {
          role: "user",
          content: initial_prompt,
        },
      ],
    });

    const enhancedPrompt = promptEnhanceResponse.choices[0].message.content;
    await prisma.conversation.create({
      data: {
        role: "assistant",
        content: `I've enhanced your prompt to: "${enhancedPrompt}"`,
        projectId: project.id,
      },
    });

    await prisma.conversation.create({
      data: {
        role: "assistant",
        content: "now generating your website...",
        projectId: project.id,
      },
    });

    // Generate website code
    const codeGenerationResponse = await openai.chat.completions.create({
      model: "arcee-ai/trinity-large-preview:free",
      messages: [
        {
          role: "system",
          content: `
            You are an expert web developer. Create a complete, production-ready, single-page website based on this request: "${enhancedPrompt}"

            CRITICAL REQUIREMENTS:
            - You MUST output valid HTML ONLY. 
            - Use Tailwind CSS for ALL styling
            - Include this EXACT script in the <head>: <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
            - Use Tailwind utility classes extensively for styling, animations, and responsiveness
            - Make it fully functional and interactive with JavaScript in <script> tag before closing </body>
            - Use modern, beautiful design with great UX using Tailwind classes
            - Make it responsive using Tailwind responsive classes (sm:, md:, lg:, xl:)
            - Use Tailwind animations and transitions (animate-*, transition-*)
            - Include all necessary meta tags
            - Use Google Fonts CDN if needed for custom fonts
            - Use placeholder images from https://placehold.co/600x400
            - Use Tailwind gradient classes for beautiful backgrounds
            - Make sure all buttons, cards, and components use Tailwind styling

            CRITICAL HARD RULES:
            1. You MUST put ALL output ONLY into message.content.
            2. You MUST NOT place anything in "reasoning", "analysis", "reasoning_details", or any hidden fields.
            3. You MUST NOT include internal thoughts, explanations, analysis, comments, or markdown.
            4. Do NOT include markdown, explanations, notes, or code fences.

            The HTML should be complete and ready to render as-is with Tailwind CSS.
          `,
        },
        {
          role: "user",
          content: enhancedPrompt || "",
        },
      ],
    });

    const code = codeGenerationResponse.choices[0].message.content || "";
    if (!code) {
      await prisma.conversation.create({
        data: {
          role: "assistant",
          content: "Unable to generate the code, please try again",
          projectId: project.id,
        },
      });

      await prisma.user.update({
        where: { id: userId },
        data: { credits: { increment: 5 } },
      });

      return;
    }

    // Create version for the project
    const version = await prisma.version.create({
      data: {
        code: code
          .replace(/```[a-z]*\n?/gi, "")
          .replace(/```$/g, "")
          .trim(),
        description: "Initial version",
        projectId: project.id,
      },
    });

    await prisma.conversation.create({
      data: {
        role: "assistant",
        content:
          "I've created your website! You can now preview it and request any changes.",
        projectId: project.id,
      },
    });

    await prisma.websiteProject.update({
      where: { id: project.id },
      data: {
        current_code: code
          .replace(/```[a-z]*\n?/gi, "")
          .replace(/```$/g, "")
          .trim(),
        current_version_index: version.id,
      },
    });
  } catch (error: any) {
    await prisma.user.update({
      where: { id: userId },
      data: { credits: { increment: 5 } },
    });

    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

// Get a single user project
const getUserProject = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { projectId } = req.params as { projectId: string };
    const project = await prisma.websiteProject.findUnique({
      where: { id: projectId, userId },
      include: {
        conversation: {
          orderBy: { timestamp: "asc" },
        },
        versions: { orderBy: { timestamp: "asc" } },
      },
    });

    res.status(200).json({ project });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

// Get all users project
const getUserProjects = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const projects = await prisma.websiteProject.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });

    res.status(200).json({ projects });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

// Toggle project publish
const togglePublish = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { projectId } = req.params as { projectId: string };
    const project = await prisma.websiteProject.findUnique({
      where: { id: projectId, userId },
    });
    if (!project) return res.status(404).json({ message: "Project not found" });

    await prisma.websiteProject.update({
      where: { id: projectId },
      data: { isPublished: !project.isPublished },
    });

    res.status(200).json({
      message: project.isPublished
        ? "Project unpublished"
        : "Project published",
    });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

// Purchase credits
const purchaseCredits = async (req: Request, res: Response) => {
  try {
    interface Plan {
      credits: number;
      amount: number;
    }

    const plans = {
      basic: { credits: 100, amount: 5 },
      pro: { credits: 400, amount: 19 },
      enterprise: { credits: 1000, amount: 49 },
    };

    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { planId } = req.body as { planId: keyof typeof plans };
    const origin = req.headers.origin as string;

    const plan: Plan = plans[planId];
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    const transaction = await prisma.transaction.create({
      data: {
        userId: userId!,
        planId: req.body.planId,
        amount: plan.amount,
        credits: plan.credits,
      },
    });

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

    const session = await stripe.checkout.sessions.create({
      success_url: `${origin}/loading`,
      cancel_url: `${origin}`,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `AI Website Builder - ${plan.credits} credits`,
            },
            unit_amount: Math.floor(transaction.amount) * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      metadata: {
        transactionId: transaction.id,
        appId: "ai-website-builder",
      },
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // Expires in 30 minutes
    });

    res.status(200).json({ payment_link: session.url });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export {
  getUserCredits,
  createUserProject,
  getUserProject,
  getUserProjects,
  togglePublish,
  purchaseCredits,
};
