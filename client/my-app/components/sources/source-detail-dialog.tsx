"use client";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { useSource } from "@/hooks/use-sources";
import {
  parseSourceMetadata,
  SOURCE_STATUS_LABELS,
  SOURCE_TYPE_LABELS,
  type SourceStatus,
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

type SourceDetailDialogProps = {
  workspaceId: string;
  sourceId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SourceDetailDialog({
  workspaceId,
  sourceId,
  open,
  onOpenChange,
}: SourceDetailDialogProps) {
  const { data: source, isPending, error } = useSource(workspaceId, sourceId);
  const metadata = parseSourceMetadata(source?.metadata);
  const isBusy =
    source?.status === "PENDING" || source?.status === "PROCESSING";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {isPending ? (
          <>
            <DialogHeader>
              <DialogTitle>Source</DialogTitle>
              <DialogDescription>Loading source details.</DialogDescription>
            </DialogHeader>
            <div className="flex items-center justify-center py-8">
              <Spinner className="size-6" />
            </div>
          </>
        ) : error || !source ? (
          <>
            <DialogHeader>
              <DialogTitle>Source</DialogTitle>
              <DialogDescription>
                {error?.message ?? "Source not found"}
              </DialogDescription>
            </DialogHeader>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{source.title ?? "Untitled source"}</DialogTitle>
              <DialogDescription>
                {SOURCE_TYPE_LABELS[source.type]}
                {isBusy ? " · still processing" : null}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 text-sm">
              <div className="flex gap-2">
                <Badge variant="outline">
                  {SOURCE_TYPE_LABELS[source.type]}
                </Badge>
                <Badge variant={statusVariant(source.status)}>
                  {SOURCE_STATUS_LABELS[source.status]}
                </Badge>
              </div>
              {source.url ? (
                <p className="break-all">
                  <span className="text-muted-foreground">URL: </span>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="underline"
                  >
                    {source.url}
                  </a>
                </p>
              ) : null}
              {source.description ? (
                <p className="whitespace-pre-wrap">{source.description}</p>
              ) : null}
              {metadata.fileName ? (
                <p>
                  <span className="text-muted-foreground">File: </span>
                  {metadata.fileName}
                </p>
              ) : null}
              {metadata.fileUrl ? (
                <p className="break-all">
                  <span className="text-muted-foreground">File URL: </span>
                  <a
                    href={metadata.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="underline"
                  >
                    {metadata.fileUrl}
                  </a>
                </p>
              ) : null}
              {typeof metadata.chunkCount === "number" ? (
                <p>
                  <span className="text-muted-foreground">Chunks: </span>
                  {metadata.chunkCount}
                </p>
              ) : null}
              {metadata.processingError ? (
                <p className="text-destructive">{metadata.processingError}</p>
              ) : null}
              {isBusy ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Spinner />
                  Processing this source…
                </div>
              ) : null}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
