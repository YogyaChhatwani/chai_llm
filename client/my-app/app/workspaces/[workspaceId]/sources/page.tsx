"use client";

import { useParams } from "next/navigation";
import { SourceList } from "@/components/sources/source-list";

export default function WorkspaceSourcesPage() {
  const params = useParams<{ workspaceId: string }>();
  const workspaceId =
    typeof params.workspaceId === "string" ? params.workspaceId : "";

  if (!workspaceId) {
    return null;
  }

  return (
    <div className="p-6">
      <SourceList workspaceId={workspaceId} />
    </div>
  );
}
