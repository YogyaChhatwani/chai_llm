"use client";

import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  Globe,
  Loader2,
  Plus,
  Video,
} from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
} from "@/components/ui/sidebar";
import { useSources } from "@/hooks/use-sources";
import type { SourceStatus, SourceType } from "@/lib/sources";

function SourceIcon({ type }: { type: SourceType }) {
  if (type === "YOUTUBE") {
    return <Video />;
  }
  if (type === "WEBSITE") {
    return <Globe />;
  }
  return <FileText />;
}

function StatusIcon({ status }: { status: SourceStatus }) {
  switch (status) {
    case "COMPLETED":
      return <CheckCircle2 className="size-3.5 text-green-500" />;
    case "PROCESSING":
      return <Loader2 className="size-3.5 animate-spin text-blue-500" />;
    case "PENDING":
      return <Clock className="size-3.5 text-muted-foreground" />;
    case "FAILED":
      return <AlertCircle className="size-3.5 text-destructive" />;
  }
}

type SourceSidebarListProps = {
  workspaceId: string;
  onAddSource: () => void;
};

export function SourceSidebarList({
  workspaceId,
  onAddSource,
}: SourceSidebarListProps) {
  const { data: sources, isPending } = useSources(workspaceId);
  const sourcesPath = `/workspaces/${workspaceId}/sources`;

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Sources</SidebarGroupLabel>
      <SidebarGroupAction title="Add source" onClick={onAddSource}>
        <Plus />
        <span className="sr-only">Add source</span>
      </SidebarGroupAction>
      <SidebarGroupContent>
        {isPending ? (
          <SidebarMenu>
            {Array.from({ length: 3 }).map((_, index) => (
              <SidebarMenuItem key={index}>
                <SidebarMenuSkeleton />
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        ) : sources && sources.length > 0 ? (
          <SidebarMenu>
            {sources.slice(0, 8).map((source) => (
              <SidebarMenuItem key={source.id}>
                <SidebarMenuButton
                  tooltip={source.title ?? "Untitled source"}
                  render={<Link href={sourcesPath} />}
                >
                  <SourceIcon type={source.type} />
                  <span>{source.title ?? "Untitled source"}</span>
                </SidebarMenuButton>
                <SidebarMenuBadge>
                  <StatusIcon status={source.status} />
                </SidebarMenuBadge>
              </SidebarMenuItem>
            ))}
            {sources.length > 8 ? (
              <SidebarMenuItem>
                <SidebarMenuButton render={<Link href={sourcesPath} />}>
                  <span>View all ({sources.length})</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ) : null}
          </SidebarMenu>
        ) : (
          <div className="px-3 py-2 text-xs text-sidebar-foreground/70">
            <p>No sources yet.</p>
            <button
              type="button"
              className="mt-2 text-left font-medium text-sidebar-foreground hover:underline"
              onClick={onAddSource}
            >
              Add source
            </button>
          </div>
        )}
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
