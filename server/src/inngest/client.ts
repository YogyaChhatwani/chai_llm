import { Inngest } from "inngest";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "chaibook" });

export type SourceCreatedEvent = {
    type: "source/created";
    data: {
        sourceId: string;
        workspaceId: string;
    };
};

export type inngestEvents = SourceCreatedEvent;