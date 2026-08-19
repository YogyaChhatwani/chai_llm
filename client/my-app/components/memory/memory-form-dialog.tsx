"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useCreateMemory, useUpdateMemory } from "@/hooks/use-memories";
import type { Memory } from "@/lib/memories";

type MemoryFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memory?: Memory | null;
};

export function MemoryFormDialog({
  open,
  onOpenChange,
  memory,
}: MemoryFormDialogProps) {
  const isEditing = Boolean(memory);
  const create = useCreateMemory();
  const update = useUpdateMemory();
  const isSaving = create.isPending || update.isPending;
  const error = create.error ?? update.error;
  const [text, setText] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    setText(memory?.memory ?? "");
  }, [open, memory]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const nextMemory = text.trim();

    if (!nextMemory) {
      return;
    }

    if (memory) {
      update.mutate(
        { memoryId: memory.id, memory: nextMemory },
        { onSuccess: () => onOpenChange(false) },
      );
      return;
    }

    create.mutate(nextMemory, { onSuccess: () => onOpenChange(false) });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="grid gap-6">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit memory" : "Add memory"}
            </DialogTitle>
            <DialogDescription>
              Saved facts are used in future chats.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-2">
            <Label htmlFor="memory-text">Memory</Label>
            <Textarea
              id="memory-text"
              value={text}
              onChange={(event) => setText(event.target.value)}
              maxLength={2000}
              rows={6}
              required
              placeholder="I prefer concise answers with examples."
            />
          </div>

          {error ? (
            <p className="text-sm text-destructive">{error.message}</p>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving || !text.trim()}>
              {isSaving ? <Spinner /> : null}
              {isEditing ? "Save" : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
