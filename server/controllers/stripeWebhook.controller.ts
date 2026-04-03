import { Request, Response } from "express";
import Stripe from "stripe";
import prisma from "../libs/prisma.lib.js";

const stripeWebhook = async (req: Request, res: Response) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

  const signature = req.headers["stripe-signature"] as string;
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, signature, endpointSecret);
  } catch (error: any) {
    console.error("⚠️ Webhook signature verification failed: " + error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  // Handle the checkout.session.completed event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { transactionId, appId } = session.metadata as {
      transactionId: string;
      appId: string;
    };

    if (appId === "ai-website-builder" && transactionId) {
      try {
        // Update the transaction to paid
        const transaction = await prisma.transaction.update({
          where: { id: transactionId },
          data: { isPaid: true },
        });

        // Add credits to the user
        await prisma.user.update({
          where: { id: transaction.userId },
          data: {
            credits: {
              increment: transaction.credits,
            },
          },
        });

        console.log(
          `✅ Success: Updated credits for user ${transaction.userId}`,
        );
      } catch (dbError) {
        console.error("❌ Database update failed:", dbError);
        return res
          .status(500)
          .json({ message: "Internal server error updating records" });
      }
    }
  }

  res.status(200).json({ received: true });
};

export default stripeWebhook;
