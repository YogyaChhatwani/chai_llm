"use client";

import { useParams } from "next/navigation";
import { LearnHub } from "@/components/learn/learn-hub";

export default function WorkspaceLearnPage() {
  const params = useParams<{ workspaceId: string }>();
  const workspaceId =
    typeof params.workspaceId === "string" ? params.workspaceId : "";

  if (!workspaceId) {
    return null;
  }

  return (
    <div className="p-6">
      <LearnHub workspaceId={workspaceId} />
    </div>
  );
}
