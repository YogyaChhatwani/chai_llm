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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateWorkspace,
  useUpdateWorkspace,
} from "@/hooks/use-workspaces";
import {
  CHAT_MODELS,
  isChatModel,
  type ChatModel,
  type Workspace,
} from "@/lib/workspaces";

type WorkspaceFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspace?: Workspace | null;
};

export function WorkspaceFormDialog({
  open,
  onOpenChange,
  workspace,
}: WorkspaceFormDialogProps) {
  const isEditing = Boolean(workspace);
  const create = useCreateWorkspace();
  const update = useUpdateWorkspace();
  const isSaving = create.isPending || update.isPending;
  const error = create.error ?? update.error;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");
  const [defaultModel, setDefaultModel] = useState<ChatModel>("gpt-4o-mini");

  useEffect(() => {
    if (!open) {
      return;
    }

    setTitle(workspace?.title ?? "");
    setDescription(workspace?.description ?? "");
    setIcon(workspace?.icon ?? "");
    setDefaultModel(
      workspace && isChatModel(workspace.defaultModel)
        ? workspace.defaultModel
        : "gpt-4o-mini",
    );
  }, [open, workspace]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const input = {
      title: title.trim(),
      description: description.trim() || undefined,
      icon: icon.trim() || "📚",
      defaultModel,
    };

    if (workspace) {
      update.mutate(
        { id: workspace.id, input },
        { onSuccess: () => onOpenChange(false) },
      );
      return;
    }

    create.mutate(input, { onSuccess: () => onOpenChange(false) });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="grid gap-6">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit DevChart" : "New DevChart"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update the name, description, or default model."
                : "Give this DevChart a name to get started."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="workspace-title">Title</Label>
              <Input
                id="workspace-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={120}
                required
                placeholder="Research notes"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="workspace-description">Description</Label>
              <Textarea
                id="workspace-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                maxLength={500}
                placeholder="Optional"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="workspace-icon">Icon</Label>
              <Input
                id="workspace-icon"
                value={icon}
                onChange={(event) => setIcon(event.target.value)}
                maxLength={8}
                placeholder="📚"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="workspace-model">Default model</Label>
              <NativeSelect
                id="workspace-model"
                className="w-full"
                value={defaultModel}
                onChange={(event) => {
                  if (isChatModel(event.target.value)) {
                    setDefaultModel(event.target.value);
                  }
                }}
              >
                {CHAT_MODELS.map((model) => (
                  <NativeSelectOption key={model} value={model}>
                    {model}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>
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
            <Button type="submit" disabled={isSaving || !title.trim()}>
              {isSaving ? <Spinner /> : null}
              {isEditing ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
