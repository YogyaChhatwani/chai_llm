"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  BotMessageSquare,
  GraduationCap,
  Plus,
  Settings2,
  Sparkles,
} from "lucide-react";
import { SourceFormDialog } from "@/components/sources/source-form-dialog";
import { SourceSidebarList } from "@/components/sources/source-sidebar-list";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/mode-toggle";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Spinner } from "@/components/ui/spinner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useSignOut } from "@/hooks/use-auth";
import type { Workspace } from "@/lib/workspaces";

type WorkspaceShellProps = {
  workspace: Workspace;
  children: React.ReactNode;
};

export function WorkspaceShell({ workspace, children }: WorkspaceShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const signOut = useSignOut();
  const [addSourceOpen, setAddSourceOpen] = useState(false);

  const basePath = `/workspaces/${workspace.id}`;
  const sourcesPath = `${basePath}/sources`;
  const learnPath = `${basePath}/learn`;
  const settingsPath = `${basePath}/settings`;
  const isSourcesActive = pathname.startsWith(sourcesPath);
  const isLearnActive = pathname.startsWith(learnPath);
  const isSettingsActive = pathname.startsWith(settingsPath);
  const isChatActive =
    !isSourcesActive && !isLearnActive && !isSettingsActive;

  return (
    <TooltipProvider>
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 px-2 py-1">
              <span className="text-lg" aria-hidden="true">
                {workspace.icon || "📚"}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {workspace.title}
                </p>
                {workspace.description ? (
                  <p className="truncate text-xs text-muted-foreground">
                    {workspace.description}
                  </p>
                ) : null}
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>DevChart</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={isChatActive}
                      data-active={isChatActive || undefined}
                      tooltip="Chat"
                      render={<Link href={basePath} />}
                    >
                      <BotMessageSquare />
                      <span>Chat</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={isLearnActive}
                      data-active={isLearnActive || undefined}
                      tooltip="Learn"
                      render={<Link href={learnPath} />}
                    >
                      <GraduationCap />
                      <span>Learn</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={isSourcesActive}
                      data-active={isSourcesActive || undefined}
                      tooltip="Sources"
                      render={<Link href={sourcesPath} />}
                    >
                      <BookOpen />
                      <span>Sources</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={isSettingsActive}
                      data-active={isSettingsActive || undefined}
                      tooltip="Settings"
                      render={<Link href={settingsPath} />}
                    >
                      <Settings2 />
                      <span>Settings</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SourceSidebarList
              workspaceId={workspace.id}
              onAddSource={() => setAddSourceOpen(true)}
            />
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="All DevCharts"
                  render={<Link href="/" />}
                >
                  <ArrowLeft />
                  <span>All DevCharts</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  disabled={signOut.isPending}
                  onClick={() =>
                    signOut.mutate(undefined, {
                      onSuccess: () => router.replace("/login"),
                    })
                  }
                >
                  {signOut.isPending ? <Spinner /> : null}
                  <span>Sign out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>
        <SidebarInset className="min-h-svh overflow-hidden">
          <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger />
            <h1 className="min-w-0 flex-1 truncate font-heading text-sm font-medium">
              {workspace.icon ? `${workspace.icon} ` : null}
              {workspace.title}
            </h1>
            <Button
              type="button"
              size="sm"
              onClick={() => setAddSourceOpen(true)}
            >
              <Plus />
              Add source
            </Button>
            <ModeToggle />
          </header>
          <div className="flex min-h-0 flex-1 flex-col overflow-auto">
            {children}
          </div>
        </SidebarInset>
        <SourceFormDialog
          workspaceId={workspace.id}
          open={addSourceOpen}
          onOpenChange={setAddSourceOpen}
        />
      </SidebarProvider>
    </TooltipProvider>
  );
}
