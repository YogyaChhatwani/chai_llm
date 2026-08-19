"use client";

import { useState } from "react";
import { Brain, Plus } from "lucide-react";
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
import { MemoryFormDialog } from "@/components/memory/memory-form-dialog";
import { useDeleteMemory, useMemories } from "@/hooks/use-memories";
import type { Memory } from "@/lib/memories";

export function MemoryList() {
  const { data: memories, isPending, error } = useMemories();
  const remove = useDeleteMemory();
  const [formOpen, setFormOpen] = useState(false);
  const [memoryToEdit, setMemoryToEdit] = useState<Memory | null>(null);
  const [memoryToDelete, setMemoryToDelete] = useState<Memory | null>(null);

  function openCreate() {
    setMemoryToEdit(null);
    setFormOpen(true);
  }

  function openEdit(memory: Memory) {
    setMemoryToEdit(memory);
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
    return <p className="text-sm text-destructive">{error.message}</p>;
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-medium">Memory</h1>
          <p className="text-sm text-muted-foreground">
            Facts learned from chats, plus anything you add yourself.
          </p>
        </div>
        <Button type="button" onClick={openCreate}>
          <Plus />
          Add memory
        </Button>
      </div>

      {memories?.length ? (
        <div className="grid gap-4">
          {memories.map((memory) => (
            <Card key={memory.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base font-normal leading-relaxed">
                    {memory.memory}
                  </CardTitle>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => openEdit(memory)}
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        remove.reset();
                        setMemoryToDelete(memory);
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
                {memory.categories?.length ? (
                  <CardDescription className="flex flex-wrap gap-1">
                    {memory.categories.map((category) => (
                      <Badge key={category} variant="outline">
                        {category}
                      </Badge>
                    ))}
                  </CardDescription>
                ) : null}
              </CardHeader>
              <CardFooter className="justify-between gap-2">
                <Badge variant="secondary">
                  {memory.source === "manual" ? "Manual" : "Learned"}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date(memory.updatedAt).toLocaleDateString()}
                </span>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Brain />
            </EmptyMedia>
            <EmptyTitle>No memories yet</EmptyTitle>
            <EmptyDescription>
              Chat for a while or add a memory manually.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button type="button" onClick={openCreate}>
              <Plus />
              Add memory
            </Button>
          </EmptyContent>
        </Empty>
      )}

      <MemoryFormDialog
        key={memoryToEdit?.id ?? "create"}
        open={formOpen}
        onOpenChange={setFormOpen}
        memory={memoryToEdit}
      />

      <AlertDialog
        open={memoryToDelete !== null}
        onOpenChange={(open) => {
          if (!open) {
            setMemoryToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete memory?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this memory.
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
              disabled={remove.isPending || !memoryToDelete}
              onClick={() => {
                if (!memoryToDelete) {
                  return;
                }

                remove.mutate(memoryToDelete.id, {
                  onSuccess: () => setMemoryToDelete(null),
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
