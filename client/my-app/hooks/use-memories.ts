"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createMemory,
  deleteMemory,
  listMemories,
  updateMemory,
} from "@/lib/memories";

export const memoryKeys = {
  all: ["memories"] as const,
};

export function useMemories() {
  return useQuery({
    queryKey: memoryKeys.all,
    queryFn: listMemories,
  });
}

export function useCreateMemory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createMemory,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: memoryKeys.all });
    },
  });
}

export function useUpdateMemory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ memoryId, memory }: { memoryId: string; memory: string }) =>
      updateMemory(memoryId, memory),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: memoryKeys.all });
    },
  });
}

export function useDeleteMemory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMemory,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: memoryKeys.all });
    },
  });
}
