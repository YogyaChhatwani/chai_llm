import { apiFetch } from "@/lib/api";

export const SOURCE_TYPES = [
  "TEXT",
  "MARKDOWN",
  "WEBSITE",
  "YOUTUBE",
  "PDF",
] as const;

export const SOURCE_STATUSES = [
  "PENDING",
  "PROCESSING",
  "COMPLETED",
  "FAILED",
] as const;

export type SourceType = (typeof SOURCE_TYPES)[number];
export type SourceStatus = (typeof SOURCE_STATUSES)[number];

export const SOURCE_TYPE_LABELS: Record<SourceType, string> = {
  TEXT: "Text",
  MARKDOWN: "Markdown",
  WEBSITE: "Website",
  YOUTUBE: "YouTube",
  PDF: "PDF",
};

export const SOURCE_STATUS_LABELS: Record<SourceStatus, string> = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  COMPLETED: "Ready",
  FAILED: "Failed",
};

export type Source = {
  id: string;
  workspaceId: string;
  type: SourceType;
  title: string | null;
  description: string | null;
  url: string | null;
  status: SourceStatus;
  metadata: unknown;
  createdAt: string;
  updatedAt: string;
};

export type ListSourcesQuery = {
  query?: string;
  type?: SourceType;
  status?: SourceStatus;
};

export type CreateTextSourceInput = {
  type: "TEXT" | "MARKDOWN";
  title: string;
  description?: string;
};

export type ImportUrlInput = {
  title?: string;
  url: string;
};

export function listSources(workspaceId: string, filters: ListSourcesQuery = {}) {
  const params = new URLSearchParams();

  if (filters.query) {
    params.set("query", filters.query);
  }
  if (filters.type) {
    params.set("type", filters.type);
  }
  if (filters.status) {
    params.set("status", filters.status);
  }

  const query = params.toString();
  const path = `/api/v1/workspaces/${workspaceId}/sources`;

  return apiFetch<Source[]>(query ? `${path}?${query}` : path);
}

export function createTextSource(
  workspaceId: string,
  input: CreateTextSourceInput,
) {
  return apiFetch<Source>(`/api/v1/workspaces/${workspaceId}/sources`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function importWebsite(workspaceId: string, input: ImportUrlInput) {
  return apiFetch<Source>(
    `/api/v1/workspaces/${workspaceId}/sources/import/website`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

export function importYoutube(workspaceId: string, input: ImportUrlInput) {
  return apiFetch<Source>(
    `/api/v1/workspaces/${workspaceId}/sources/import/youtube`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

export function uploadPdf(workspaceId: string, file: File, title?: string) {
  const body = new FormData();
  body.append("file", file);

  if (title) {
    body.append("title", title);
  }

  return apiFetch<Source>(
    `/api/v1/workspaces/${workspaceId}/sources/upload`,
    {
      method: "POST",
      body,
    },
  );
}

export function getSource(workspaceId: string, sourceId: string) {
  return apiFetch<Source>(
    `/api/v1/workspaces/${workspaceId}/sources/${sourceId}`,
  );
}

export type SourceMetadata = {
  fileUrl?: string;
  fileName?: string;
  processingError?: string;
  chunkCount?: number;
};

export function parseSourceMetadata(value: unknown): SourceMetadata {
  if (!value || typeof value !== "object") {
    return {};
  }

  const metadata = value as Record<string, unknown>;

  return {
    fileUrl: typeof metadata.fileUrl === "string" ? metadata.fileUrl : undefined,
    fileName:
      typeof metadata.fileName === "string" ? metadata.fileName : undefined,
    processingError:
      typeof metadata.processingError === "string"
        ? metadata.processingError
        : undefined,
    chunkCount:
      typeof metadata.chunkCount === "number" ? metadata.chunkCount : undefined,
  };
}

export function deleteSource(workspaceId: string, sourceId: string) {
  return apiFetch<void>(
    `/api/v1/workspaces/${workspaceId}/sources/${sourceId}`,
    {
      method: "DELETE",
    },
  );
}
