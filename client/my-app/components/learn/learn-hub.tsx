"use client";

import { useState } from "react";
import { BookOpen, Plus } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { ArtifactViewer } from "@/components/learn/artifact-viewer";
import { GenerateArtifactDialog } from "@/components/learn/generate-artifact-dialog";
import {
  useArtifact,
  useArtifacts,
  useDeleteArtifact,
} from "@/hooks/use-artifacts";
import {
  ARTIFACT_LABELS,
  type Artifact,
  type ArtifactStatus,
} from "@/lib/artifacts";

function statusVariant(status: ArtifactStatus) {
  if (status === "FAILED") {
    return "destructive" as const;
  }
  if (status === "COMPLETED") {
    return "default" as const;
  }
  return "secondary" as const;
}

function processingError(metadata: unknown) {
  if (!metadata || typeof metadata !== "object") {
    return null;
  }

  const error = (metadata as { processingError?: unknown }).processingError;
  return typeof error === "string" ? error : null;
}

export function LearnHub({ workspaceId }: { workspaceId: string }) {
  const [generateOpen, setGenerateOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [artifactToDelete, setArtifactToDelete] = useState<Artifact | null>(
    null,
  );

  const { data: artifacts, isPending, error } = useArtifacts(workspaceId);
  const { data: selected } = useArtifact(workspaceId, selectedId);
  const remove = useDeleteArtifact(workspaceId);

  if (isPending) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner className="size-6" />
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-destructive">{error.message}</p>;
  }

  const selectedArtifact = selected ?? artifacts?.find((item) => item.id === selectedId);

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-xl font-medium">Learn</h2>
          <p className="text-sm text-muted-foreground">
            Generate summaries, quizzes, and other study tools from your sources.
          </p>
        </div>
        <Button type="button" onClick={() => setGenerateOpen(true)}>
          <Plus />
          Generate
        </Button>
      </div>

      {artifacts?.length ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {artifacts.map((artifact) => (
            <Card
              key={artifact.id}
              className={`cursor-pointer ${
                selectedId === artifact.id ? "border-primary" : ""
              }`}
              onClick={() => setSelectedId(artifact.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="truncate">{artifact.title}</CardTitle>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(event) => {
                      event.stopPropagation();
                      remove.reset();
                      setArtifactToDelete(artifact);
                    }}
                  >
                    Delete
                  </Button>
                </div>
                <CardDescription>
                  {ARTIFACT_LABELS[artifact.type]}
                </CardDescription>
              </CardHeader>
              <CardFooter className="justify-between gap-2">
                <Badge variant={statusVariant(artifact.status)}>
                  {artifact.status}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date(artifact.createdAt).toLocaleDateString()}
                </span>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BookOpen />
            </EmptyMedia>
            <EmptyTitle>No learning tools yet</EmptyTitle>
            <EmptyDescription>
              Generate a summary, quiz, or flashcards from processed sources.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button type="button" onClick={() => setGenerateOpen(true)}>
              <Plus />
              Generate
            </Button>
          </EmptyContent>
        </Empty>
      )}

      {selectedArtifact ? (
        <div className="rounded-2xl border p-4">
          <div className="mb-4 flex items-start justify-between gap-2">
            <div>
              <h3 className="font-heading text-lg font-medium">
                {selectedArtifact.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {ARTIFACT_LABELS[selectedArtifact.type]}
              </p>
            </div>
            <Badge variant={statusVariant(selectedArtifact.status)}>
              {selectedArtifact.status}
            </Badge>
          </div>
          {selectedArtifact.status === "PENDING" ||
          selectedArtifact.status === "PROCESSING" ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Spinner />
              Generating…
            </div>
          ) : selectedArtifact.status === "FAILED" ? (
            <p className="text-sm text-destructive">
              {processingError(selectedArtifact.metadata) ??
                "Generation failed."}
            </p>
          ) : (
            <ArtifactViewer
              key={selectedArtifact.id}
              artifact={selectedArtifact}
            />
          )}
        </div>
      ) : null}

      <GenerateArtifactDialog
        workspaceId={workspaceId}
        open={generateOpen}
        onOpenChange={setGenerateOpen}
        onCreated={(artifact) => setSelectedId(artifact.id)}
      />

      <AlertDialog
        open={artifactToDelete !== null}
        onOpenChange={(open) => {
          if (!open) {
            setArtifactToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete learning tool?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              {artifactToDelete
                ? `"${artifactToDelete.title}"`
                : "this learning tool"}
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          {remove.error ? (
            <p className="text-sm text-destructive">{remove.error.message}</p>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              type="button"
              variant="destructive"
              disabled={remove.isPending || !artifactToDelete}
              onClick={() => {
                if (!artifactToDelete) {
                  return;
                }

                remove.mutate(artifactToDelete.id, {
                  onSuccess: () => {
                    if (selectedId === artifactToDelete.id) {
                      setSelectedId(null);
                    }
                    setArtifactToDelete(null);
                  },
                });
              }}
            >
              {remove.isPending ? <Spinner /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
