"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateTextSource,
  useImportWebsite,
  useImportYoutube,
  useUploadPdf,
} from "@/hooks/use-sources";

const MAX_PDF_SIZE_BYTES = 10 * 1024 * 1024;

type SourceFormDialogProps = {
  workspaceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SourceFormDialog({
  workspaceId,
  open,
  onOpenChange,
}: SourceFormDialogProps) {
  const createText = useCreateTextSource(workspaceId);
  const website = useImportWebsite(workspaceId);
  const youtube = useImportYoutube(workspaceId);
  const pdf = useUploadPdf(workspaceId);

  const [error, setError] = useState<string | null>(null);

  const [textTitle, setTextTitle] = useState("");
  const [textContent, setTextContent] = useState("");

  const [markdownTitle, setMarkdownTitle] = useState("");
  const [markdownContent, setMarkdownContent] = useState("");

  const [pdfTitle, setPdfTitle] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const [websiteUrl, setWebsiteUrl] = useState("");
  const [websiteTitle, setWebsiteTitle] = useState("");

  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [youtubeTitle, setYoutubeTitle] = useState("");

  const isPending =
    createText.isPending ||
    website.isPending ||
    youtube.isPending ||
    pdf.isPending;

  useEffect(() => {
    if (!open) {
      return;
    }

    setError(null);
    setTextTitle("");
    setTextContent("");
    setMarkdownTitle("");
    setMarkdownContent("");
    setPdfTitle("");
    setPdfFile(null);
    setWebsiteUrl("");
    setWebsiteTitle("");
    setYoutubeUrl("");
    setYoutubeTitle("");
  }, [open]);

  function close() {
    onOpenChange(false);
  }

  async function submitText() {
    setError(null);

    if (!textTitle.trim() || !textContent.trim()) {
      setError("Title and content are required");
      return;
    }

    createText.mutate(
      {
        type: "TEXT",
        title: textTitle.trim(),
        description: textContent.trim(),
      },
      {
        onSuccess: close,
        onError: (submitError) => setError(submitError.message),
      },
    );
  }

  async function submitMarkdown() {
    setError(null);

    if (!markdownTitle.trim() || !markdownContent.trim()) {
      setError("Title and content are required");
      return;
    }

    createText.mutate(
      {
        type: "MARKDOWN",
        title: markdownTitle.trim(),
        description: markdownContent.trim(),
      },
      {
        onSuccess: close,
        onError: (submitError) => setError(submitError.message),
      },
    );
  }

  async function submitPdf() {
    setError(null);

    if (!pdfFile) {
      setError("Choose a PDF file to upload.");
      return;
    }

    if (pdfFile.size > MAX_PDF_SIZE_BYTES) {
      setError("PDF must be 10MB or smaller");
      return;
    }

    pdf.mutate(
      { file: pdfFile, title: pdfTitle.trim() || undefined },
      {
        onSuccess: close,
        onError: (submitError) => setError(submitError.message),
      },
    );
  }

  async function submitWebsite() {
    setError(null);

    if (!websiteUrl.trim()) {
      setError("URL is required");
      return;
    }

    website.mutate(
      { url: websiteUrl.trim(), title: websiteTitle.trim() || undefined },
      {
        onSuccess: close,
        onError: (submitError) => setError(submitError.message),
      },
    );
  }

  async function submitYoutube() {
    setError(null);

    if (!youtubeUrl.trim()) {
      setError("URL is required");
      return;
    }

    youtube.mutate(
      { url: youtubeUrl.trim(), title: youtubeTitle.trim() || undefined },
      {
        onSuccess: close,
        onError: (submitError) => setError(submitError.message),
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add source</DialogTitle>
          <DialogDescription>
            Add knowledge to this workspace from text, files, or the web.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="text" className="gap-4">
          <TabsList className="w-full">
            <TabsTrigger value="text">Text</TabsTrigger>
            <TabsTrigger value="markdown">Markdown</TabsTrigger>
            <TabsTrigger value="pdf">PDF</TabsTrigger>
            <TabsTrigger value="website">Website</TabsTrigger>
            <TabsTrigger value="youtube">YouTube</TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="grid gap-4 pt-2">
            <Field
              id="text-title"
              label="Title"
              value={textTitle}
              onChange={setTextTitle}
              placeholder="Meeting notes"
              disabled={isPending}
            />
            <FieldTextarea
              id="text-content"
              label="Content"
              value={textContent}
              onChange={setTextContent}
              placeholder="Paste text here"
              disabled={isPending}
            />
            <SubmitButton pending={isPending} onClick={() => void submitText()}>
              Add text source
            </SubmitButton>
          </TabsContent>

          <TabsContent value="markdown" className="grid gap-4 pt-2">
            <Field
              id="markdown-title"
              label="Title"
              value={markdownTitle}
              onChange={setMarkdownTitle}
              placeholder="Research doc"
              disabled={isPending}
            />
            <FieldTextarea
              id="markdown-content"
              label="Markdown"
              value={markdownContent}
              onChange={setMarkdownContent}
              placeholder="Paste markdown here"
              disabled={isPending}
            />
            <SubmitButton
              pending={isPending}
              onClick={() => void submitMarkdown()}
            >
              Add markdown source
            </SubmitButton>
          </TabsContent>

          <TabsContent value="pdf" className="grid gap-4 pt-2">
            <Field
              id="pdf-title"
              label="Title (optional)"
              value={pdfTitle}
              onChange={setPdfTitle}
              placeholder="Optional title"
              disabled={isPending}
            />
            <div className="grid gap-2">
              <Label htmlFor="pdf-file">PDF file</Label>
              <Input
                id="pdf-file"
                type="file"
                accept="application/pdf"
                disabled={isPending}
                onChange={(event) => setPdfFile(event.target.files?.[0] ?? null)}
              />
              {pdfFile ? (
                <p className="text-xs text-muted-foreground">
                  Selected: {pdfFile.name}
                </p>
              ) : null}
            </div>
            <SubmitButton pending={isPending} onClick={() => void submitPdf()}>
              Upload PDF
            </SubmitButton>
          </TabsContent>

          <TabsContent value="website" className="grid gap-4 pt-2">
            <Field
              id="website-url"
              label="Website URL"
              value={websiteUrl}
              onChange={setWebsiteUrl}
              placeholder="https://example.com"
              disabled={isPending}
            />
            <Field
              id="website-title"
              label="Title (optional)"
              value={websiteTitle}
              onChange={setWebsiteTitle}
              placeholder="Optional title"
              disabled={isPending}
            />
            <SubmitButton
              pending={isPending}
              onClick={() => void submitWebsite()}
            >
              Import website
            </SubmitButton>
          </TabsContent>

          <TabsContent value="youtube" className="grid gap-4 pt-2">
            <Field
              id="youtube-url"
              label="YouTube URL"
              value={youtubeUrl}
              onChange={setYoutubeUrl}
              placeholder="https://www.youtube.com/watch?v=..."
              disabled={isPending}
            />
            <Field
              id="youtube-title"
              label="Title (optional)"
              value={youtubeTitle}
              onChange={setYoutubeTitle}
              placeholder="Optional title"
              disabled={isPending}
            />
            <SubmitButton
              pending={isPending}
              onClick={() => void submitYoutube()}
            >
              Import transcript
            </SubmitButton>
          </TabsContent>
        </Tabs>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </DialogContent>
    </Dialog>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  disabled,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
      />
    </div>
  );
}

function FieldTextarea({
  id,
  label,
  value,
  onChange,
  placeholder,
  disabled,
  rows = 6,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  rows?: number;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        maxLength={500}
      />
    </div>
  );
}

function SubmitButton({
  children,
  pending,
  onClick,
}: {
  children: React.ReactNode;
  pending: boolean;
  onClick: () => void;
}) {
  return (
    <Button type="button" disabled={pending} onClick={onClick}>
      {pending ? <Spinner /> : null}
      {children}
    </Button>
  );
}
