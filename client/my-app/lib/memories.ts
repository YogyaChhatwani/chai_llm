import { apiFetch } from "@/lib/api";

export type Memory = {
  id: string;
  memory: string;
  createdAt: string;
  updatedAt: string;
  source: "manual" | "learned";
  categories?: string[];
};

export function listMemories() {
  return apiFetch<Memory[]>("/api/v1/memory");
}

export function createMemory(memory: string) {
  return apiFetch<Memory>("/api/v1/memory", {
    method: "POST",
    body: JSON.stringify({ memory }),
  });
}

export function updateMemory(memoryId: string, memory: string) {
  return apiFetch<Memory>(`/api/v1/memory/${memoryId}`, {
    method: "PATCH",
    body: JSON.stringify({ memory }),
  });
}

export function deleteMemory(memoryId: string) {
  return apiFetch<void>(`/api/v1/memory/${memoryId}`, {
    method: "DELETE",
  });
}
