import { apiFetch } from "@/lib/api";

export const ARTIFACT_TYPES = [
  "SUMMARY",
  "TAKEAWAY",
  "FLASHCARDS",
  "QUIZ",
  "MINDMAP",
  "REPORT",
] as const;

export type ArtifactType = (typeof ARTIFACT_TYPES)[number];

export type ArtifactStatus =
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED";

export type Artifact = {
  id: string;
  workspaceId: string;
  type: ArtifactType;
  title: string;
  content: unknown;
  sourceIds: string[];
  status: ArtifactStatus;
  metadata: unknown;
  createdAt: string;
  updatedAt: string;
};

export type CreateArtifactInput = {
  type: ArtifactType;
  title?: string;
  sourceIds?: string[];
};

export const ARTIFACT_LABELS: Record<ArtifactType, string> = {
  SUMMARY: "Summary",
  TAKEAWAY: "Key takeaways",
  FLASHCARDS: "Flashcards",
  QUIZ: "Quiz",
  MINDMAP: "Mind map",
  REPORT: "Report",
};

export const ARTIFACT_DESCRIPTIONS: Record<ArtifactType, string> = {
  SUMMARY: "A markdown overview of your sources",
  TAKEAWAY: "Short key points to remember",
  FLASHCARDS: "Front and back study cards",
  QUIZ: "Multiple-choice questions with answers",
  MINDMAP: "Topics and how they connect",
  REPORT: "A longer structured write-up",
};

export function listArtifacts(workspaceId: string) {
  return apiFetch<Artifact[]>(
    `/api/v1/workspaces/${workspaceId}/artifacts`,
  );
}

export function getArtifact(workspaceId: string, artifactId: string) {
  return apiFetch<Artifact>(
    `/api/v1/workspaces/${workspaceId}/artifacts/${artifactId}`,
  );
}

export function createArtifact(
  workspaceId: string,
  input: CreateArtifactInput,
) {
  return apiFetch<Artifact>(
    `/api/v1/workspaces/${workspaceId}/artifacts`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

export function deleteArtifact(workspaceId: string, artifactId: string) {
  return apiFetch<void>(
    `/api/v1/workspaces/${workspaceId}/artifacts/${artifactId}`,
    { method: "DELETE" },
  );
}
