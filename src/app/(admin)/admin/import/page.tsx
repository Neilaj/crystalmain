"use client";

import { useState, useEffect, useCallback } from "react";

type Step = "connect" | "scan" | "map" | "preview" | "importing" | "complete";
type Tab = "import" | "history";

interface ScanResult {
  connected: boolean;
  site: { name: string; description: string; url: string };
  content: {
    posts: number;
    pages: number;
    media: number;
    categories: Array<{ id: number; name: string; slug: string; description: string; count: number }>;
    tags: Array<{ id: number; name: string; slug: string; count: number }>;
    menus: Array<{ id: number; name: string }>;
  };
  suggestedHubs: Array<{
    name: string;
    slug: string;
    description: string;
    pageCount: number;
    wpCategoryId: number;
  }>;
}

interface PreviewItem {
  wpId: number;
  title: string;
  slug: string;
  type: string;
  contentType: string;
  status: string;
  hub: string | null;
  date: string;
  excerpt: string;
  hasImage: boolean;
  selected: boolean;
}

interface ImportReport {
  total: number;
  imported: number;
  skipped: number;
  errors: Array<{ title: string; error: string }>;
  hubsCreated: string[];
  mediaImported: number;
  redirects: Array<{ from: string; to: string }>;
}

interface ImportHistoryItem {
  id: string;
  source: string;
  sourceUrl: string;
  sourceName: string | null;
  status: "COMPLETED" | "ROLLED_BACK" | "PARTIAL";
  stagingMode: boolean;
  totalItems: number;
  importedCount: number;
  skippedCount: number;
  mediaCount: number;
  createdAt: string;
  _count: { pages: number };
}

export default function ImportPage() {
  const [activeTab, setActiveTab] = useState<Tab>("import");
  const [step, setStep] = useState<Step>("connect");
  const [wpUrl, setWpUrl] = useState("");
  const [wpUsername, setWpUsername] = useState("");
  const [wpAppPassword, setWpAppPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Scan results
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);

  // Import options
  const [importPosts, setImportPosts] = useState(true);
  const [importPages, setImportPages] = useState(true);
  const [importMedia, setImportMedia] = useState(true);

  // Category → Hub mapping
  const [categoryHubMap, setCategoryHubMap] = useState<Record<number, string>>({});

  // Staging mode
  const [stagingMode, setStagingMode] = useState(false);

  // Import history
  const [importHistory, setImportHistory] = useState<ImportHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Preview
  const [previewItems, setPreviewItems] = useState<PreviewItem[]>([]);

  // Report
  const [report, setReport] = useState<ImportReport | null>(null);
  const [importProgress, setImportProgress] = useState(0);

  // ─── Step 1: Connect to WordPress ───────────────────

  async function handleConnect() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/import/wordpress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "scan",
          wpUrl,
          wpUsername: wpUsername || undefined,
          wpAppPassword: wpAppPassword || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setScanResult(data);

      // Auto-create hub mapping from categories
      const autoMap: Record<number, string> = {};
      for (const hub of data.suggestedHubs) {
        autoMap[hub.wpCategoryId] = hub.name;
      }
      setCategoryHubMap(autoMap);

      setStep("scan");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Connection failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  // ─── Step 2: Preview content ────────────────────────

  async function handlePreview() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/import/wordpress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "preview",
          wpUrl,
          importPosts,
          importPages,
          importMedia,
          categoryHubMap,
          wpUsername: wpUsername || undefined,
          wpAppPassword: wpAppPassword || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setPreviewItems(
        data.pages.map((p: PreviewItem) => ({ ...p, selected: true }))
      );
      setStep("preview");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Preview failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  // ─── Load import history ─────────────────────────────

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch("/api/import/history");
      if (res.ok) {
        const data = await res.json();
        setImportHistory(data);
      }
    } catch {
      // silently fail
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // ─── Rollback an import ─────────────────────────────

  async function handleRollback(importId: string) {
    if (!confirm("Are you sure? This will delete all pages and hubs created by this import.")) return;
    setLoading(true);
    try {
      const res = await fetch("/api/import/rollback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ importId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      alert(`Rollback complete: ${data.report.pagesDeleted} pages deleted, ${data.report.hubsDeleted} hubs deleted`);
      loadHistory();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Rollback failed";
      alert(message);
    } finally {
      setLoading(false);
    }
  }

  // ─── Publish staged import ──────────────────────────

  async function handlePublish(importId: string) {
    if (!confirm("Publish all draft pages from this import?")) return;
    setLoading(true);
    try {
      const res = await fetch("/api/import/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ importId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      alert(`Published ${data.publishedCount} pages`);
      loadHistory();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Publish failed";
      alert(message);
    } finally {
      setLoading(false);
    }
  }

  // ─── Step 3: Execute import ─────────────────────────

  async function handleImport() {
    setStep("importing");
    setImportProgress(0);
    setError("");

    try {
      const selectedItems = previewItems.filter((item) => item.selected);

      // Simulate progress (real progress would use SSE/WebSockets)
      const progressInterval = setInterval(() => {
        setImportProgress((prev) => Math.min(prev + 2, 90));
      }, 500);

      const res = await fetch("/api/import/wordpress/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wpUrl,
          items: selectedItems,
          importMedia,
          categoryHubMap,
          stagingMode,
          sourceName: scanResult?.site?.name || wpUrl,
          wpUsername: wpUsername || undefined,
          wpAppPassword: wpAppPassword || undefined,
        }),
      });

      clearInterval(progressInterval);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setReport(data.report);
      setImportProgress(100);
      setStep("complete");
      loadHistory();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Import failed";
      setError(message);
      setStep("preview");
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Import from WordPress</h1>
        <p className="mt-1 text-gray-500">
          Migrate your WordPress content to Parsley in minutes
        </p>
        {/* Tabs */}
        <div className="mt-4 flex gap-1 rounded-lg bg-gray-100 p-1 w-fit">
          <button
            onClick={() => setActiveTab("import")}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              activeTab === "import" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            New Import
          </button>
          <button
            onClick={() => { setActiveTab("history"); loadHistory(); }}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              activeTab === "history" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            History {importHistory.length > 0 && `(${importHistory.length})`}
          </button>
        </div>
      </div>

      {/* ─── HISTORY TAB ──────────────────────────── */}
      {activeTab === "history" && (
        <div className="space-y-4">
          {historyLoading && (
            <div className="py-12 text-center text-gray-400">Loading history...</div>
          )}
          {!historyLoading && importHistory.length === 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
              <p className="text-gray-400">No imports yet</p>
              <button
                onClick={() => setActiveTab("import")}
                className="mt-3 text-sm text-green-600 hover:underline"
              >
                Start your first import →
              </button>
            </div>
          )}
          {importHistory.map((item) => (
            <div key={item.id} className="rounded-xl border border-gray-200 bg-white p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{item.sourceName || item.sourceUrl}</h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        item.status === "COMPLETED"
                          ? "bg-green-50 text-green-700"
                          : item.status === "ROLLED_BACK"
                          ? "bg-red-50 text-red-700"
                          : "bg-yellow-50 text-yellow-700"
                      }`}
                    >
                      {item.status === "ROLLED_BACK" ? "Rolled Back" : item.status}
                    </span>
                    {item.stagingMode && (
                      <span className="rounded-full bg-yellow-50 px-2 py-0.5 text-xs font-medium text-yellow-700">
                        Staging
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-400">
                    {item.sourceUrl} · {new Date(item.createdAt).toLocaleDateString()} at{" "}
                    {new Date(item.createdAt).toLocaleTimeString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  {item.status === "COMPLETED" && item.stagingMode && (
                    <button
                      onClick={() => handlePublish(item.id)}
                      disabled={loading}
                      className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
                    >
                      Publish All
                    </button>
                  )}
                  {item.status === "COMPLETED" && (
                    <button
                      onClick={() => handleRollback(item.id)}
                      disabled={loading}
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      Rollback
                    </button>
                  )}
                </div>
              </div>
              <div className="mt-4 grid grid-cols-4 gap-4 text-center">
                <div className="rounded-lg bg-gray-50 p-2">
                  <p className="text-lg font-bold text-gray-900">{item.importedCount}</p>
                  <p className="text-xs text-gray-500">Imported</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-2">
                  <p className="text-lg font-bold text-gray-900">{item.skippedCount}</p>
                  <p className="text-xs text-gray-500">Skipped</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-2">
                  <p className="text-lg font-bold text-gray-900">{item.mediaCount}</p>
                  <p className="text-xs text-gray-500">Media</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-2">
                  <p className="text-lg font-bold text-gray-900">{item._count.pages}</p>
                  <p className="text-xs text-gray-500">Live Pages</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── IMPORT TAB ───────────────────────────── */}
      {activeTab === "import" && <>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center gap-2">
          {[
            { key: "connect", label: "Connect" },
            { key: "scan", label: "Review" },
            { key: "preview", label: "Select" },
            { key: "complete", label: "Done" },
          ].map((s, i) => {
            const steps: Step[] = ["connect", "scan", "preview", "complete"];
            const currentIndex = steps.indexOf(step === "map" ? "scan" : step === "importing" ? "complete" : step);
            const stepIndex = i;
            const isActive = stepIndex <= currentIndex;

            return (
              <div key={s.key} className="flex items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                    isActive
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {stepIndex < currentIndex ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>
                <span className={`text-sm font-medium ${isActive ? "text-gray-900" : "text-gray-400"}`}>
                  {s.label}
                </span>
                {i < 3 && (
                  <div className={`h-0.5 w-12 ${isActive ? "bg-green-600" : "bg-gray-200"}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ─── Step: Connect ──────────────────────────── */}
      {step === "connect" && (
        <div className="rounded-xl border border-gray-200 bg-white p-8">
          <div className="mb-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Connect to your WordPress site</h2>
            <p className="mt-1 text-sm text-gray-500">
              Enter your WordPress site URL. Public content can be imported without credentials.
              For draft posts, provide Application Password credentials.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">WordPress Site URL *</label>
              <input
                type="url"
                value={wpUrl}
                onChange={(e) => setWpUrl(e.target.value)}
                placeholder="https://yoursite.com"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="mb-3 text-sm font-medium text-gray-700">
                Optional: Application Password (for drafts & private content)
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500">Username</label>
                  <input
                    type="text"
                    value={wpUsername}
                    onChange={(e) => setWpUsername(e.target.value)}
                    placeholder="admin"
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500">Application Password</label>
                  <input
                    type="password"
                    value={wpAppPassword}
                    onChange={(e) => setWpAppPassword(e.target.value)}
                    placeholder="xxxx xxxx xxxx xxxx"
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-400">
                Generate at: WordPress Admin → Users → Profile → Application Passwords
              </p>
            </div>

            <button
              onClick={handleConnect}
              disabled={!wpUrl || loading}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Scanning...
                </>
              ) : (
                <>Connect & Scan</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ─── Step: Scan Results ─────────────────────── */}
      {step === "scan" && scanResult && (
        <div className="space-y-6">
          {/* Site info */}
          <div className="rounded-xl border border-green-200 bg-green-50 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-green-900">
                  Connected to {scanResult.site.name}
                </h3>
                <p className="text-sm text-green-700">{scanResult.site.url}</p>
              </div>
            </div>
          </div>

          {/* Content summary */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Content Found</h3>
            <div className="grid grid-cols-3 gap-4">
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-4 hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={importPosts}
                  onChange={(e) => setImportPosts(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{scanResult.content.posts}</p>
                  <p className="text-sm text-gray-500">Posts</p>
                </div>
              </label>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-4 hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={importPages}
                  onChange={(e) => setImportPages(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{scanResult.content.pages}</p>
                  <p className="text-sm text-gray-500">Pages</p>
                </div>
              </label>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-4 hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={importMedia}
                  onChange={(e) => setImportMedia(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{scanResult.content.media}</p>
                  <p className="text-sm text-gray-500">Media Files</p>
                </div>
              </label>
            </div>
          </div>

          {/* Staging mode toggle */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <label className="flex cursor-pointer items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Staging Mode</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Import all content as <strong>drafts</strong> first. Review everything in the admin, then bulk-publish when ready. Recommended for large sites.
                </p>
              </div>
              <div className="ml-4">
                <button
                  type="button"
                  role="switch"
                  aria-checked={stagingMode}
                  onClick={() => setStagingMode(!stagingMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    stagingMode ? "bg-green-600" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      stagingMode ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </label>
            {stagingMode && (
              <div className="mt-3 rounded-lg bg-yellow-50 border border-yellow-200 p-3 text-sm text-yellow-700">
                All imported pages will be saved as <strong>drafts</strong>. You can review and publish them from the Import History tab.
              </div>
            )}
          </div>

          {/* Category → Hub mapping */}
          {scanResult.suggestedHubs.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                Map Categories → Content Hubs
              </h3>
              <p className="mb-4 text-sm text-gray-500">
                WordPress categories become Parsley Content Hubs for AI search optimization.
                Uncheck any you don&apos;t want to create as hubs.
              </p>
              <div className="space-y-3">
                {scanResult.suggestedHubs.map((hub) => (
                  <label
                    key={hub.wpCategoryId}
                    className="flex items-center justify-between rounded-lg border border-gray-200 p-3 hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={!!categoryHubMap[hub.wpCategoryId]}
                        onChange={(e) => {
                          setCategoryHubMap((prev) => {
                            const next = { ...prev };
                            if (e.target.checked) {
                              next[hub.wpCategoryId] = hub.name;
                            } else {
                              delete next[hub.wpCategoryId];
                            }
                            return next;
                          });
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{hub.name}</p>
                        {hub.description && (
                          <p className="text-xs text-gray-400">{hub.description}</p>
                        )}
                      </div>
                    </div>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                      {hub.pageCount} posts
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setStep("connect")}
              className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={handlePreview}
              disabled={loading || (!importPosts && !importPages)}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Loading preview...
                </>
              ) : (
                <>Preview Import →</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ─── Step: Preview & Select ─────────────────── */}
      {step === "preview" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Select Content to Import
                </h3>
                <p className="text-sm text-gray-500">
                  {previewItems.filter((i) => i.selected).length} of {previewItems.length} items selected
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPreviewItems((items) => items.map((i) => ({ ...i, selected: true })))}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                >
                  Select All
                </button>
                <button
                  onClick={() => setPreviewItems((items) => items.map((i) => ({ ...i, selected: false })))}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                >
                  Deselect All
                </button>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              <table className="w-full">
                <thead className="sticky top-0 bg-gray-50">
                  <tr className="text-left text-xs font-medium uppercase text-gray-500">
                    <th className="p-3 w-8"></th>
                    <th className="p-3">Title</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Hub</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {previewItems.map((item, index) => (
                    <tr key={item.wpId} className="hover:bg-gray-50">
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={item.selected}
                          onChange={(e) => {
                            setPreviewItems((items) => {
                              const updated = [...items];
                              updated[index] = { ...updated[index], selected: e.target.checked };
                              return updated;
                            });
                          }}
                          className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                      </td>
                      <td className="p-3">
                        <p className="font-medium text-gray-900 text-sm">{item.title}</p>
                        <p className="text-xs text-gray-400">/{item.slug}</p>
                      </td>
                      <td className="p-3">
                        <select
                          value={item.contentType}
                          onChange={(e) => {
                            setPreviewItems((items) => {
                              const updated = [...items];
                              updated[index] = { ...updated[index], contentType: e.target.value };
                              return updated;
                            });
                          }}
                          className="rounded border border-gray-200 px-2 py-1 text-xs text-gray-600"
                        >
                          <option value="ARTICLE">Article</option>
                          <option value="PAGE">Page</option>
                          <option value="FAQ">FAQ</option>
                          <option value="LANDING">Landing</option>
                          <option value="SERVICE">Service</option>
                          <option value="PRODUCT">Product</option>
                          <option value="PORTFOLIO">Portfolio</option>
                          <option value="CONTACT">Contact</option>
                        </select>
                      </td>
                      <td className="p-3">
                        {item.hub ? (
                          <span className="rounded-full bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700">
                            {item.hub}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </td>
                      <td className="p-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            item.status === "PUBLISHED"
                              ? "bg-green-50 text-green-700"
                              : "bg-yellow-50 text-yellow-700"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {importMedia && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
              <strong>Media:</strong> Image references will be imported. Images will remain hosted on your WordPress server until you re-upload them to Parsley&apos;s media library.
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setStep("scan")}
              className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={handleImport}
              disabled={previewItems.filter((i) => i.selected).length === 0}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              Import {previewItems.filter((i) => i.selected).length} Items →
            </button>
          </div>
        </div>
      )}

      {/* ─── Step: Importing ────────────────────────── */}
      {step === "importing" && (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <svg className="mx-auto h-12 w-12 animate-spin text-green-600" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <h3 className="mt-4 text-lg font-semibold text-gray-900">Importing your content...</h3>
          <p className="mt-1 text-sm text-gray-500">This may take a few minutes for large sites</p>

          <div className="mx-auto mt-6 max-w-md">
            <div className="h-2 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-green-600 transition-all duration-500"
                style={{ width: `${importProgress}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-gray-400">{importProgress}% complete</p>
          </div>
        </div>
      )}

      {/* ─── Step: Complete ─────────────────────────── */}
      {step === "complete" && report && (
        <div className="space-y-6">
          {/* Success banner */}
          <div className="rounded-xl border border-green-200 bg-green-50 p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h3 className="mt-4 text-xl font-bold text-green-900">Import Complete!</h3>
            <p className="mt-1 text-green-700">
              Successfully imported {report.imported} items from WordPress
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{report.imported}</p>
              <p className="text-sm text-gray-500">Imported</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
              <p className="text-2xl font-bold text-yellow-600">{report.skipped}</p>
              <p className="text-sm text-gray-500">Skipped</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{report.hubsCreated.length}</p>
              <p className="text-sm text-gray-500">Hubs Created</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
              <p className="text-2xl font-bold text-purple-600">{report.mediaImported}</p>
              <p className="text-sm text-gray-500">Media Files</p>
            </div>
          </div>

          {/* Hubs created */}
          {report.hubsCreated.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h4 className="mb-3 font-semibold text-gray-900">Content Hubs Created</h4>
              <div className="flex flex-wrap gap-2">
                {report.hubsCreated.map((hub) => (
                  <span
                    key={hub}
                    className="rounded-full bg-purple-50 px-3 py-1 text-sm font-medium text-purple-700"
                  >
                    {hub}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-sm text-gray-500">
                Your WordPress categories are now Content Hubs with auto-generated Schema.org structured data.
              </p>
            </div>
          )}

          {/* Errors */}
          {report.errors.length > 0 && (
            <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-6">
              <h4 className="mb-3 font-semibold text-yellow-900">
                Issues ({report.errors.length})
              </h4>
              <div className="space-y-2">
                {report.errors.map((err, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-yellow-600">⚠</span>
                    <span className="text-yellow-800">
                      <strong>{err.title}:</strong> {err.error}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Next steps */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h4 className="mb-3 font-semibold text-gray-900">Next Steps</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <span className="text-green-500">→</span>
                Review your imported pages at <a href="/admin/pages" className="text-green-600 underline">/admin/pages</a>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">→</span>
                Check your Content Hubs at <a href="/admin/hubs" className="text-green-600 underline">/admin/hubs</a>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">→</span>
                Assign a pillar page to each hub for maximum AI search impact
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">→</span>
                Set up 301 redirects from your old WordPress URLs if changing domains
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">→</span>
                Review content types — you can change any page from Article to FAQ, Service, etc.
              </li>
            </ul>
          </div>

          <div className="flex gap-3">
            <a
              href="/admin/pages"
              className="rounded-lg bg-green-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-green-700"
            >
              View Imported Pages
            </a>
            <a
              href="/admin/hubs"
              className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              View Content Hubs
            </a>
          </div>
        </div>
      )}

      </>}
    </div>
  );
}
