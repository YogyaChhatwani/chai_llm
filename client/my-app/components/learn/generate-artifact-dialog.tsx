"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useCreateArtifact } from "@/hooks/use-artifacts";
import {
  ARTIFACT_DESCRIPTIONS,
  ARTIFACT_LABELS,
  ARTIFACT_TYPES,
  type Artifact,
  type ArtifactType,
} from "@/lib/artifacts";

type GenerateArtifactDialogProps = {
  workspaceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (artifact: Artifact) => void;
};

export function GenerateArtifactDialog({
  workspaceId,
  open,
  onOpenChange,
  onCreated,
}: GenerateArtifactDialogProps) {
  const create = useCreateArtifact(workspaceId);
  const [type, setType] = useState<ArtifactType>("SUMMARY");
  const [title, setTitle] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    create.mutate(
      {
        type,
        title: title.trim() || undefined,
      },
      {
        onSuccess: (artifact) => {
          setTitle("");
          setType("SUMMARY");
          onCreated?.(artifact);
          onOpenChange(false);
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="grid gap-6">
          <DialogHeader>
            <DialogTitle>Generate learning tool</DialogTitle>
            <DialogDescription>
              Uses all processed sources in this workspace. Generation runs in
              the background.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Type</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {ARTIFACT_TYPES.map((artifactType) => (
                  <button
                    key={artifactType}
                    type="button"
                    onClick={() => setType(artifactType)}
                    className={`rounded-2xl border px-3 py-3 text-left transition-colors ${
                      type === artifactType
                        ? "border-primary bg-primary/10"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <p className="text-sm font-medium">
                      {ARTIFACT_LABELS[artifactType]}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {ARTIFACT_DESCRIPTIONS[artifactType]}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="artifact-title">Title (optional)</Label>
              <Input
                id="artifact-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={120}
                placeholder="Custom title"
              />
            </div>
          </div>

          {create.error ? (
            <p className="text-sm text-destructive">{create.error.message}</p>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? <Spinner /> : null}
              Generate
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
