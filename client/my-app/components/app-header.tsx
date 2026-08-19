"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Spinner } from "@/components/ui/spinner";
import { useSignOut } from "@/hooks/use-auth";

type AppHeaderProps = {
  user: {
    name: string;
    image?: string | null;
  };
};

export function AppHeader({ user }: AppHeaderProps) {
  const router = useRouter();
  const signOut = useSignOut();
  const initials = user.name?.charAt(0).toUpperCase() ?? "U";

  return (
    <header className="flex items-center justify-between border-b px-4 py-3">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-1.5 font-heading text-lg font-semibold tracking-tight">
          <span className="bg-gradient-to-r from-primary to-chart-1 bg-clip-text text-transparent">
            DevKundli
          </span>
        </Link>
        <Link
          href="/memory"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Memory
        </Link>
      </div>
      <div className="flex items-center gap-2">
        <Avatar size="sm">
          {user.image ? <AvatarImage src={user.image} alt={user.name} /> : null}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={signOut.isPending}
          onClick={() =>
            signOut.mutate(undefined, {
              onSuccess: () => router.replace("/login"),
            })
          }
        >
          {signOut.isPending ? <Spinner /> : "Sign out"}
        </Button>
        <ModeToggle />
      </div>
    </header>
  );
}
