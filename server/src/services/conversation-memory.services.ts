import { openai } from "@ai-sdk/openai";
import { findConversationById, updateConversationSummary } from "../repository/conversation.repository.js";
import { findMessagesByConversationId } from "../repository/message.repository.js";
import { NotFoundError } from "../types/app-error.js";
import { CHAT_MODEL } from "../lib/ai-config.js";
import { generateText } from "ai";
import { addMemoriesFromMessages } from "../lib/mem0.js";

export async function summarizeConversationById(
    conversationId: string,
    userId: string,
) {
    const conversation = await findConversationById(conversationId);

    if (!conversation) {
        throw new NotFoundError("Conversation not found");
    }

    const messages = await findMessagesByConversationId(conversationId);

    if (messages.length === 0) {
        return conversation;
    }

    const transcript = messages
        .map((message) => `${message.role}: ${message.content}`)
        .join("\n\n");
    const previousSummary = conversation.summary?.trim();

    const { text: summary } = await generateText({
        model: openai(CHAT_MODEL),
        system: [
            "You summarize chat conversations for a learning assistant.",
            "Produce a concise rolling summary covering topics discussed, questions asked,",
            "key insights, and unresolved threads.",
            "Write in third person about the user. Keep it under 250 words.",
        ].join("\n"),
        prompt: [
            previousSummary
                ? `Previous summary:\n${previousSummary}\n`
                : null,
            "Full conversation transcript:",
            transcript,
            "",
            "Write an updated summary that incorporates new messages.",
        ]
            .filter(Boolean)
            .join("\n"),
    });

    const updated = await updateConversationSummary(conversationId, {
        summary: summary.trim(),
        summaryMessageCount: messages.length,
    });

    const recentMessages = messages.slice(-16).map((message) => ({
        role: message.role.toLowerCase() as "user" | "assistant",
        content: message.content,
    }));

    await addMemoriesFromMessages(userId, recentMessages, {
        source: "learned",
        conversationId,
    });

    return updated;


}