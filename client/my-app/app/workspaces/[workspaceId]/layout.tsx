"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { Spinner } from "@/components/ui/spinner";
import { WorkspaceShell } from "@/components/workspaces/workspace-shell";
import { useSession } from "@/hooks/use-auth";
import { useWorkspace } from "@/hooks/use-workspaces";

export default function WorkspaceLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const params = useParams<{ workspaceId: string }>();
  const workspaceId =
    typeof params.workspaceId === "string" ? params.workspaceId : "";
  const { data: session, isPending: sessionPending } = useSession();
  const {
    data: workspace,
    isPending: workspacePending,
    error,
  } = useWorkspace(workspaceId);

  useEffect(() => {
    if (!sessionPending && !session) {
      router.replace("/login");
    }
  }, [sessionPending, session, router]);

  if (sessionPending || !session) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner className="size-6" />
      </div>
    );
  }

  if (!workspaceId) {
    return (
      <div className="flex flex-1 flex-col">
        <AppHeader user={session.user} />
        <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 p-6">
          <p className="text-sm text-destructive">Workspace not found</p>
          <Link href="/" className="text-sm underline">
            Back to workspaces
          </Link>
        </main>
      </div>
    );
  }

  if (workspacePending) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner className="size-6" />
      </div>
    );
  }

  if (error || !workspace) {
    return (
      <div className="flex flex-1 flex-col">
        <AppHeader user={session.user} />
        <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 p-6">
          <p className="text-sm text-destructive">
            {error?.message ?? "Workspace not found"}
          </p>
          <Link href="/" className="text-sm underline">
            Back to workspaces
          </Link>
        </main>
      </div>
    );
  }

  return (
    <WorkspaceShell workspace={workspace}>{children}</WorkspaceShell>
  );
}
