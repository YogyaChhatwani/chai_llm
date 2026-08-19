"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

function MindmapViewer({ content }: { content: Record<string, unknown> }) {
  const nodes = Array.isArray(content.nodes)
    ? content.nodes.flatMap((node) => {
        const record = asRecord(node);
        if (!record) {
          return [];
        }

        return [
          {
            id: typeof record.id === "string" ? record.id : "",
            label: typeof record.label === "string" ? record.label : "",
          },
        ];
      })
    : [];
  const edges = Array.isArray(content.edges)
    ? content.edges.flatMap((edge) => {
        const record = asRecord(edge);
        if (!record) {
          return [];
        }

        return [
          {
            source: typeof record.source === "string" ? record.source : "",
            target: typeof record.target === "string" ? record.target : "",
          },
        ];
      })
    : [];
  const labels = new Map(nodes.map((node) => [node.id, node.label]));

  return (
    <div className="grid gap-4 text-sm">
      <div>
        <p className="mb-2 font-medium">Topics</p>
        <ul className="list-disc space-y-1 pl-5">
          {nodes.map((node) => (
            <li key={node.id || node.label}>{node.label}</li>
          ))}
        </ul>
      </div>
      {edges.length ? (
        <div>
          <p className="mb-2 font-medium">Connections</p>
          <ul className="list-disc space-y-1 pl-5">
            {edges.map((edge) => (
              <li key={`${edge.source}-${edge.target}`}>
                {labels.get(edge.source) ?? edge.source} →{" "}
                {labels.get(edge.target) ?? edge.target}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
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
