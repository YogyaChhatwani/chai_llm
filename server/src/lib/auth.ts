import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./db.js";
import { getClientOrigins } from "./client-origins.js";

const clientOrigins = getClientOrigins();

/**
 * Public URL of the *frontend* (where the browser hits `/api/auth`).
 * Next.js rewrites proxy those requests to this Express server.
 * Google redirect URI becomes: {BETTER_AUTH_URL}/api/auth/callback/google
 */
export const auth = betterAuth({
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL,
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
});
