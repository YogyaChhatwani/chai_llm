"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTextSource,
  deleteSource,
  importWebsite,
  importYoutube,
  listSources,
  uploadPdf,
  type CreateTextSourceInput,
  type ImportUrlInput,
  type ListSourcesQuery,
} from "@/lib/sources";

export const sourceKeys = {
  all: (workspaceId: string) => ["sources", workspaceId] as const,
  list: (workspaceId: string, filters: ListSourcesQuery = {}) =>
    [...sourceKeys.all(workspaceId), "list", filters] as const,
};

export function useSources(
  workspaceId: string,
  filters: ListSourcesQuery = {},
) {
  return useQuery({
    queryKey: sourceKeys.list(workspaceId, filters),
    queryFn: () => listSources(workspaceId, filters),
    enabled: Boolean(workspaceId),
    refetchInterval: (query) => {
      const sources = query.state.data;
      const isBusy = sources?.some(
        (source) =>
          source.status === "PENDING" || source.status === "PROCESSING",
      );

      return isBusy ? 3000 : false;
    },
  });
}

function invalidateSources(
  queryClient: ReturnType<typeof useQueryClient>,
  workspaceId: string,
) {
  return queryClient.invalidateQueries({
    queryKey: sourceKeys.all(workspaceId),
  });
}

export function useCreateTextSource(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTextSourceInput) =>
      createTextSource(workspaceId, input),
    onSuccess: () => invalidateSources(queryClient, workspaceId),
  });
}

export function useImportWebsite(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ImportUrlInput) => importWebsite(workspaceId, input),
    onSuccess: () => invalidateSources(queryClient, workspaceId),
  });
}

export function useImportYoutube(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ImportUrlInput) => importYoutube(workspaceId, input),
    onSuccess: () => invalidateSources(queryClient, workspaceId),
  });
}

export function useUploadPdf(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, title }: { file: File; title?: string }) =>
      uploadPdf(workspaceId, file, title),
    onSuccess: () => invalidateSources(queryClient, workspaceId),
  });
}

export function useDeleteSource(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sourceId: string) => deleteSource(workspaceId, sourceId),
    onSuccess: () => invalidateSources(queryClient, workspaceId),
  });
}
