"use client";

import { useState, useRef, useCallback } from "react";

interface AIAssistantProps {
  pageTitle: string;
  contentType: string;
  hubName?: string;
  currentContent?: string;
  onInsert: (html: string) => void;
  onUpdateMeta?: (meta: { metaTitle?: string; metaDescription?: string; excerpt?: string }) => void;
}

type AIAction = "write" | "improve" | "expand" | "shorten" | "seo" | "outline" | "faq" | "hub-suggestions";

const QUICK_ACTIONS: { action: AIAction; label: string; icon: string; description: string; needsContent?: boolean; plainText?: boolean }[] = [
  { action: "write", label: "Write", icon: "✍️", description: "Generate content from a prompt" },
  { action: "outline", label: "Outline", icon: "📋", description: "Create a structured outline" },
  { action: "faq", label: "FAQ", icon: "❓", description: "Generate FAQ section" },
  { action: "improve", label: "Improve", icon: "✨", description: "Enhance existing content", needsContent: true },
  { action: "expand", label: "Expand", icon: "📝", description: "Add more detail and depth", needsContent: true },
  { action: "shorten", label: "Shorten", icon: "✂️", description: "Make content more concise", needsContent: true },
  { action: "seo", label: "SEO Tips", icon: "🔍", description: "Get optimization suggestions", plainText: true },
  { action: "hub-suggestions", label: "Hub Ideas", icon: "🎯", description: "Suggest spoke articles", plainText: true },
];

export default function AIAssistant({
  pageTitle,
  contentType,
  hubName,
  currentContent,
  onInsert,
}: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeAction, setActiveAction] = useState<AIAction | null>(null);
  const [error, setError] = useState("");
  const abortRef = useRef<AbortController | null>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  const streamAI = useCallback(async (action: AIAction, customPrompt?: string) => {
    setIsStreaming(true);
    setOutput("");
    setError("");
    setActiveAction(action);

    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/ai/write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          prompt: customPrompt || prompt,
          content: currentContent || "",
          pageTitle,
          hubName: hubName || "",
          contentType,
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "AI request failed");
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      if (!reader) throw new Error("No response body");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") break;

            try {
              const parsed = JSON.parse(data);
              if (parsed.error) throw new Error(parsed.error);
              if (parsed.text) {
                accumulated += parsed.text;
                setOutput(accumulated);

                // Auto-scroll output
                if (outputRef.current) {
                  outputRef.current.scrollTop = outputRef.current.scrollHeight;
                }
              }
            } catch {
              // Skip malformed SSE lines
            }
          }
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        // User cancelled
      } else {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    } finally {
      setIsStreaming(false);
      setActiveAction(null);
    }
  }, [prompt, currentContent, pageTitle, hubName, contentType]);

  const handleStop = () => {
    abortRef.current?.abort();
    setIsStreaming(false);
    setActiveAction(null);
  };

  const handleInsert = () => {
    if (output) {
      onInsert(output);
      setOutput("");
      setPrompt("");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
  };

  const isPlainTextAction = activeAction && QUICK_ACTIONS.find(a => a.action === activeAction)?.plainText;

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3 text-sm font-medium text-white shadow-lg transition-all hover:from-violet-700 hover:to-indigo-700 hover:shadow-xl"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" />
        </svg>
        AI Writer
      </button>
    );
  }

  return (
    <div className="fixed bottom-0 right-0 z-50 flex h-[600px] w-[440px] flex-col rounded-tl-2xl border-l border-t border-gray-200 bg-white shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600">
            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">AI Writer</h3>
            <p className="text-xs text-gray-400">Powered by Claude</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Quick Actions */}
      <div className="border-b border-gray-100 px-5 py-3">
        <div className="flex flex-wrap gap-1.5">
          {QUICK_ACTIONS.map((qa) => {
            const disabled = qa.needsContent && !currentContent;
            const isActive = activeAction === qa.action;
            return (
              <button
                key={qa.action}
                onClick={() => {
                  if (qa.action === "write" || qa.action === "outline" || qa.action === "faq") {
                    // These need a prompt — just set the action type for context
                    setActiveAction(qa.action);
                  } else {
                    streamAI(qa.action);
                  }
                }}
                disabled={disabled || isStreaming}
                title={qa.description}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-violet-100 text-violet-700 ring-1 ring-violet-200"
                    : disabled
                    ? "cursor-not-allowed bg-gray-50 text-gray-300"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <span>{qa.icon}</span>
                {qa.label}
              </button>
            );
          })}
        </div>
        {!hubName && (
          <p className="mt-2 text-xs text-amber-600">
            Tip: Assign this page to a Content Hub for hub-specific suggestions
          </p>
        )}
      </div>

      {/* Output Area */}
      <div
        ref={outputRef}
        className="flex-1 overflow-y-auto px-5 py-4"
      >
        {error && (
          <div className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {output ? (
          <div className="space-y-3">
            {isPlainTextAction ? (
              <div className="whitespace-pre-wrap rounded-xl bg-gray-50 p-4 text-sm text-gray-700 leading-relaxed">
                {output}
              </div>
            ) : (
              <div
                className="prose prose-sm max-w-none rounded-xl bg-gray-50 p-4 prose-headings:text-gray-900 prose-p:text-gray-600"
                dangerouslySetInnerHTML={{ __html: output }}
              />
            )}

            {!isStreaming && (
              <div className="flex items-center gap-2 pt-2">
                {!isPlainTextAction && (
                  <button
                    onClick={handleInsert}
                    className="flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Insert into editor
                  </button>
                )}
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                  </svg>
                  Copy
                </button>
                <button
                  onClick={() => { setOutput(""); setPrompt(""); }}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        ) : !isStreaming ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100">
              <svg className="h-6 w-6 text-violet-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
              </svg>
            </div>
            <p className="mt-3 text-sm font-medium text-gray-700">How can I help?</p>
            <p className="mt-1 text-xs text-gray-400">
              Type a prompt below or use the quick actions above
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-violet-600">
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Writing...
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-100 px-5 py-3">
        <div className="flex items-end gap-2">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (prompt.trim() && !isStreaming) {
                  streamAI(activeAction || "write", prompt);
                }
              }
            }}
            placeholder={
              activeAction === "outline"
                ? "What should the outline cover?"
                : activeAction === "faq"
                ? "What topic should the FAQ cover?"
                : "Ask AI to write something..."
            }
            rows={2}
            className="flex-1 resize-none rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-violet-400 focus:outline-none focus:ring-1 focus:ring-violet-400"
          />
          {isStreaming ? (
            <button
              onClick={handleStop}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600 hover:bg-red-200"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" rx="1" />
              </svg>
            </button>
          ) : (
            <button
              onClick={() => streamAI(activeAction || "write", prompt)}
              disabled={!prompt.trim()}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-40"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
