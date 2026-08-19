"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createArtifact,
  deleteArtifact,
  getArtifact,
  listArtifacts,
  type CreateArtifactInput,
} from "@/lib/artifacts";

export const artifactKeys = {
  all: (workspaceId: string) => ["artifacts", workspaceId] as const,
  list: (workspaceId: string) =>
    [...artifactKeys.all(workspaceId), "list"] as const,
  detail: (workspaceId: string, artifactId: string) =>
    [...artifactKeys.all(workspaceId), "detail", artifactId] as const,
};

export function useArtifacts(workspaceId: string) {
  return useQuery({
    queryKey: artifactKeys.list(workspaceId),
    queryFn: () => listArtifacts(workspaceId),
    enabled: Boolean(workspaceId),
    refetchInterval: (query) => {
      const isBusy = query.state.data?.some(
        (artifact) =>
          artifact.status === "PENDING" || artifact.status === "PROCESSING",
      );
      return isBusy ? 3000 : false;
    },
  });
}

export function useArtifact(workspaceId: string, artifactId: string | null) {
  return useQuery({
    queryKey: artifactKeys.detail(workspaceId, artifactId ?? "none"),
    queryFn: () => getArtifact(workspaceId, artifactId!),
    enabled: Boolean(workspaceId && artifactId),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "PENDING" || status === "PROCESSING" ? 3000 : false;
    },
  });
}

export function useCreateArtifact(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateArtifactInput) =>
      createArtifact(workspaceId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: artifactKeys.all(workspaceId),
      });
    },
  });
}

export function useDeleteArtifact(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (artifactId: string) =>
      deleteArtifact(workspaceId, artifactId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: artifactKeys.all(workspaceId),
      });
    },
  });
}
