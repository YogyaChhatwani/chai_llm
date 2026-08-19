"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  FileText,
  Globe,
  MoreHorizontal,
  Plus,
  Search,
  Video,
} from "lucide-react";
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
import { SourceDetailDialog } from "@/components/sources/source-detail-dialog";
import { SourceFormDialog } from "@/components/sources/source-form-dialog";
import { useDeleteSource, useSources } from "@/hooks/use-sources";
import {
  SOURCE_STATUS_LABELS,
  SOURCE_STATUSES,
  SOURCE_TYPE_LABELS,
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
  const [addOpen, setAddOpen] = useState(false);
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
  const [sourceToDelete, setSourceToDelete] = useState<Source | null>(null);

  const filters = {
    query: query.trim() || undefined,
    type: type || undefined,
    status: status || undefined,
  };

  const { data: sources, isPending, error } = useSources(workspaceId, filters);
  const remove = useDeleteSource(workspaceId);

  function openAddSource() {
    setAddOpen(true);
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
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-heading text-xl font-medium">Source library</h2>
          <p className="text-sm text-muted-foreground">
            {sources
              ? `${sources.length} source${sources.length === 1 ? "" : "s"} in this workspace`
              : "PDFs, notes, websites, and videos in this notebook"}
          </p>
        </div>
        <Button type="button" variant="outline" onClick={openAddSource}>
          <Plus />
          Add source
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-muted/50 p-2">
        <div className="relative min-w-48 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Search sources"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <NativeSelect
          value={type || "all"}
          onChange={(event) =>
            setType(
              event.target.value === "all"
                ? ""
                : (event.target.value as SourceType),
            )
          }
        >
          <NativeSelectOption value="all">All types</NativeSelectOption>
          {SOURCE_TYPES.map((sourceType) => (
            <NativeSelectOption key={sourceType} value={sourceType}>
              {SOURCE_TYPE_LABELS[sourceType]}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        <NativeSelect
          value={status || "all"}
          onChange={(event) =>
            setStatus(
              event.target.value === "all"
                ? ""
                : (event.target.value as SourceStatus),
            )
          }
        >
          <NativeSelectOption value="all">All statuses</NativeSelectOption>
          {SOURCE_STATUSES.map((sourceStatus) => (
            <NativeSelectOption key={sourceStatus} value={sourceStatus}>
              {SOURCE_STATUS_LABELS[sourceStatus]}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>

      {sources?.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sources.map((source) => (
            <SourceCard
              key={source.id}
              source={source}
              onOpen={() => setSelectedSourceId(source.id)}
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
            <Button type="button" onClick={openAddSource}>
              <Plus />
              Add source
            </Button>
          </EmptyContent>
        </Empty>
      )}

      <SourceFormDialog
        workspaceId={workspaceId}
        open={addOpen}
        onOpenChange={setAddOpen}
      />

      <SourceDetailDialog
        workspaceId={workspaceId}
        sourceId={selectedSourceId}
        open={selectedSourceId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedSourceId(null);
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

function SourceTypeIcon({ type }: { type: SourceType }) {
  if (type === "YOUTUBE") {
    return <Video className="size-4" />;
  }
  if (type === "WEBSITE") {
    return <Globe className="size-4" />;
  }
  return <FileText className="size-4" />;
}

function SourceCard({
  source,
  onOpen,
  onDelete,
}: {
  source: Source;
  onOpen: () => void;
  onDelete: () => void;
}) {
  const preview = source.url ?? source.description;

  return (
    <Card
      className="cursor-pointer transition-colors hover:bg-muted/30"
      onClick={onOpen}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <SourceTypeIcon type={source.type} />
            </div>
            <div className="min-w-0">
              <CardTitle className="truncate">
                {source.title ?? "Untitled source"}
              </CardTitle>
              <CardDescription>
                {SOURCE_TYPE_LABELS[source.type]} ·{" "}
                {formatDistanceToNow(new Date(source.createdAt), {
                  addSuffix: true,
                })}
              </CardDescription>
            </div>
          </div>
          <div
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
          >
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button type="button" variant="ghost" size="icon-sm">
                  <MoreHorizontal />
                  <span className="sr-only">Source actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onOpen}>Open</DropdownMenuItem>
                <DropdownMenuItem variant="destructive" onClick={onDelete}>
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {preview ? (
          <CardDescription className="line-clamp-2">{preview}</CardDescription>
        ) : null}
      </CardHeader>
      <CardFooter className="justify-between gap-2">
        <Badge variant={statusVariant(source.status)}>
          {SOURCE_STATUS_LABELS[source.status]}
        </Badge>
        <span className="text-xs text-muted-foreground">
          {new Date(source.createdAt).toLocaleDateString()}
        </span>
      </CardFooter>
    </Card>
  );
}
