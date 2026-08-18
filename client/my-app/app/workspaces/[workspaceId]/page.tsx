"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { SourceList } from "@/components/sources/source-list";
import { Spinner } from "@/components/ui/spinner";
import { useSession } from "@/hooks/use-auth";
import { useWorkspace } from "@/hooks/use-workspaces";

export default function WorkspacePage() {
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
    <div className="flex flex-1 flex-col">
      <AppHeader user={session.user} />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 p-6">
        <div>
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Workspaces
          </Link>
          <h1 className="mt-2 font-heading text-2xl font-medium">
            {workspace.icon ? `${workspace.icon} ` : null}
            {workspace.title}
          </h1>
          {workspace.description ? (
            <p className="text-sm text-muted-foreground">
              {workspace.description}
            </p>
          ) : null}
        </div>
        <SourceList workspaceId={workspaceId} />
      </main>
    </div>
  );
}
