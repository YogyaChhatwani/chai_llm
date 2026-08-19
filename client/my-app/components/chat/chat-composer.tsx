"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";

type ChatComposerProps = {
  disabled: boolean;
  onSend: (text: string) => void;
};

export function ChatComposer({ disabled, onSend }: ChatComposerProps) {
  const [input, setInput] = useState("");

  function submit() {
    const text = input.trim();
    if (!text || disabled) {
      return;
    }

    onSend(text);
    setInput("");
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    submit();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2">
      <Textarea
        value={input}
        onChange={(event) => setInput(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask about your sources…"
        disabled={disabled}
        rows={2}
        className="min-h-12"
      />
      <Button type="submit" disabled={disabled || !input.trim()}>
        {disabled ? <Spinner /> : "Send"}
      </Button>
    </form>
  );
}
