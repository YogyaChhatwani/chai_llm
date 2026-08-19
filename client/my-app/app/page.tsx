"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { Spinner } from "@/components/ui/spinner";
import { WorkspaceList } from "@/components/workspaces/workspace-list";
import { useSession } from "@/hooks/use-auth";

export default function HomePage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/login");
    }
  }, [isPending, session, router]);

  if (isPending || !session) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner className="size-6" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <AppHeader user={session.user} />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col p-6">
        <section className="relative mb-10 overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/5 via-background to-chart-1/5 px-6 py-10 text-center">
          <div className="constellation-bg opacity-40" />
          <div className="relative z-10 flex flex-col items-center gap-3">
            <span className="font-mono text-[10px] font-medium tracking-[0.3em] uppercase text-muted-foreground">
              DevKundli
            </span>
            <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
              Generate your{" "}
              <span className="bg-gradient-to-r from-primary to-chart-1 bg-clip-text text-transparent">
                Code Kundli
              </span>
            </h2>
            <p className="max-w-md text-sm text-muted-foreground">
              Feed your code, docs, and repos into a DevChart and let AI reveal
              patterns, strengths, and insights hidden in your work.
            </p>
          </div>
        </section>
        <WorkspaceList userName={session.user.name} />
      </main>
    </div>
  );
}
