import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./db.js";
import { getClientOrigins } from "./client-origins.js";

const clientOrigins = getClientOrigins();
const authBaseURL = process.env.BETTER_AUTH_URL;
const isHttpsAuth = authBaseURL?.startsWith("https://") ?? false;

export const auth = betterAuth({
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: authBaseURL,
    trustedOrigins: clientOrigins,
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
    },
    // Frontend (Vercel) and API (Railway) are different sites — cookies must
    // be SameSite=None or the browser won't send the session on API calls.
    ...(isHttpsAuth
        ? {
              advanced: {
                  defaultCookieAttributes: {
                      sameSite: "none" as const,
                      secure: true,
                  },
              },
          }
        : {}),
});
