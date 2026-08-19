"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import {
  useDeleteWorkspace,
  useUpdateWorkspace,
} from "@/hooks/use-workspaces";
import {
  CHAT_MODELS,
  isChatModel,
  type ChatModel,
  type Workspace,
} from "@/lib/workspaces";

export function WorkspaceSettings({ workspace }: { workspace: Workspace }) {
  const router = useRouter();
  const update = useUpdateWorkspace();
  const remove = useDeleteWorkspace();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [title, setTitle] = useState(workspace.title);
  const [description, setDescription] = useState(workspace.description ?? "");
  const [icon, setIcon] = useState(workspace.icon ?? "");
  const [defaultModel, setDefaultModel] = useState<ChatModel>(
    isChatModel(workspace.defaultModel)
      ? workspace.defaultModel
      : "gpt-4o-mini",
  );

  useEffect(() => {
    setTitle(workspace.title);
    setDescription(workspace.description ?? "");
    setIcon(workspace.icon ?? "");
    setDefaultModel(
      isChatModel(workspace.defaultModel)
        ? workspace.defaultModel
        : "gpt-4o-mini",
    );
  }, [workspace]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    update.mutate({
      id: workspace.id,
      input: {
        title: title.trim(),
        description: description.trim() || undefined,
        icon: icon.trim() || undefined,
        defaultModel,
      },
    });
  }

  return (
    <div className="grid max-w-lg gap-8">
      <form onSubmit={handleSubmit} className="grid gap-4">
        <div>
          <h2 className="font-heading text-xl font-medium">Settings</h2>
          <p className="text-sm text-muted-foreground">
            Update this DevChart's name, icon, and default model.
          </p>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="settings-title">Title</Label>
          <Input
            id="settings-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={120}
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="settings-description">Description</Label>
          <Textarea
            id="settings-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            maxLength={500}
            placeholder="Optional"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="settings-icon">Icon</Label>
          <Input
            id="settings-icon"
            value={icon}
            onChange={(event) => setIcon(event.target.value)}
            maxLength={8}
            placeholder="📚"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="settings-model">Default model</Label>
          <NativeSelect
            id="settings-model"
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

        {update.error ? (
          <p className="text-sm text-destructive">{update.error.message}</p>
        ) : null}

        <Button type="submit" disabled={update.isPending || !title.trim()}>
          {update.isPending ? <Spinner /> : null}
          Save
        </Button>
      </form>

      <div className="grid gap-3 rounded-2xl border border-destructive/30 p-4">
        <div>
          <h3 className="font-medium">Delete DevChart</h3>
          <p className="text-sm text-muted-foreground">
            This permanently removes the DevChart and its sources.
          </p>
        </div>
        <Button
          type="button"
          variant="destructive"
          className="w-fit"
          onClick={() => {
            remove.reset();
            setDeleteOpen(true);
          }}
        >
          Delete DevChart
        </Button>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete DevChart?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{workspace.title}&quot;.
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
              disabled={remove.isPending}
              onClick={() => {
                remove.mutate(workspace.id, {
                  onSuccess: () => router.replace("/"),
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
