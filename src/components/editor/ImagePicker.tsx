"use client";

import { useState, useCallback, useEffect, useRef } from "react";

interface MediaItem {
  id: string;
  url: string;
  filename: string;
  alt: string;
  size: number;
  createdAt: string;
}

interface ImagePickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string, alt?: string) => void;
}

export function ImagePicker({ open, onClose, onSelect }: ImagePickerProps) {
  const [tab, setTab] = useState<"upload" | "library" | "url">("upload");
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch media library
  const fetchMedia = useCallback(() => {
    setLoading(true);
    fetch("/api/media")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setMedia(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (open) fetchMedia();
  }, [open, fetchMedia]);

  // Upload handler
  const uploadFile = useCallback(
    async (file: File) => {
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/media", {
          method: "POST",
          body: formData,
        });
        if (res.ok) {
          const data = await res.json();
          onSelect(data.url, data.alt || file.name);
        } else {
          const err = await res.json();
          alert(err.error || "Upload failed");
        }
      } catch {
        alert("Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [onSelect]
  );

  // Drag & drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        uploadFile(file);
      }
    },
    [uploadFile]
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Insert Image</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {(
            [
              { key: "upload", label: "Upload", icon: "M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" },
              { key: "library", label: "Media Library", icon: "m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" },
              { key: "url", label: "URL", icon: "M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors ${
                tab === t.key
                  ? "border-b-2 border-green-600 text-green-700"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d={t.icon} />
              </svg>
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6" style={{ minHeight: "320px" }}>
          {/* Upload Tab */}
          {tab === "upload" && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed py-16 transition-colors ${
                dragOver
                  ? "border-green-500 bg-green-50"
                  : "border-gray-300 bg-gray-50 hover:border-green-400 hover:bg-green-50/50"
              } ${uploading ? "pointer-events-none opacity-50" : ""}`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadFile(file);
                  e.target.value = "";
                }}
              />
              {uploading ? (
                <>
                  <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-green-600" />
                  <p className="mt-4 text-sm font-medium text-gray-600">
                    Uploading...
                  </p>
                </>
              ) : (
                <>
                  <svg
                    className="h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                    />
                  </svg>
                  <p className="mt-4 text-sm font-medium text-gray-600">
                    Drag & drop an image here, or{" "}
                    <span className="text-green-600">click to browse</span>
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    JPEG, PNG, GIF, WebP, SVG — Max 10MB
                  </p>
                </>
              )}
            </div>
          )}

          {/* Media Library Tab */}
          {tab === "library" && (
            <>
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-green-600" />
                </div>
              ) : media.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <svg
                    className="h-12 w-12 text-gray-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z"
                    />
                  </svg>
                  <p className="mt-3 text-sm text-gray-500">
                    No images uploaded yet
                  </p>
                  <button
                    onClick={() => setTab("upload")}
                    className="mt-2 text-sm font-medium text-green-600 hover:text-green-700"
                  >
                    Upload your first image →
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-3 max-h-[300px] overflow-y-auto">
                  {media.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => onSelect(item.url, item.alt || item.filename)}
                      className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-100 transition-all hover:border-green-500 hover:ring-2 hover:ring-green-200"
                    >
                      <img
                        src={item.url}
                        alt={item.alt || item.filename}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                        <p className="w-full truncate px-2 py-1.5 text-[10px] text-white">
                          {item.filename}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {/* URL Tab */}
          {tab === "url" && (
            <div className="py-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && urlInput.trim()) {
                      onSelect(urlInput.trim());
                    }
                  }}
                />
                <button
                  onClick={() => {
                    if (urlInput.trim()) onSelect(urlInput.trim());
                  }}
                  disabled={!urlInput.trim()}
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                >
                  Insert
                </button>
              </div>
              {urlInput && (
                <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <p className="mb-2 text-xs text-gray-400">Preview</p>
                  <img
                    src={urlInput}
                    alt="Preview"
                    className="max-h-40 rounded-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
