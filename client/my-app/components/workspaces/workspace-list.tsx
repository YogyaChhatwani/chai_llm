"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Plus, Sparkles } from "lucide-react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { WorkspaceFormDialog } from "@/components/workspaces/workspace-form-dialog";
import {
  useDeleteWorkspace,
  useWorkspaces,
} from "@/hooks/use-workspaces";
import type { Workspace } from "@/lib/workspaces";

export function WorkspaceList({ userName }: { userName?: string | null }) {
  const { data: workspaces, isPending, error } = useWorkspaces();
  const remove = useDeleteWorkspace();
  const greeting = userName?.split(" ")[0];

  const [formOpen, setFormOpen] = useState(false);
  const [workspaceToEdit, setWorkspaceToEdit] = useState<Workspace | null>(
    null,
  );
  const [workspaceToDelete, setWorkspaceToDelete] = useState<Workspace | null>(
    null,
  );

  function openCreate() {
    setWorkspaceToEdit(null);
    setFormOpen(true);
  }

  function openEdit(workspace: Workspace) {
    setWorkspaceToEdit(workspace);
    setFormOpen(true);
  }

  if (isPending) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner className="size-6" />
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-destructive">{error.message}</p>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-medium">
            Welcome back{greeting ? `, ${greeting}` : ""}
          </h1>
          <p className="text-sm text-muted-foreground">
            Your DevCharts — all your code kundlis in one place.
          </p>
        </div>
        <Button type="button" onClick={openCreate}>
          <Plus />
          New DevChart
        </Button>
      </div>

      {workspaces?.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((workspace) => (
            <WorkspaceCard
              key={workspace.id}
              workspace={workspace}
              onEdit={() => openEdit(workspace)}
              onDelete={() => {
                remove.reset();
                setWorkspaceToDelete(workspace);
              }}
            />
          ))}
        </div>
      ) : (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Sparkles />
            </EmptyMedia>
            <EmptyTitle>No DevCharts yet</EmptyTitle>
            <EmptyDescription>
              Create your first DevChart to start discovering your developer DNA.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button type="button" onClick={openCreate}>
              <Plus />
              New DevChart
            </Button>
          </EmptyContent>
        </Empty>
      )}

      <WorkspaceFormDialog
        key={workspaceToEdit?.id ?? "create"}
        open={formOpen}
        onOpenChange={setFormOpen}
        workspace={workspaceToEdit}
      />

      <AlertDialog
        open={workspaceToDelete !== null}
        onOpenChange={(open) => {
          if (!open) {
            setWorkspaceToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete DevChart?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              {workspaceToDelete ? `"${workspaceToDelete.title}"` : "this DevChart"}
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
              disabled={remove.isPending || !workspaceToDelete}
              onClick={() => {
                if (!workspaceToDelete) {
                  return;
                }

                remove.mutate(workspaceToDelete.id, {
                  onSuccess: () => setWorkspaceToDelete(null),
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

function WorkspaceCard({
  workspace,
  onEdit,
  onDelete,
}: {
  workspace: Workspace;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const router = useRouter();
  const updatedAt = new Date(workspace.updatedAt).toLocaleDateString();

  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md hover:shadow-primary/5"
      onClick={() => router.push(`/workspaces/${workspace.id}`)}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="text-lg" aria-hidden="true">
              {workspace.icon ?? "📚"}
            </span>
            <CardTitle className="truncate">{workspace.title}</CardTitle>
          </div>
          <div
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
          >
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="ghost" size="icon-sm">
                  <MoreHorizontal />
                  <span className="sr-only">DevChart actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
                <DropdownMenuItem variant="destructive" onClick={onDelete}>
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {workspace.description ? (
          <CardDescription className="line-clamp-2">
            {workspace.description}
          </CardDescription>
        ) : null}
      </CardHeader>
      <CardFooter className="justify-between gap-2">
        <Badge variant="secondary">{workspace.defaultModel}</Badge>
        <span className="text-xs text-muted-foreground">{updatedAt}</span>
      </CardFooter>
    </Card>
  );
}
