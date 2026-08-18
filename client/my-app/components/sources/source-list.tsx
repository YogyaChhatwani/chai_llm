"use client";

import { useState } from "react";
import { FileText, Plus } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Spinner } from "@/components/ui/spinner";
import { SourceFormDialog } from "@/components/sources/source-form-dialog";
import { useDeleteSource, useSources } from "@/hooks/use-sources";
import {
  SOURCE_STATUSES,
  SOURCE_TYPES,
  type Source,
  type SourceStatus,
  type SourceType,
} from "@/lib/sources";

function statusVariant(status: SourceStatus) {
  if (status === "FAILED") {
    return "destructive" as const;
  }
  if (status === "COMPLETED") {
    return "default" as const;
  }
  return "secondary" as const;
}

export function SourceList({ workspaceId }: { workspaceId: string }) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<SourceType | "">("");
  const [status, setStatus] = useState<SourceStatus | "">("");
  const [formType, setFormType] = useState<SourceType | null>(null);
  const [sourceToDelete, setSourceToDelete] = useState<Source | null>(null);

  const filters = {
    query: query.trim() || undefined,
    type: type || undefined,
    status: status || undefined,
  };

  const { data: sources, isPending, error } = useSources(workspaceId, filters);
  const remove = useDeleteSource(workspaceId);

  function openForm(nextType: SourceType) {
    setFormType(nextType);
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-xl font-medium">Sources</h2>
          <p className="text-sm text-muted-foreground">
            Add text, files, websites, or videos to this workspace.
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button type="button">
              <Plus />
              Add source
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => openForm("TEXT")}>
              Text
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openForm("MARKDOWN")}>
              Markdown
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openForm("WEBSITE")}>
              Website
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openForm("YOUTUBE")}>
              YouTube
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openForm("PDF")}>
              PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-wrap gap-2">
        <Input
          className="max-w-xs"
          placeholder="Search sources"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <NativeSelect
          value={type}
          onChange={(event) =>
            setType((event.target.value || "") as SourceType | "")
          }
        >
          <NativeSelectOption value="">All types</NativeSelectOption>
          {SOURCE_TYPES.map((sourceType) => (
            <NativeSelectOption key={sourceType} value={sourceType}>
              {sourceType}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        <NativeSelect
          value={status}
          onChange={(event) =>
            setStatus((event.target.value || "") as SourceStatus | "")
          }
        >
          <NativeSelectOption value="">All statuses</NativeSelectOption>
          {SOURCE_STATUSES.map((sourceStatus) => (
            <NativeSelectOption key={sourceStatus} value={sourceStatus}>
              {sourceStatus}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>

      {sources?.length ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {sources.map((source) => (
            <SourceCard
              key={source.id}
              source={source}
              onDelete={() => {
                remove.reset();
                setSourceToDelete(source);
              }}
            />
          ))}
        </div>
      ) : (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileText />
            </EmptyMedia>
            <EmptyTitle>No sources yet</EmptyTitle>
            <EmptyDescription>
              Add a document, website, or video to get started.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button type="button" onClick={() => openForm("TEXT")}>
              <Plus />
              Add source
            </Button>
          </EmptyContent>
        </Empty>
      )}

      <SourceFormDialog
        workspaceId={workspaceId}
        type={formType}
        open={formType !== null}
        onOpenChange={(open) => {
          if (!open) {
            setFormType(null);
          }
        }}
      />

      <AlertDialog
        open={sourceToDelete !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSourceToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete source?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              {sourceToDelete
                ? `"${sourceToDelete.title ?? "this source"}"`
                : "this source"}
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
              disabled={remove.isPending || !sourceToDelete}
              onClick={() => {
                if (!sourceToDelete) {
                  return;
                }

                remove.mutate(sourceToDelete.id, {
                  onSuccess: () => setSourceToDelete(null),
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

function SourceCard({
  source,
  onDelete,
}: {
  source: Source;
  onDelete: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="truncate">
            {source.title ?? "Untitled source"}
          </CardTitle>
          <Button type="button" variant="ghost" size="sm" onClick={onDelete}>
            Delete
          </Button>
        </div>
        {source.url ? (
          <CardDescription className="truncate">{source.url}</CardDescription>
        ) : source.description ? (
          <CardDescription className="line-clamp-2">
            {source.description}
          </CardDescription>
        ) : null}
      </CardHeader>
      <CardFooter className="justify-between gap-2">
        <div className="flex gap-2">
          <Badge variant="outline">{source.type}</Badge>
          <Badge variant={statusVariant(source.status)}>{source.status}</Badge>
        </div>
        <span className="text-xs text-muted-foreground">
          {new Date(source.createdAt).toLocaleDateString()}
        </span>
      </CardFooter>
    </Card>
  );
}
