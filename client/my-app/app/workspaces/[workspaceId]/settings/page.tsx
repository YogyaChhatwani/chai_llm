"use client";

import { useParams } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { WorkspaceSettings } from "@/components/workspaces/workspace-settings";
import { useWorkspace } from "@/hooks/use-workspaces";

export default function WorkspaceSettingsPage() {
  const params = useParams<{ workspaceId: string }>();
  const workspaceId =
    typeof params.workspaceId === "string" ? params.workspaceId : "";
  const { data: workspace } = useWorkspace(workspaceId);

  if (!workspaceId || !workspace) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <Spinner className="size-6" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <WorkspaceSettings workspace={workspace} />
    </div>
  );
}
