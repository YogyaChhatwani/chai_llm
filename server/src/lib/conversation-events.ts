import { inngest } from "../inngest/client.js";
/**
 * Enqueues a conversation summary job to be processed by the conversation summary worker.
 * @param input - The input object containing the conversation ID and user ID.
 */
export function enqueueConversationSummarize(input: {conversationId: string,userId: string}) {
    inngest.send({
        name: "conversation/summarize",
        data: input
    });
}