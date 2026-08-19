import { apiFetch } from "@/lib/api";

export type Conversation = {
  id: string;
  workspaceId: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ChatCitation = {
  sourceId?: string;
  sourceTitle?: string;
  sourceType?: string;
  url?: string;
  excerpt?: string;
};

export type ChatMessage = {
  id: string;
  conversationId: string;
  role: "USER" | "ASSISTANT";
  content: string;
  citations?: unknown;
  createdAt: string;
};

export function parseCitations(value: unknown): ChatCitation[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (!item || typeof item !== "object") {
      return [];
    }

    const citation = item as Record<string, unknown>;

    return [
      {
        sourceId:
          typeof citation.sourceId === "string" ? citation.sourceId : undefined,
        sourceTitle:
          typeof citation.sourceTitle === "string"
            ? citation.sourceTitle
            : undefined,
        sourceType:
          typeof citation.sourceType === "string"
            ? citation.sourceType
            : undefined,
        url: typeof citation.url === "string" ? citation.url : undefined,
        excerpt:
          typeof citation.excerpt === "string" ? citation.excerpt : undefined,
      },
    ];
  });
}

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
