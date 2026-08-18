"use client";

import { createAuthClient } from "better-auth/react";
import { API_URL } from "@/lib/api";

export const authClient = createAuthClient({
  baseURL: API_URL,
  fetchOptions: {
    credentials: "include",
  },
});

export type Session = typeof authClient.$Infer.Session;
