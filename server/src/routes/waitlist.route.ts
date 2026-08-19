import { Router } from "express";
import { z } from "zod";
import prisma from "../lib/db.js";

const waitlistRouter = Router();

const waitlistSchema = z.object({
  email: z.string().email().max(255).trim().toLowerCase(),
});

waitlistRouter.post("/", async (req, res, next) => {
  try {
    const { email } = waitlistSchema.parse(req.body);

    const existing = await prisma.waitlistEntry.findUnique({
      where: { email },
    });

    if (existing) {
      res.status(200).json({ message: "You're already on the waitlist!" });
      return;
    }

    await prisma.waitlistEntry.create({ data: { email } });

    res.status(201).json({ message: "You're on the waitlist!" });
  } catch (error) {
    next(error);
  }
});

export { waitlistRouter };
