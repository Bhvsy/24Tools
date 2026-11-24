/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Sun,
  Moon,
  DollarSign,
  ArrowUpRight,
  Link2,
  Image as ImageIcon,
  FileText,
  Globe,
  CheckCircle2,
  HelpCircle,
  BookOpen,
  Share2,
  Check,
} from 'lucide-react';
import {
  TOOLS_CATALOG,
  TOOL_CATEGORIES,
  ToolCategory,
  ToolDefinition,
} from './data/toolsCatalog';
import { CloudLinkTools } from './components/tools/CloudLinkTools';
import { ImageExamTools } from './components/tools/ImageExamTools';
import { PdfStudioTools } from './components/tools/PdfStudioTools';
import { DomainNetworkTools } from './components/tools/DomainNetworkTools';
import { AdUnitSlot } from './components/AdUnitSlot';
import { MonetizationSeoModal } from './components/MonetizationSeoModal';

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<'all' | ToolCategory>('all');
  const [activeToolId, setActiveToolId] = useState<string>('direct-links');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAds, setShowAds] = useState<boolean>(true);
  const [publisherId, setPublisherId] = useState<string>('ca-pub-8924105739184620');
  const [isMonetizeModalOpen, setIsMonetizeModalOpen] = useState<boolean>(false);
  const [copiedShareLink, setCopiedShareLink] = useState<boolean>(false);

  // Sync URL query parameter ?tool=<slug> on initial load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const toolParam = params.get('tool');
    if (toolParam && TOOLS_CATALOG.some((t) => t.id === toolParam)) {
      setActiveToolId(toolParam);
    }
  }, []);

  // Sync dark mode class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  const activeTool: ToolDefinition = useMemo(
    () => TOOLS_CATALOG.find((t) => t.id === activeToolId) || TOOLS_CATALOG[0],
    [activeToolId]
  );

  // Dynamically update SEO title, meta description, OpenGraph, URL query, and JSON-LD Schema.org
  useEffect(() => {
    if (!activeTool) return;
    document.title = activeTool.seoTitle;

    const setMeta = (selector: string, content: string) => {
      const el = document.querySelector(selector);
      if (el) el.setAttribute('content', content);
    };

    setMeta('meta[name="description"]', activeTool.seoDescription);
    setMeta('meta[property="og:title"]', activeTool.seoTitle);
    setMeta('meta[property="og:description"]', activeTool.seoDescription);
    setMeta('meta[name="twitter:title"]', activeTool.seoTitle);
    setMeta('meta[name="twitter:description"]', activeTool.seoDescription);

    try {
      const url = new URL(window.location.href);
      url.searchParams.set('tool', activeTool.id);
      window.history.replaceState({}, '', url.toString());
    } catch {
      // ignore in restricted iframe contexts
    }

    // Update Schema.org JSON-LD with SoftwareApplication + HowTo + FAQPage
    const schemaEl = document.getElementById('schema-jsonld');
    if (schemaEl) {
      const structuredData = {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'SoftwareApplication',
            name: `${activeTool.name} – Bhvsy Tools`,
            applicationCategory: 'UtilitiesApplication',
            operatingSystem: 'All',
            url: `https://bhvsy.github.io/tools?tool=${activeTool.id}`,
            description: activeTool.seoDescription,
            author: {
              '@type': 'Person',
              name: 'Bhavishya Parjapati',
              url: 'https://bhvsy.github.io/',
            },
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
            },
          },
          {
            '@type': 'HowTo',
            name: `How to use ${activeTool.name}`,
            step: activeTool.steps.map((s, idx) => ({
              '@type': 'HowToStep',
              position: idx + 1,
              text: s,
            })),
          },
          {
            '@type': 'FAQPage',
            mainEntity: activeTool.faqs.map((f) => ({
              '@type': 'Question',
              name: f.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: f.answer,
              },
            })),
          },
        ],
      };
      schemaEl.textContent = JSON.stringify(structuredData);
    }
  }, [activeTool]);

  const handleSelectTool = (toolId: string) => {
    setActiveToolId(toolId);
    const workspaceEl = document.getElementById('active-tool-workspace');
    if (workspaceEl) {
      workspaceEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleNavCategorySelect = (cat: 'all' | ToolCategory, defaultToolId?: string) => {
    setSelectedCategory(cat);
    if (defaultToolId) {
      setActiveToolId(defaultToolId);
    }
  };

  const filteredTools = useMemo(() => {
    return TOOLS_CATALOG.filter((item) => {
      const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
      if (!matchesCat) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.shortName.toLowerCase().includes(q) ||
        item.tagline.toLowerCase().includes(q) ||
        item.keywords.some((k) => k.toLowerCase().includes(q))
      );
    });
  }, [selectedCategory, searchQuery]);

  const copyToolDeepLink = () => {
    const shareUrl = `https://bhvsy.github.io/tools?tool=${activeTool.id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedShareLink(true);
    setTimeout(() => setCopiedShareLink(false), 1800);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#090D16] text-slate-900 dark:text-slate-100">
      {/* STRICT 3-ZONE TOP BAR CONTRACT */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#090D16]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-6 py-4">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              handleNavCategorySelect('all', 'direct-links');
            }}
            className="text-xl font-display font-extrabold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0"
          >
            Bhvsy Tools
          </a>

          {/* Zone 2: 5 clean single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a
              href="#directory"
              onClick={(e) => {
                e.preventDefault();
                handleNavCategorySelect('all');
              }}
              className={`hover:text-slate-900 dark:hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 ${
                selectedCategory === 'all' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : ''
              }`}
            >
              All Tools
            </a>
            <a
              href="#cloud-links"
              onClick={(e) => {
                e.preventDefault();
                handleNavCategorySelect('link', 'direct-links');
              }}
              className={`hover:text-slate-900 dark:hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 ${
                selectedCategory === 'link' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : ''
              }`}
            >
              Cloud Links
            </a>
            <a
              href="#image-lab"
              onClick={(e) => {
                e.preventDefault();
                handleNavCategorySelect('image', 'compress-to-kb');
              }}
              className={`hover:text-slate-900 dark:hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 ${
                selectedCategory === 'image' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : ''
              }`}
            >
              Image Lab
            </a>
            <a
              href="#pdf-studio"
              onClick={(e) => {
                e.preventDefault();
                handleNavCategorySelect('pdf', 'merge-split-reorder-pdf');
              }}
              className={`hover:text-slate-900 dark:hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 ${
                selectedCategory === 'pdf' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : ''
              }`}
            >
              PDF Studio
            </a>
            <a
              href="#domain-xray"
              onClick={(e) => {
                e.preventDefault();
                handleNavCategorySelect('domain', 'domain-xray');
              }}
              className={`hover:text-slate-900 dark:hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 ${
                selectedCategory === 'domain' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : ''
              }`}
            >
              Domain X-Ray
            </a>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => setIsMonetizeModalOpen(true)}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              Ad &amp; SEO Studio
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-10">
        {/* Hero & Workspace Command Bar */}
        <section className="space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-2.5 max-w-3xl">
              <div className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                <span>Bhvsy OS Utility Stack</span>
                <span className="mx-2">·</span>
                <span>24 Zero-Login Browser Tools</span>
                <span className="mx-2">·</span>
                <span>Built for bhvsy.github.io</span>
              </div>
              <h1
                className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight"
                style={{ textWrap: 'balance' }}
              >
                Zero-Fluff Cloud Links, Exam Image Lab, PDF Studio &amp; Domain X-Ray.
              </h1>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                Every tool runs at native browser speed with zero sign-ups, zero file watermarks, and complete privacy.
                Select any tool below or paste your file/link directly into the active studio.
              </p>
            </div>

            {/* Workspace Toolbar Controls (Theme Toggle, Ad Slot Toggle, Quick Link to bhvsy.github.io) */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setDarkMode(!darkMode)}
                className="px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                {darkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
                {darkMode ? 'Light Theme' : 'Dark Theme'}
              </button>

              <button
                type="button"
                onClick={() => setShowAds(!showAds)}
                className="px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                {showAds ? 'Ad Units: ON' : 'Ad Units: OFF'}
              </button>

              <a
                href="https://bhvsy.github.io/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 whitespace-nowrap shrink-0"
              >
                bhvsy.github.io
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Top Leaderboard Ad Slot (CLS-Locked) */}
          <AdUnitSlot
            slotId="1049283741"
            label="Top Leaderboard 728×90 / Responsive"
            format="leaderboard"
            publisherId={publisherId}
            visible={showAds}
            onOpenStudio={() => setIsMonetizeModalOpen(true)}
          />
        </section>

        {/* ACTIVE TOOL WORKSPACE */}
        <section id="active-tool-workspace" className="scroll-mt-20 space-y-5">
          {/* Active Tool Header Bar */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  {activeTool.categoryLabel}
                </span>
                <span className="mx-2">·</span>
                <span>{activeTool.executionMode}</span>
                <span className="mx-2">·</span>
                <span className="font-mono tabular-nums">{activeTool.avgRpmTag}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-900 dark:text-white">
                {activeTool.name}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-3xl">
                {activeTool.description}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={copyToolDeepLink}
                className="px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                {copiedShareLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
                {copiedShareLink ? 'Copied Tool Link!' : 'Share Direct Tool URL'}
              </button>
            </div>
          </div>

          {/* Render Active Category Studio */}
          {activeTool.category === 'link' && (
            <CloudLinkTools tool={activeTool} onSelectTool={handleSelectTool} />
          )}
          {activeTool.category === 'image' && (
            <ImageExamTools tool={activeTool} onSelectTool={handleSelectTool} />
          )}
          {activeTool.category === 'pdf' && (
            <PdfStudioTools tool={activeTool} onSelectTool={handleSelectTool} />
          )}
          {activeTool.category === 'domain' && (
            <DomainNetworkTools tool={activeTool} onSelectTool={handleSelectTool} />
          )}

          {/* Mid-Page Native In-Feed Ad Slot */}
          <AdUnitSlot
            slotId="4928173652"
            label="Post-Result High-Intent In-Feed Unit"
            format="in-feed"
            publisherId={publisherId}
            visible={showAds}
            onOpenStudio={() => setIsMonetizeModalOpen(true)}
          />

          {/* SEO Rich Content Block: How-To Steps + Structured FAQs for the Active Tool */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-display font-bold text-slate-900 dark:text-white">
                  How to Use {activeTool.shortName}
                </h3>
              </div>
              <ol className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                {activeTool.steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
                      0{i + 1}.
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                Target SEO Keywords: {activeTool.keywords.join(' · ')}
              </div>
            </div>

            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-display font-bold text-slate-900 dark:text-white">
                  Frequently Asked Questions (Schema.org FAQPage)
                </h3>
              </div>
              <div className="space-y-3.5">
                {activeTool.faqs.map((faq, idx) => (
                  <div key={idx} className="space-y-1">
                    <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {faq.question}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* COMPLETE 24-TOOL DIRECTORY & SEARCH */}
        <section id="directory" className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">
                Complete 24-Tool Directory
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Includes all 10 Cloud &amp; Link utilities, 6 Image &amp; Exam tools, 4 PDF tools, and 4 Domain X-Ray diagnostics.
              </p>
            </div>

            {/* Instant Search Filter */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter 24 tools (e.g. 20KB, Drive, PDF, DNS)..."
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Interactive Category Segmented Filter Bar */}
          <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-200/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-fit">
            {TOOL_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  selectedCategory === cat.id
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {cat.label} ({cat.count})
              </button>
            ))}
          </div>

          {/* 24-Tool Grid (Zero-Pill Metadata, Single-Elevation Depth) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTools.map((item) => {
              const isSelected = item.id === activeTool.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectTool(item.id)}
                  className={`p-5 text-left rounded-xl border transition-all flex flex-col justify-between gap-4 ${
                    isSelected
                      ? 'bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-500'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-2">
                    {/* Clean unboxed metadata kicker with typographic separators */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-medium text-indigo-600 dark:text-indigo-400">
                        {item.categoryLabel}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{item.executionMode}</span>
                    </div>

                    <h3 className="text-base font-display font-bold text-slate-900 dark:text-white">
                      {item.name}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {item.tagline}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                      {item.avgRpmTag}
                    </span>
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                      {isSelected ? 'Active in Studio' : 'Launch Tool →'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Bottom Multiplex Ad Slot */}
          <AdUnitSlot
            slotId="8374659102"
            label="Directory Footer Multiplex Banner"
            format="footer-banner"
            publisherId={publisherId}
            visible={showAds}
            onOpenStudio={() => setIsMonetizeModalOpen(true)}
          />
        </section>
      </main>

      {/* Clean Editorial Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div>
            <span className="font-bold text-slate-900 dark:text-white">Bhvsy Tools</span>
            <span className="mx-2">·</span>
            <span>Engineered by Bhavishya Parjapati (Bhvsy OS)</span>
            <span className="mx-2">·</span>
            <span>Hisar, India</span>
          </div>

          <div className="flex flex-wrap items-center gap-5">
            <a
              href="https://bhvsy.github.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Bhvsy OS Portal
            </a>
            <a
              href="https://github.com/Bhvsy"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              GitHub (@Bhvsy)
            </a>
            <a
              href="https://x.com/bhvsy_os"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              X (@bhvsy_os)
            </a>
            <button
              type="button"
              onClick={() => setIsMonetizeModalOpen(true)}
              className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
            >
              AdSense &amp; Sitemap Console
            </button>
          </div>
        </div>
      </footer>

      {/* Monetization & SEO Modal */}
      <MonetizationSeoModal
        isOpen={isMonetizeModalOpen}
        onClose={() => setIsMonetizeModalOpen(false)}
        publisherId={publisherId}
        setPublisherId={setPublisherId}
        showAds={showAds}
        setShowAds={setShowAds}
      />
    </div>
  );
}
