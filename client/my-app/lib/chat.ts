import { apiFetch } from "@/lib/api";

export type Conversation = {
  id: string;
  workspaceId: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ChatMessage = {
  id: string;
  conversationId: string;
  role: "USER" | "ASSISTANT";
  content: string;
  createdAt: string;
};

export function listConversations(workspaceId: string) {
  return apiFetch<Conversation[]>(
    `/api/v1/workspaces/${workspaceId}/conversations`,
  );
}

export function createConversation(workspaceId: string, title?: string) {
  return apiFetch<Conversation>(
    `/api/v1/workspaces/${workspaceId}/conversations`,
    {
      method: "POST",
      body: JSON.stringify(title ? { title } : {}),
    },
  );
}

export function listConversationMessages(
  workspaceId: string,
  conversationId: string,
) {
  return apiFetch<ChatMessage[]>(
    `/api/v1/workspaces/${workspaceId}/conversations/${conversationId}/messages`,
  );
}

export function deleteConversation(
  workspaceId: string,
  conversationId: string,
) {
  return apiFetch<void>(
    `/api/v1/workspaces/${workspaceId}/conversations/${conversationId}`,
    { method: "DELETE" },
  );
}
