import React, { useState } from 'react';
import {
  X,
  DollarSign,
  Download,
  Copy,
  Check,
  Globe,
  TrendingUp,
  FileCode2,
  SearchCheck,
} from 'lucide-react';
import { TOOLS_CATALOG } from '../data/toolsCatalog';

interface MonetizationSeoModalProps {
  isOpen: boolean;
  onClose: () => void;
  publisherId: string;
  setPublisherId: (val: string) => void;
  showAds: boolean;
  setShowAds: (val: boolean) => void;
}

export const MonetizationSeoModal: React.FC<MonetizationSeoModalProps> = ({
  isOpen,
  onClose,
  publisherId,
  setPublisherId,
  showAds,
  setShowAds,
}) => {
  const [dailyVisitors, setDailyVisitors] = useState<number>(5000);
  const [toolsPerVisit, setToolsPerVisit] = useState<number>(2.4);
  const [rpmRate, setRpmRate] = useState<number>(14.5);
  const [copiedType, setCopiedType] = useState<string | null>(null);

  if (!isOpen) return null;

  const monthlyPageviews = Math.round(dailyVisitors * toolsPerVisit * 30);
  const estMonthlyUsd = Math.round((monthlyPageviews / 1000) * rpmRate);
  const estMonthlyInr = Math.round(estMonthlyUsd * 84.5);

  const cleanPubNum = publisherId.replace(/^ca-pub-/, '').replace(/[^0-9]/g, '') || '8924105739184620';
  const adsTxtContent = `google.com, pub-${cleanPubNum}, DIRECT, f08c47fec0942fa0`;

  const generateSitemapXml = () => {
    const today = new Date().toISOString().slice(0, 10);
    const urls = [
      `  <url>\n    <loc>https://bhvsy.github.io/24Tools/</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>`,
      ...TOOLS_CATALOG.map(
        (t) =>
          `  <url>\n    <loc>https://bhvsy.github.io/24Tools/?tool=${t.id}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.9</priority>\n  </url>`
      ),
    ];
    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join(
      '\n'
    )}\n</urlset>`;
  };

  const downloadTextFile = (filename: string, content: string, mime = 'text/plain') => {
    const blob = new Blob([content], { type: mime });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(key);
    setTimeout(() => setCopiedType(null), 1800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-display font-bold text-slate-900 dark:text-white">
              Bhvsy Tools — AdSense Monetization &amp; Google Search SEO Console
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Configured for https://bhvsy.github.io/ · Ready for Google AdSense, ads.txt, and Search Console Sitemap indexing
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[78vh] overflow-y-auto">
          {/* Section 1: AdSense Setup & Toggle */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  1. Google AdSense &amp; ads.txt Generator
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAds(!showAds)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                    showAds
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {showAds ? 'Ad Slots: Visible' : 'Ad Slots: Hidden'}
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Your AdSense Publisher ID
                </label>
                <input
                  type="text"
                  value={publisherId}
                  onChange={(e) => setPublisherId(e.target.value)}
                  placeholder="ca-pub-8924105739184620"
                  className="w-full px-3 py-2 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
                />
              </div>

              <div className="space-y-1.5">
                <span className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                  Generated ads.txt Line (Place at bhvsy.github.io/ads.txt)
                </span>
                <div className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono text-slate-800 dark:text-slate-200 break-all">
                  {adsTxtContent}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => downloadTextFile('ads.txt', adsTxtContent)}
                  className="flex-1 py-2 px-3 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download ads.txt
                </button>
                <button
                  type="button"
                  onClick={() => copyToClipboard(adsTxtContent, 'adstxt')}
                  className="py-2 px-3 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-100"
                >
                  {copiedType === 'adstxt' ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Section 2: Interactive Ad Revenue Simulator */}
            <div className="p-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                2. Monthly Ad Revenue Projection Calculator
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-600 dark:text-slate-400">Daily Active Visitors</span>
                    <span className="font-mono font-bold tabular-nums">{dailyVisitors.toLocaleString()} / day</span>
                  </div>
                  <input
                    type="range"
                    min={500}
                    max={50000}
                    step={500}
                    value={dailyVisitors}
                    onChange={(e) => setDailyVisitors(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-600 dark:text-slate-400">Pageviews / Tools Used per Session</span>
                    <span className="font-mono font-bold tabular-nums">{toolsPerVisit.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={6}
                    step={0.2}
                    value={toolsPerVisit}
                    onChange={(e) => setToolsPerVisit(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-600 dark:text-slate-400">Page RPM (USD per 1,000 Views)</span>
                    <span className="font-mono font-bold tabular-nums">${rpmRate.toFixed(2)} RPM</span>
                  </div>
                  <input
                    type="range"
                    min={3}
                    max={30}
                    step={0.5}
                    value={rpmRate}
                    onChange={(e) => setRpmRate(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>
              </div>

              <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg grid grid-cols-2 gap-3 font-mono tabular-nums">
                <div>
                  <span className="block text-xs font-sans text-slate-500">Est. Monthly (USD)</span>
                  <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    ${estMonthlyUsd.toLocaleString()}/mo
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-sans text-slate-500">Est. Monthly (INR)</span>
                  <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                    ₹{estMonthlyInr.toLocaleString()}/mo
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Google Search Console Sitemap & SEO Assets for bhvsy.github.io */}
          <div className="p-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  3. Google Search Console Sitemap.xml (All 24 Tool URLs Pre-Indexed)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Every tool updates dynamic Title, Meta Description, Canonical URL, and Schema.org FAQPage + SoftwareApplication JSON-LD automatically.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => downloadTextFile('sitemap.xml', generateSitemapXml(), 'application/xml')}
                  className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download sitemap.xml
                </button>
                <button
                  type="button"
                  onClick={() => copyToClipboard(generateSitemapXml(), 'sitemap')}
                  className="px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-100 whitespace-nowrap shrink-0"
                >
                  {copiedType === 'sitemap' ? 'Copied XML!' : 'Copy XML'}
                </button>
              </div>
            </div>

            <pre className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono text-slate-600 dark:text-slate-400 max-h-40 overflow-y-auto">
              {generateSitemapXml()}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
