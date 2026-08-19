"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Globe, BookOpen, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Spinner } from "@/components/ui/spinner";
import { useGoogleSignIn, useSession } from "@/hooks/use-auth";
import { apiFetch } from "@/lib/api";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const signIn = useGoogleSignIn();

  useEffect(() => {
    if (!isPending && session) {
      router.replace("/");
    }
  }, [isPending, session, router]);

  if (isPending || session) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner className="size-6" />
      </div>
    );
  }

  return (
    <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-background px-6 py-16 dark:bg-[oklch(0.1_0.005_280)]">
      {/* constellation dots */}
      <div className="constellation-bg" />

      {/* subtle radial glow behind hero */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -z-0 size-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl animate-pulse-glow" />

      {/* theme toggle */}
      <div className="absolute top-4 right-4 z-10">
        <ModeToggle />
      </div>

      {/* hero */}
      <div className="relative z-10 flex max-w-xl flex-col items-center gap-6 text-center">
        {/* brand mark */}
        <span className="font-mono text-xs font-medium tracking-[0.3em] uppercase text-muted-foreground">
          DevKundli
        </span>

        <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          What&rsquo;s written in{" "}
          <span className="bg-gradient-to-r from-primary via-chart-1 to-chart-3 bg-clip-text text-transparent">
            your code
          </span>
          ?
        </h1>

        <p className="max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
          Your repository has a story.
          <br />
          We analyze it, understand it,
          <br />
          and tell you what comes next.
        </p>

        {/* CTA */}
        <Button
          size="lg"
          className="mt-2 gap-2 px-8 text-base"
          disabled={signIn.isPending}
          onClick={() => signIn.mutate()}
        >
          {signIn.isPending ? <Spinner /> : <GoogleIcon />}
          Generate My DevKundli
        </Button>

        {signIn.error ? (
          <p className="text-sm text-destructive">{signIn.error.message}</p>
        ) : null}

        {/* source icons */}
        <div className="mt-2 flex items-center gap-6 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <svg viewBox="0 0 24 24" fill="currentColor" className="size-3.5" aria-hidden="true">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
            GitHub
          </span>
          <span className="text-border">|</span>
          <span className="flex items-center gap-1.5">
            <BookOpen className="size-3.5" /> Repository
          </span>
          <span className="text-border">|</span>
          <span className="flex items-center gap-1.5">
            <Globe className="size-3.5" /> Website
          </span>
        </div>

        {/* waitlist divider */}
        <div className="mt-6 flex w-full max-w-xs items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">or join the waitlist</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* waitlist form */}
        <WaitlistForm />
      </div>
    </div>
  );
}

function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    try {
      const res = await apiFetch<{ message: string }>("/api/v1/waitlist", {
        method: "POST",
        body: JSON.stringify({ email: email.trim() }),
      });
      setStatus("success");
      setMessage(res.message);
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  if (status === "success") {
    return (
      <div className="flex items-center gap-2 text-sm text-green-500">
        <CheckCircle2 className="size-4" />
        <span>{message}</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="relative flex w-full max-w-sm gap-2">
      <Input
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="flex-1 bg-background/50 backdrop-blur-sm"
        disabled={status === "loading"}
      />
      <Button
        type="submit"
        variant="outline"
        disabled={status === "loading" || !email.trim()}
      >
        {status === "loading" ? <Spinner /> : <Mail className="size-4" />}
        Join
      </Button>
      {status === "error" ? (
        <p className="absolute -bottom-6 left-0 text-xs text-destructive">{message}</p>
      ) : null}
    </form>
  );
}
