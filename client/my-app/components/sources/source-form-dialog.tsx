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
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateTextSource,
  useImportWebsite,
  useImportYoutube,
  useUploadPdf,
} from "@/hooks/use-sources";
import type { SourceType } from "@/lib/sources";

const MAX_PDF_SIZE_BYTES = 10 * 1024 * 1024;

type SourceFormDialogProps = {
  workspaceId: string;
  type: SourceType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function titleForType(type: SourceType) {
  switch (type) {
    case "TEXT":
      return "Add text";
    case "MARKDOWN":
      return "Add markdown";
    case "WEBSITE":
      return "Import website";
    case "YOUTUBE":
      return "Import YouTube";
    case "PDF":
      return "Upload PDF";
  }
}

export function SourceFormDialog({
  workspaceId,
  type,
  open,
  onOpenChange,
}: SourceFormDialogProps) {
  const createText = useCreateTextSource(workspaceId);
  const website = useImportWebsite(workspaceId);
  const youtube = useImportYoutube(workspaceId);
  const pdf = useUploadPdf(workspaceId);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const isSaving =
    createText.isPending ||
    website.isPending ||
    youtube.isPending ||
    pdf.isPending;

  const error =
    formError ??
    createText.error?.message ??
    website.error?.message ??
    youtube.error?.message ??
    pdf.error?.message;

  useEffect(() => {
    if (!open) {
      return;
    }

    setTitle("");
    setDescription("");
    setUrl("");
    setFile(null);
    setFormError(null);
  }, [open, type]);

  function close() {
    onOpenChange(false);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);

    if (!type) {
      return;
    }

    const trimmedTitle = title.trim() || undefined;

    if (type === "TEXT" || type === "MARKDOWN") {
      if (!title.trim() || !description.trim()) {
        setFormError("Title and content are required");
        return;
      }

      createText.mutate(
        {
          type,
          title: title.trim(),
          description: description.trim(),
        },
        { onSuccess: close },
      );
      return;
    }

    if (type === "WEBSITE" || type === "YOUTUBE") {
      if (!url.trim()) {
        setFormError("URL is required");
        return;
      }

      const input = { url: url.trim(), title: trimmedTitle };
      const options = { onSuccess: close };

      if (type === "WEBSITE") {
        website.mutate(input, options);
      } else {
        youtube.mutate(input, options);
      }
      return;
    }

    if (!file) {
      setFormError("A PDF file is required");
      return;
    }

    if (file.size > MAX_PDF_SIZE_BYTES) {
      setFormError("PDF must be 10MB or smaller");
      return;
    }

    pdf.mutate({ file, title: trimmedTitle }, { onSuccess: close });
  }

  if (!type) {
    return null;
  }

  const isText = type === "TEXT" || type === "MARKDOWN";
  const isUrl = type === "WEBSITE" || type === "YOUTUBE";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="grid gap-6">
          <DialogHeader>
            <DialogTitle>{titleForType(type)}</DialogTitle>
            <DialogDescription>
              {isText
                ? "Paste the content you want this workspace to learn from."
                : isUrl
                  ? "Paste a URL. Processing starts after import."
                  : "Upload a PDF up to 10MB."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="source-title">
                Title {isText ? "" : "(optional)"}
              </Label>
              <Input
                id="source-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required={isText}
                placeholder={isText ? "Meeting notes" : "Optional title"}
              />
            </div>

            {isText ? (
              <div className="grid gap-2">
                <Label htmlFor="source-content">Content</Label>
                <Textarea
                  id="source-content"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  maxLength={500}
                  required
                  placeholder="Paste text here"
                />
              </div>
            ) : null}

            {isUrl ? (
              <div className="grid gap-2">
                <Label htmlFor="source-url">URL</Label>
                <Input
                  id="source-url"
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  required
                  placeholder={
                    type === "YOUTUBE"
                      ? "https://www.youtube.com/watch?v=..."
                      : "https://example.com"
                  }
                />
              </div>
            ) : null}

            {type === "PDF" ? (
              <div className="grid gap-2">
                <Label htmlFor="source-file">PDF</Label>
                <Input
                  id="source-file"
                  type="file"
                  accept="application/pdf"
                  onChange={(event) =>
                    setFile(event.target.files?.[0] ?? null)
                  }
                  required
                />
              </div>
            ) : null}
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? <Spinner /> : null}
              Add source
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
