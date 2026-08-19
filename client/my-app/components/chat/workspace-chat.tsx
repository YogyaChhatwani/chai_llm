"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { Bot } from "lucide-react";
import { ChatComposer } from "@/components/chat/chat-composer";
import { Button } from "@/components/ui/button";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Message, MessageContent } from "@/components/ui/message";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Spinner } from "@/components/ui/spinner";
import {
  chatKeys,
  useConversationMessages,
  useConversations,
  useDeleteConversation,
} from "@/hooks/use-conversations";
import { API_URL } from "@/lib/api";
import type { ChatMessage } from "@/lib/chat";

function toUIMessages(messages: ChatMessage[]): UIMessage[] {
  return messages.map((message) => ({
    id: message.id,
    role: message.role === "USER" ? "user" : "assistant",
    parts: [{ type: "text", text: message.content }],
  }));
}

function getMessageText(message: UIMessage) {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
}

export function WorkspaceChat({ workspaceId }: { workspaceId: string }) {
  const queryClient = useQueryClient();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const conversationIdRef = useRef<string | null>(null);
  conversationIdRef.current = conversationId;

  const { data: conversations, isPending: conversationsPending } =
    useConversations(workspaceId);
  const { data: storedMessages } = useConversationMessages(
    workspaceId,
    conversationId,
  );
  const remove = useDeleteConversation(workspaceId);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: `${API_URL}/api/v1/workspaces/${workspaceId}/chat`,
        credentials: "include",
        body: () =>
          conversationIdRef.current
            ? { conversationId: conversationIdRef.current }
            : {},
        fetch: async (input, init) => {
          const response = await fetch(input, {
            ...init,
            credentials: "include",
          });
          const nextId = response.headers.get("X-Conversation-Id");

          if (nextId && nextId !== conversationIdRef.current) {
            conversationIdRef.current = nextId;
            setConversationId(nextId);
            void queryClient.invalidateQueries({
              queryKey: chatKeys(workspaceId).conversations(),
            });
          }

          return response;
        },
      }),
    [queryClient, workspaceId],
  );

  const { messages, sendMessage, setMessages, status, error } = useChat({
    transport,
    onFinish: () => {
      const id = conversationIdRef.current;
      if (!id) {
        return;
      }

      void queryClient.invalidateQueries({
        queryKey: chatKeys(workspaceId).messages(id),
      });
      void queryClient.invalidateQueries({
        queryKey: chatKeys(workspaceId).conversations(),
      });
    },
  });

  const isStreaming = status === "streaming" || status === "submitted";

  useEffect(() => {
    if (!conversationId || !storedMessages || isStreaming) {
      return;
    }

    setMessages(toUIMessages(storedMessages));
  }, [conversationId, isStreaming, setMessages, storedMessages]);

  function startNewChat() {
    conversationIdRef.current = null;
    setConversationId(null);
    setMessages([]);
  }

  async function handleDelete() {
    if (!conversationId) {
      return;
    }

    await remove.mutateAsync(conversationId);
    startNewChat();
  }

  if (conversationsPending) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner className="size-6" />
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <NativeSelect
          className="min-w-48 flex-1"
          value={conversationId ?? "new"}
          onChange={(event) => {
            const value = event.target.value;
            if (value === "new") {
              startNewChat();
              return;
            }
            setConversationId(value);
          }}
        >
          <NativeSelectOption value="new">New chat</NativeSelectOption>
          {conversations?.map((conversation) => (
            <NativeSelectOption key={conversation.id} value={conversation.id}>
              {conversation.title ?? "Untitled chat"}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        <Button type="button" variant="outline" onClick={startNewChat}>
          New
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={!conversationId || remove.isPending}
          onClick={() => void handleDelete()}
        >
          {remove.isPending ? <Spinner /> : "Delete"}
        </Button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto rounded-2xl border p-4">
        {messages.length === 0 ? (
          <Empty className="flex-1">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Bot />
              </EmptyMedia>
              <EmptyTitle>Chat with your sources</EmptyTitle>
              <EmptyDescription>
                Ask a question. Answers use processed sources in this workspace.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="flex flex-col gap-4">
            {messages.map((message) => {
              const isUser = message.role === "user";

              return (
                <Message key={message.id} align={isUser ? "end" : "start"}>
                  <MessageContent>
                    <Bubble variant={isUser ? "default" : "muted"}>
                      <BubbleContent className="whitespace-pre-wrap">
                        {getMessageText(message)}
                      </BubbleContent>
                    </Bubble>
                  </MessageContent>
                </Message>
              );
            })}
          </div>
        )}
      </div>

      {error ? (
        <p className="text-sm text-destructive">{error.message}</p>
      ) : null}

      <ChatComposer
        disabled={isStreaming}
        onSend={(text) => {
          void sendMessage({ text });
        }}
      />
    </div>
  );
}
