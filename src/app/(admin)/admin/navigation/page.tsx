"use client";

import { useEffect, useState, useCallback } from "react";

interface NavItem {
  id: string;
  label: string;
  url: string;
  order: number;
  openNew: boolean;
  location: "HEADER" | "FOOTER" | "BOTH";
}

export default function NavigationAdmin() {
  const [items, setItems] = useState<NavItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newLocation, setNewLocation] = useState<"HEADER" | "FOOTER" | "BOTH">("HEADER");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editUrl, setEditUrl] = useState("");

  const fetchNav = useCallback(async () => {
    const res = await fetch("/api/navigation");
    const data = await res.json();
    setItems(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchNav();
  }, [fetchNav]);

  const handleAdd = async () => {
    if (!newLabel.trim() || !newUrl.trim()) return;
    setSaving(true);
    await fetch("/api/navigation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: newLabel, url: newUrl, location: newLocation }),
    });
    setNewLabel("");
    setNewUrl("");
    await fetchNav();
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this navigation item?")) return;
    await fetch(`/api/navigation/${id}`, { method: "DELETE" });
    await fetchNav();
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const newItems = [...items];
    [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
    const reordered = newItems.map((item, i) => ({ id: item.id, order: i }));
    setItems(newItems);
    await fetch("/api/navigation", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: reordered }),
    });
  };

  const handleMoveDown = async (index: number) => {
    if (index === items.length - 1) return;
    const newItems = [...items];
    [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
    const reordered = newItems.map((item, i) => ({ id: item.id, order: i }));
    setItems(newItems);
    await fetch("/api/navigation", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: reordered }),
    });
  };

  const startEdit = (item: NavItem) => {
    setEditingId(item.id);
    setEditLabel(item.label);
    setEditUrl(item.url);
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    await fetch(`/api/navigation/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: editLabel, url: editUrl }),
    });
    setEditingId(null);
    await fetchNav();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-green-500" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Navigation</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your site&apos;s navigation menu. Use arrows to reorder.
        </p>
      </div>

      {/* Current Items */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white">
        {items.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            No navigation items yet. Add one below.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {items.map((item, index) => (
              <div key={item.id} className="flex items-center gap-3 px-5 py-3">
                {/* Reorder arrows */}
                <div className="flex flex-col">
                  <button
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-20"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleMoveDown(index)}
                    disabled={index === items.length - 1}
                    className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-20"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>
                </div>

                {/* Content */}
                {editingId === item.id ? (
                  <div className="flex flex-1 items-center gap-2">
                    <input
                      type="text"
                      value={editLabel}
                      onChange={(e) => setEditLabel(e.target.value)}
                      className="w-32 rounded border border-gray-200 px-2 py-1 text-sm focus:border-green-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={editUrl}
                      onChange={(e) => setEditUrl(e.target.value)}
                      className="flex-1 rounded border border-gray-200 px-2 py-1 text-sm focus:border-green-500 focus:outline-none"
                    />
                    <button onClick={handleSaveEdit} className="text-sm font-medium text-green-600 hover:text-green-700">
                      Save
                    </button>
                    <button onClick={() => setEditingId(null)} className="text-sm text-gray-400 hover:text-gray-600">
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">{item.label}</span>
                      <span className="text-xs text-gray-400">{item.url}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        item.location === "HEADER" ? "bg-blue-50 text-blue-600" :
                        item.location === "FOOTER" ? "bg-purple-50 text-purple-600" :
                        "bg-green-50 text-green-600"
                      }`}>
                        {item.location === "BOTH" ? "Header + Footer" : item.location === "HEADER" ? "Header" : "Footer"}
                      </span>
                    </div>
                    <button
                      onClick={() => startEdit(item)}
                      className="text-xs text-gray-400 hover:text-gray-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-xs text-red-400 hover:text-red-600"
                    >
                      Remove
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add New */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="mb-3 text-sm font-semibold text-gray-700">Add Navigation Item</h3>
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-gray-500">Label</label>
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="e.g. About"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            />
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-gray-500">URL</label>
            <input
              type="text"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="e.g. /about"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Location</label>
            <select
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value as "HEADER" | "FOOTER" | "BOTH")}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            >
              <option value="HEADER">Header</option>
              <option value="FOOTER">Footer</option>
              <option value="BOTH">Both</option>
            </select>
          </div>
          <button
            onClick={handleAdd}
            disabled={saving || !newLabel.trim() || !newUrl.trim()}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? "Adding..." : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
