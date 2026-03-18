"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface SiteSettings {
  name: string;
  tagline: string;
  description: string;
  logo: string;
  favicon: string;
  theme: string;
  socialTwitter: string;
  socialLinkedin: string;
  socialGithub: string;
  socialYoutube: string;
  footerText: string;
  analyticsSnippet: string;
}

export default function SettingsAdmin() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>({
    name: "",
    tagline: "",
    description: "",
    logo: "",
    favicon: "",
    theme: "clean-blog",
    socialTwitter: "",
    socialLinkedin: "",
    socialGithub: "",
    socialYoutube: "",
    footerText: "",
    analyticsSnippet: "",
  });

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        setSettings({
          name: data.name || "",
          tagline: data.tagline || "",
          description: data.description || "",
          logo: data.logo || "",
          favicon: data.favicon || "",
          theme: data.theme || "clean-blog",
          socialTwitter: data.socialTwitter || "",
          socialLinkedin: data.socialLinkedin || "",
          socialGithub: data.socialGithub || "",
          socialYoutube: data.socialYoutube || "",
          footerText: data.footerText || "",
          analyticsSnippet: data.analyticsSnippet || "",
        });
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setSuccess(true);
        router.refresh();
        setTimeout(() => setSuccess(false), 3000);
      }
    } finally {
      setSaving(false);
    }
  };

  const update = (field: keyof SiteSettings, value: string) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Site Settings</h1>
          <p className="mt-1 text-sm text-gray-500">Configure your site details and social links</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>

      {success && (
        <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
          Settings saved successfully!
        </div>
      )}

      <div className="space-y-6">
        {/* General */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">General</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Site Name</label>
              <input
                type="text"
                value={settings.name}
                onChange={(e) => update("name", e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Tagline</label>
              <input
                type="text"
                value={settings.tagline}
                onChange={(e) => update("tagline", e.target.value)}
                placeholder="A short tagline for your site"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={settings.description}
                onChange={(e) => update("description", e.target.value)}
                rows={3}
                placeholder="Describe your site for search engines and AI"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
              <p className="mt-1 text-xs text-gray-400">
                Used in llms.txt, RSS feed, and meta tags
              </p>
            </div>
          </div>
        </div>

        {/* Branding */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Branding</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Logo URL</label>
              <input
                type="text"
                value={settings.logo}
                onChange={(e) => update("logo", e.target.value)}
                placeholder="https://..."
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Favicon URL</label>
              <input
                type="text"
                value={settings.favicon}
                onChange={(e) => update("favicon", e.target.value)}
                placeholder="https://..."
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Social Links</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Twitter / X</label>
              <input
                type="text"
                value={settings.socialTwitter}
                onChange={(e) => update("socialTwitter", e.target.value)}
                placeholder="https://x.com/..."
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">LinkedIn</label>
              <input
                type="text"
                value={settings.socialLinkedin}
                onChange={(e) => update("socialLinkedin", e.target.value)}
                placeholder="https://linkedin.com/in/..."
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">GitHub</label>
              <input
                type="text"
                value={settings.socialGithub}
                onChange={(e) => update("socialGithub", e.target.value)}
                placeholder="https://github.com/..."
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">YouTube</label>
              <input
                type="text"
                value={settings.socialYoutube}
                onChange={(e) => update("socialYoutube", e.target.value)}
                placeholder="https://youtube.com/@..."
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>
          </div>
        </div>

        {/* Footer & Analytics */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Footer & Analytics</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Footer Text</label>
              <input
                type="text"
                value={settings.footerText}
                onChange={(e) => update("footerText", e.target.value)}
                placeholder="e.g. All rights reserved."
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Analytics Snippet</label>
              <textarea
                value={settings.analyticsSnippet}
                onChange={(e) => update("analyticsSnippet", e.target.value)}
                rows={4}
                placeholder="Paste Google Analytics, Plausible, or other tracking script"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 font-mono text-xs focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>
          </div>
        </div>

        {/* AI Search Info */}
        <div className="rounded-xl border border-green-200 bg-green-50 p-6">
          <h2 className="mb-2 text-lg font-semibold text-green-900">AI Search Optimization</h2>
          <p className="mb-4 text-sm text-green-700">
            These are auto-generated from your site settings and content. No configuration needed.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { label: "robots.txt", url: "/robots.txt", desc: "AI crawler permissions" },
              { label: "sitemap.xml", url: "/sitemap.xml", desc: "All published pages" },
              { label: "llms.txt", url: "/llms.txt", desc: "AI-readable site index" },
              { label: "feed.xml", url: "/feed.xml", desc: "RSS feed for AI discovery" },
            ].map((item) => (
              <a
                key={item.url}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-lg border border-green-200 bg-white px-4 py-3 text-sm transition-colors hover:border-green-300"
              >
                <div>
                  <p className="font-medium text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
