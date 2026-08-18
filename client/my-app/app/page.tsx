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
        <WorkspaceList />
      </main>
    </div>
  );
}
