"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";

export const authKeys = {
  session: ["auth", "session"] as const,
};

export function useSession() {
  return useQuery({
    queryKey: authKeys.session,
    queryFn: async () => {
      const result = await authClient.getSession();

      if (result.error) {
        throw new Error(result.error.message);
      }

      return result.data;
    },
  });
}

export function useGoogleSignIn() {
  return useMutation({
    mutationFn: async () => {
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: `${window.location.origin}/`,
        errorCallbackURL: `${window.location.origin}/login`,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }
    },
  });
}

export function useSignOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const result = await authClient.signOut();

      if (result.error) {
        throw new Error(result.error.message);
      }
    },
    onSuccess: () => {
      queryClient.setQueryData(authKeys.session, null);
    },
  });
}
