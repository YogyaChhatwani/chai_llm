"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Code2,
  FileCode,
  Layers,
  Network,
  Shield,
  TestTube,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Artifact } from "@/lib/artifacts";

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

export function ArtifactViewer({ artifact }: { artifact: Artifact }) {
  const content = asRecord(artifact.content);

  if (!content) {
    return (
      <p className="text-sm text-muted-foreground">No content yet.</p>
    );
  }

  switch (artifact.type) {
    case "SUMMARY":
      return (
        <pre className="whitespace-pre-wrap font-sans text-sm">
          {typeof content.markdown === "string" ? content.markdown : ""}
        </pre>
      );
    case "TAKEAWAY":
      return (
        <ul className="list-disc space-y-2 pl-5 text-sm">
          {asStringArray(content.items).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    case "FLASHCARDS":
      return <FlashcardsViewer content={content} />;
    case "QUIZ":
      return <QuizViewer content={content} />;
    case "MINDMAP":
      return <MindmapViewer content={content} />;
    case "REPORT":
      return <ReportViewer content={content} />;
    default:
      return null;
  }
}

function FlashcardsViewer({ content }: { content: Record<string, unknown> }) {
  const cards = Array.isArray(content.cards)
    ? content.cards.flatMap((card) => {
        const record = asRecord(card);
        if (!record) {
          return [];
        }

        return [
          {
            front: typeof record.front === "string" ? record.front : "",
            back: typeof record.back === "string" ? record.back : "",
          },
        ];
      })
    : [];
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const card = cards[index];

  if (!card) {
    return <p className="text-sm text-muted-foreground">No flashcards.</p>;
  }

  return (
    <div className="grid gap-3">
      <button
        type="button"
        className="min-h-36 rounded-2xl border p-6 text-left"
        onClick={() => setFlipped((value) => !value)}
      >
        <p className="text-xs text-muted-foreground">
          {flipped ? "Back" : "Front"} · click to flip
        </p>
        <p className="mt-2 text-sm">{flipped ? card.back : card.front}</p>
      </button>
      <div className="flex items-center justify-between gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={index === 0}
          onClick={() => {
            setIndex((value) => value - 1);
            setFlipped(false);
          }}
        >
          Previous
        </Button>
        <span className="text-xs text-muted-foreground">
          {index + 1} / {cards.length}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={index >= cards.length - 1}
          onClick={() => {
            setIndex((value) => value + 1);
            setFlipped(false);
          }}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

function QuizViewer({ content }: { content: Record<string, unknown> }) {
  const questions = Array.isArray(content.questions)
    ? content.questions.flatMap((question) => {
        const record = asRecord(question);
        if (!record) {
          return [];
        }

        return [
          {
            question:
              typeof record.question === "string" ? record.question : "",
            options: asStringArray(record.options),
            correctIndex:
              typeof record.correctIndex === "number"
                ? record.correctIndex
                : 0,
            explanation:
              typeof record.explanation === "string"
                ? record.explanation
                : "",
          },
        ];
      })
    : [];
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});

  if (!questions.length) {
    return <p className="text-sm text-muted-foreground">No questions.</p>;
  }

  return (
    <div className="grid gap-4">
      {questions.map((question, index) => (
        <Card key={`${question.question}-${index}`}>
          <CardHeader>
            <CardTitle className="text-base">
              {index + 1}. {question.question}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <ul className="grid gap-1 text-sm">
              {question.options.map((option, optionIndex) => (
                <li key={option}>
                  {String.fromCharCode(65 + optionIndex)}. {option}
                </li>
              ))}
            </ul>
            {revealed[index] ? (
              <div className="text-sm">
                <p>
                  Answer:{" "}
                  {question.options[question.correctIndex] ?? "Unknown"}
                </p>
                {question.explanation ? (
                  <p className="mt-1 text-muted-foreground">
                    {question.explanation}
                  </p>
                ) : null}
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-fit"
                onClick={() =>
                  setRevealed((current) => ({ ...current, [index]: true }))
                }
              >
                Show answer
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

type MindmapNode = {
  id: string;
  label: string;
  category?: "root" | "domain" | "module" | "component";
  files?: string[];
  apis?: string[];
  dependencies?: string[];
  issues?: string[];
  complexity?: "low" | "medium" | "high";
  testCoverage?: "none" | "partial" | "good";
  children?: MindmapNode[];
};

function parseMindmapNode(raw: unknown): MindmapNode | null {
  const r = asRecord(raw);
  if (!r) return null;

  return {
    id: typeof r.id === "string" ? r.id : "",
    label: typeof r.label === "string" ? r.label : "",
    category:
      typeof r.category === "string" &&
      ["root", "domain", "module", "component"].includes(r.category)
        ? (r.category as MindmapNode["category"])
        : undefined,
    files: asStringArray(r.files),
    apis: asStringArray(r.apis),
    dependencies: asStringArray(r.dependencies),
    issues: asStringArray(r.issues),
    complexity:
      typeof r.complexity === "string" &&
      ["low", "medium", "high"].includes(r.complexity)
        ? (r.complexity as MindmapNode["complexity"])
        : undefined,
    testCoverage:
      typeof r.testCoverage === "string" &&
      ["none", "partial", "good"].includes(r.testCoverage)
        ? (r.testCoverage as MindmapNode["testCoverage"])
        : undefined,
    children: Array.isArray(r.children)
      ? r.children.flatMap((c) => {
          const parsed = parseMindmapNode(c);
          return parsed ? [parsed] : [];
        })
      : [],
  };
}

const complexityColors = {
  low: "text-green-500",
  medium: "text-amber-500",
  high: "text-red-500",
} as const;

const coverageColors = {
  none: "text-red-500",
  partial: "text-amber-500",
  good: "text-green-500",
} as const;

function MindmapTreeNode({
  node,
  depth,
}: {
  node: MindmapNode;
  depth: number;
}) {
  const [expanded, setExpanded] = useState(depth < 2);
  const [detailOpen, setDetailOpen] = useState(false);
  const hasChildren = (node.children?.length ?? 0) > 0;
  const hasMetadata =
    (node.files?.length ?? 0) > 0 ||
    (node.apis?.length ?? 0) > 0 ||
    (node.dependencies?.length ?? 0) > 0 ||
    (node.issues?.length ?? 0) > 0 ||
    node.complexity ||
    node.testCoverage;

  return (
    <div className={cn(depth > 0 && "ml-4 border-l border-border/50 pl-3")}>
      <div className="group flex items-center gap-1.5 py-1">
        {hasChildren ? (
          <button
            type="button"
            className="shrink-0 rounded p-0.5 text-muted-foreground hover:bg-accent"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? (
              <ChevronDown className="size-3.5" />
            ) : (
              <ChevronRight className="size-3.5" />
            )}
          </button>
        ) : (
          <span className="w-[18px]" />
        )}

        <button
          type="button"
          className={cn(
            "flex items-center gap-2 rounded-md px-2 py-1 text-left text-sm transition-colors",
            hasMetadata
              ? "hover:bg-accent cursor-pointer"
              : "cursor-default",
            detailOpen && "bg-accent",
          )}
          onClick={() => hasMetadata && setDetailOpen((v) => !v)}
        >
          <NodeIcon category={node.category} />
          <span className="font-medium">{node.label}</span>
          {node.complexity ? (
            <span
              className={cn(
                "text-[10px] font-mono uppercase",
                complexityColors[node.complexity],
              )}
            >
              {node.complexity}
            </span>
          ) : null}
          {node.testCoverage ? (
            <TestCoverageBadge coverage={node.testCoverage} />
          ) : null}
          {(node.issues?.length ?? 0) > 0 ? (
            <AlertTriangle className="size-3 text-amber-500" />
          ) : null}
        </button>
      </div>

      {/* detail panel */}
      {detailOpen && hasMetadata ? (
        <div className="mb-2 ml-[18px] grid gap-2 rounded-lg border bg-card p-3 text-xs">
          {(node.files?.length ?? 0) > 0 ? (
            <MetadataSection
              icon={<FileCode className="size-3 text-chart-1" />}
              label="Files"
              items={node.files!}
              mono
            />
          ) : null}
          {(node.apis?.length ?? 0) > 0 ? (
            <MetadataSection
              icon={<Network className="size-3 text-chart-2" />}
              label="APIs"
              items={node.apis!}
              mono
            />
          ) : null}
          {(node.dependencies?.length ?? 0) > 0 ? (
            <MetadataSection
              icon={<Layers className="size-3 text-chart-3" />}
              label="Dependencies"
              items={node.dependencies!}
            />
          ) : null}
          {(node.issues?.length ?? 0) > 0 ? (
            <MetadataSection
              icon={<AlertTriangle className="size-3 text-amber-500" />}
              label="Potential Issues"
              items={node.issues!}
            />
          ) : null}
          {node.complexity ? (
            <div className="flex items-center gap-2">
              <Shield className="size-3 text-muted-foreground" />
              <span className="text-muted-foreground">Complexity:</span>
              <span
                className={cn(
                  "font-medium uppercase",
                  complexityColors[node.complexity],
                )}
              >
                {node.complexity}
              </span>
            </div>
          ) : null}
          {node.testCoverage ? (
            <div className="flex items-center gap-2">
              <TestTube className="size-3 text-muted-foreground" />
              <span className="text-muted-foreground">Test Coverage:</span>
              <span
                className={cn(
                  "font-medium uppercase",
                  coverageColors[node.testCoverage],
                )}
              >
                {node.testCoverage}
              </span>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* children */}
      {expanded && hasChildren
        ? node.children!.map((child) => (
            <MindmapTreeNode
              key={child.id || child.label}
              node={child}
              depth={depth + 1}
            />
          ))
        : null}
    </div>
  );
}

function NodeIcon({
  category,
}: {
  category?: MindmapNode["category"];
}) {
  switch (category) {
    case "root":
      return <Code2 className="size-3.5 text-primary" />;
    case "domain":
      return <Layers className="size-3.5 text-chart-1" />;
    case "module":
      return <Network className="size-3.5 text-chart-2" />;
    case "component":
      return <FileCode className="size-3.5 text-chart-3" />;
    default:
      return <span className="size-1.5 rounded-full bg-muted-foreground" />;
  }
}

function TestCoverageBadge({
  coverage,
}: {
  coverage: "none" | "partial" | "good";
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "px-1 py-0 text-[9px] font-mono uppercase leading-tight",
        coverageColors[coverage],
      )}
    >
      {coverage === "none" ? "no tests" : coverage === "partial" ? "partial" : "tested"}
    </Badge>
  );
}

function MetadataSection({
  icon,
  label,
  items,
  mono,
}: {
  icon: React.ReactNode;
  label: string;
  items: string[];
  mono?: boolean;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <ul className="grid gap-0.5 pl-4">
        {items.map((item) => (
          <li
            key={item}
            className={cn(
              "text-foreground",
              mono && "font-mono text-[11px]",
            )}
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function MindmapViewer({ content }: { content: Record<string, unknown> }) {
  const root = parseMindmapNode(content.root);

  if (!root) {
    // fallback for old flat format
    const nodes = Array.isArray(content.nodes)
      ? content.nodes.flatMap((node) => {
          const record = asRecord(node);
          if (!record) return [];
          return [
            {
              id: typeof record.id === "string" ? record.id : "",
              label: typeof record.label === "string" ? record.label : "",
            },
          ];
        })
      : [];

    if (!nodes.length) {
      return <p className="text-sm text-muted-foreground">No mindmap data.</p>;
    }

    return (
      <ul className="list-disc space-y-1 pl-5 text-sm">
        {nodes.map((n) => (
          <li key={n.id || n.label}>{n.label}</li>
        ))}
      </ul>
    );
  }

  return (
    <div className="text-sm">
      <MindmapTreeNode node={root} depth={0} />
    </div>
  );
}

function ReportViewer({ content }: { content: Record<string, unknown> }) {
  if (typeof content.markdown === "string" && content.markdown.trim()) {
    return (
      <pre className="whitespace-pre-wrap font-sans text-sm">
        {content.markdown}
      </pre>
    );
  }

  const sections = Array.isArray(content.sections)
    ? content.sections.flatMap((section) => {
        const record = asRecord(section);
        if (!record) {
          return [];
        }

        return [
          {
            title: typeof record.title === "string" ? record.title : "",
            content: typeof record.content === "string" ? record.content : "",
          },
        ];
      })
    : [];

  return (
    <div className="grid gap-4">
      {sections.map((section) => (
        <div key={section.title}>
          <h3 className="font-medium">{section.title}</h3>
          <p className="mt-1 whitespace-pre-wrap text-sm">{section.content}</p>
        </div>
      ))}
    </div>
  );
}
