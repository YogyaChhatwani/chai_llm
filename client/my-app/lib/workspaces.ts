import { apiFetch } from "@/lib/api";

export const CHAT_MODELS = ["gpt-4o-mini", "gpt-4o"] as const;

export type ChatModel = (typeof CHAT_MODELS)[number];

export type Workspace = {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  defaultModel: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateWorkspaceInput = {
  title: string;
  description?: string;
  icon?: string;
  defaultModel?: ChatModel;
};

export type UpdateWorkspaceInput = Partial<CreateWorkspaceInput>;

export function listWorkspaces() {
  return apiFetch<Workspace[]>("/api/v1/workspaces");
}

export function createWorkspace(input: CreateWorkspaceInput) {
  return apiFetch<Workspace>("/api/v1/workspaces", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateWorkspace(id: string, input: UpdateWorkspaceInput) {
  return apiFetch<Workspace>(`/api/v1/workspaces/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteWorkspace(id: string) {
  return apiFetch<void>(`/api/v1/workspaces/${id}`, {
    method: "DELETE",
  });
}

export function isChatModel(value: string): value is ChatModel {
  return CHAT_MODELS.includes(value as ChatModel);
}
