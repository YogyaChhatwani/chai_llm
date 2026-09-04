"use client";

import { createAuthClient } from "better-auth/react";

/** Same-origin auth — proxied to the API via Next.js rewrites. */
export const authClient = createAuthClient({
  fetchOptions: {
    credentials: "include",
  },
});

export type Session = typeof authClient.$Infer.Session;
