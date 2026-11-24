import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  Copy,
  Check,
  ExternalLink,
  QrCode,
  Terminal,
  Code2,
  FileCode,
  Sparkles,
  ArrowRight,
  RefreshCw,
  ShieldCheck,
  AlertTriangle,
  Download,
  Link2,
  Layers,
} from 'lucide-react';
import { ToolDefinition } from '../../data/toolsCatalog';

interface CloudLinkToolsProps {
  tool: ToolDefinition;
  onSelectTool: (id: string) => void;
}

export interface ConvertedLinkResult {
  provider: string;
  originalUrl: string;
  directDownloadUrl: string;
  rawEmbedUrl: string;
  altLargeFileUrl?: string;
  htmlImgSnippet: string;
  markdownSnippet: string;
  cliCurlSnippet: string;
  fileIdOrToken: string;
  notes: string;
}

const SAMPLE_LINKS: Record<string, string> = {
  'direct-links': 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/view?usp=sharing',
  'google-drive': 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/view?usp=sharing',
  'google-photos': 'https://lh3.googleusercontent.com/pw/AP1GczO9xK8mR2vN4pL7qW3sT6yU1iO5pA8sD2fG4hJ6kL9zX3cV7bN1mQ=w1200-h800-no',
  'one-drive': 'https://1drv.ms/u/s!AmR4t8KpL9wX2yZ5vN7qW1cE3fG?e=4kL9mN',
  'dropbox': 'https://www.dropbox.com/scl/fi/9x8w7v6u5t4r3e2w1q0p/Bhvsy-OS-Architecture-Guide.pdf?rlkey=4m8n2b6v1c9x3z7l5k&dl=0',
  'pcloud': 'https://u.pcloud.link/publink/show?code=XZ8kL9mN4pQ2rS6tU1vW3xY7zA5bC9dE',
  'box': 'https://app.box.com/s/v9x8w7u6t5r4e3w2q1a0z9y8x7w6v5u4',
  'github': 'https://github.com/Bhvsy/bhvsy.github.io/blob/main/index.html',
  'link-expander': 'https://github.com/Bhvsy?utm_source=instagram&utm_medium=social&utm_campaign=bhvsy_os_launch&fbclid=IwAR29x8w7v6',
  'link-rot-checker': `https://bhvsy.github.io/
https://rojuka.com/tools
https://github.com/Bhvsy
https://httpstat.us/404`,
};

function toBase64Url(input: string): string {
  try {
    const base64 = btoa(unescape(encodeURIComponent(input)));
    return 'u!' + base64.replace(/=+$/, '').replace(/\//g, '_').replace(/\+/g, '-');
  } catch {
    return '';
  }
}

export function convertCloudUrl(rawUrl: string, forcedType?: string): ConvertedLinkResult | null {
  const url = rawUrl.trim();
  if (!url) return null;

  // Detect provider if universal
  let type = forcedType || 'direct-links';
  if (type === 'direct-links') {
    if (url.includes('drive.google.com') || url.includes('docs.google.com')) type = 'google-drive';
    else if (url.includes('photos.app.goo.gl') || url.includes('googleusercontent.com') || url.includes('photos.google.com'))
      type = 'google-photos';
    else if (url.includes('1drv.ms') || url.includes('onedrive.live.com') || url.includes('sharepoint.com'))
      type = 'one-drive';
    else if (url.includes('dropbox.com') || url.includes('dropboxusercontent.com')) type = 'dropbox';
    else if (url.includes('pcloud.link') || url.includes('pcloud.com')) type = 'pcloud';
    else if (url.includes('box.com')) type = 'box';
    else if (url.includes('github.com') || url.includes('githubusercontent.com')) type = 'github';
    else type = 'google-drive';
  }

  // 1. GOOGLE DRIVE
  if (type === 'google-drive') {
    const fileIdMatch =
      url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
      url.match(/\/d\/([a-zA-Z0-9_-]+)/) ||
      url.match(/[?&]id=([a-zA-Z0-9_-]+)/) ||
      url.match(/^([a-zA-Z0-9_-]{25,45})$/);

    const fileId = fileIdMatch ? fileIdMatch[1] : '';
    if (!fileId) return null;

    const directDownloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
    const altLargeFileUrl = `https://drive.usercontent.google.com/download?id=${fileId}&export=download&confirm=t`;
    const rawEmbedUrl = `https://lh3.googleusercontent.com/d/${fileId}=w2000`;

    return {
      provider: 'Google Drive',
      originalUrl: url,
      directDownloadUrl,
      rawEmbedUrl,
      altLargeFileUrl,
      fileIdOrToken: fileId,
      htmlImgSnippet: `<img src="${rawEmbedUrl}" alt="Google Drive Asset" loading="lazy" />`,
      markdownSnippet: `![Google Drive Asset](${rawEmbedUrl})`,
      cliCurlSnippet: `curl -L "${altLargeFileUrl}" -o downloaded_file`,
      notes: 'Uses uc?export=download for standard files and drive.usercontent confirm=t for large files (>100MB).',
    };
  }

  // 2. GOOGLE PHOTOS
  if (type === 'google-photos') {
    const base = url.split('=')[0];
    const directDownloadUrl = `${base}=d`;
    const rawEmbedUrl = `${base}=w2400-h1600-no`;
    const altLargeFileUrl = `${base}=s0`;
    return {
      provider: 'Google Photos CDN',
      originalUrl: url,
      directDownloadUrl,
      rawEmbedUrl,
      altLargeFileUrl,
      fileIdOrToken: base.slice(-24),
      htmlImgSnippet: `<img src="${rawEmbedUrl}" alt="Google Photos Media" loading="lazy" />`,
      markdownSnippet: `![Google Photos Media](${rawEmbedUrl})`,
      cliCurlSnippet: `curl -L "${directDownloadUrl}" -o photo.jpg`,
      notes: 'Appends =d for direct download, =w2400-h1600-no for responsive high-res embed, and =s0 for original uncompressed size.',
    };
  }

  // 3. ONEDRIVE / SHAREPOINT
  if (type === 'one-drive') {
    const shareToken = toBase64Url(url);
    const apiDirectUrl = `https://api.onedrive.com/v1.0/shares/${shareToken}/root/content`;
    const queryDownloadUrl = url.includes('?')
      ? url.replace(/([?&])e=[^&]+/, '$1download=1') + (url.includes('download=1') ? '' : '&download=1')
      : `${url}?download=1`;

    return {
      provider: 'Microsoft OneDrive',
      originalUrl: url,
      directDownloadUrl: queryDownloadUrl,
      rawEmbedUrl: apiDirectUrl,
      altLargeFileUrl: apiDirectUrl,
      fileIdOrToken: shareToken.slice(0, 28) + '...',
      htmlImgSnippet: `<img src="${apiDirectUrl}" alt="OneDrive Media" loading="lazy" />`,
      markdownSnippet: `[Download from OneDrive](${queryDownloadUrl})`,
      cliCurlSnippet: `curl -L "${queryDownloadUrl}" -o onedrive_file`,
      notes: 'Generates both the ?download=1 query endpoint (works on 1drv.ms & SharePoint) and the OneDrive API u! base64 stream.',
    };
  }

  // 4. DROPBOX
  if (type === 'dropbox') {
    let directDownloadUrl = url;
    let rawEmbedUrl = url;
    try {
      const parsed = new URL(url);
      const dlUrl = new URL(parsed.toString());
      dlUrl.searchParams.set('dl', '1');
      dlUrl.searchParams.delete('raw');
      directDownloadUrl = dlUrl.toString();

      const rawUrlObj = new URL(parsed.toString());
      rawUrlObj.hostname = 'dl.dropboxusercontent.com';
      rawUrlObj.searchParams.set('raw', '1');
      rawUrlObj.searchParams.delete('dl');
      rawEmbedUrl = rawUrlObj.toString();
    } catch {
      directDownloadUrl = url.replace('dl=0', 'dl=1');
      rawEmbedUrl = url.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace('dl=0', 'raw=1');
    }

    return {
      provider: 'Dropbox Cloud',
      originalUrl: url,
      directDownloadUrl,
      rawEmbedUrl,
      fileIdOrToken: 'rlkey-preserved',
      htmlImgSnippet: `<img src="${rawEmbedUrl}" alt="Dropbox Asset" loading="lazy" />`,
      markdownSnippet: `![Dropbox Asset](${rawEmbedUrl})`,
      cliCurlSnippet: `curl -L "${directDownloadUrl}" -o dropbox_file`,
      notes: 'Preserves Dropbox rlkey security token while unlocking direct download (?dl=1) and raw CDN streaming (dl.dropboxusercontent.com).',
    };
  }

  // 5. PCLOUD
  if (type === 'pcloud') {
    const codeMatch = url.match(/[?&]code=([a-zA-Z0-9]+)/) || url.match(/\/([a-zA-Z0-9]{20,})/);
    const code = codeMatch ? codeMatch[1] : 'UNKNOWN_CODE';
    const isEu = url.includes('e.pcloud.link');
    const host = isEu ? 'e.pcloud.link' : 'u.pcloud.link';
    const directDownloadUrl = `https://${host}/publink/show?code=${code}`;
    const rawEmbedUrl = `https://api.${isEu ? 'e' : ''}pcloud.com/getpublinkdownload?code=${code}`;

    return {
      provider: isEu ? 'pCloud (EU Region)' : 'pCloud (US Region)',
      originalUrl: url,
      directDownloadUrl,
      rawEmbedUrl,
      fileIdOrToken: code,
      htmlImgSnippet: `<a href="${directDownloadUrl}" target="_blank" rel="noopener">Download pCloud File (${code.slice(0, 8)})</a>`,
      markdownSnippet: `[Download from pCloud](${directDownloadUrl})`,
      cliCurlSnippet: `curl -L "${directDownloadUrl}" -o pcloud_file`,
      notes: `Detected ${isEu ? 'EU (Luxembourg)' : 'US (Dallas)'} pCloud storage cluster with publink code ${code}.`,
    };
  }

  // 6. BOX CLOUD
  if (type === 'box') {
    const tokenMatch = url.match(/box\.com\/s\/([a-zA-Z0-9]+)/) || url.match(/([a-zA-Z0-9]{20,35})/);
    const token = tokenMatch ? tokenMatch[1] : 'box_token';
    const directDownloadUrl = `https://app.box.com/index.php?rm=box_download_shared_file&shared_name=${token}`;
    const rawEmbedUrl = `https://app.box.com/embed/s/${token}?sortColumn=date&view=list`;

    return {
      provider: 'Box Enterprise Cloud',
      originalUrl: url,
      directDownloadUrl,
      rawEmbedUrl,
      fileIdOrToken: token,
      htmlImgSnippet: `<iframe src="${rawEmbedUrl}" width="100%" height="500" frameborder="0" allowfullscreen></iframe>`,
      markdownSnippet: `[Download Box Shared File](${directDownloadUrl})`,
      cliCurlSnippet: `curl -L "${directDownloadUrl}" -o box_shared_file`,
      notes: 'Generates the direct shared_name download endpoint and the official Box Embed iframe viewer URL.',
    };
  }

  // 7. GITHUB RAW & JSDELIVR CDN
  if (type === 'github') {
    const ghMatch =
      url.match(/github\.com\/([^/]+)\/([^/]+)\/(?:blob|raw)\/([^/]+)\/(.+)/) ||
      url.match(/raw\.githubusercontent\.com\/([^/]+)\/([^/]+)\/([^/]+)\/(.+)/);

    if (ghMatch) {
      const [, owner, repo, branch, filePath] = ghMatch;
      const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`;
      const cdnUrl = `https://cdn.jsdelivr.net/gh/${owner}/${repo}@${branch}/${filePath}`;
      return {
        provider: 'GitHub & jsDelivr CDN',
        originalUrl: url,
        directDownloadUrl: rawUrl,
        rawEmbedUrl: cdnUrl,
        altLargeFileUrl: `https://github.com/${owner}/${repo}/archive/refs/heads/${branch}.zip`,
        fileIdOrToken: `${owner}/${repo}@${branch}`,
        htmlImgSnippet: filePath.endsWith('.js')
          ? `<script src="${cdnUrl}" defer></script>`
          : filePath.endsWith('.css')
          ? `<link rel="stylesheet" href="${cdnUrl}" />`
          : `<img src="${cdnUrl}" alt="${filePath}" loading="lazy" />`,
        markdownSnippet: `[${filePath} via jsDelivr CDN](${cdnUrl})`,
        cliCurlSnippet: `curl -sL "${rawUrl}" -O`,
        notes: 'Generates both raw.githubusercontent.com and production-ready cdn.jsdelivr.net URLs with global edge caching and proper MIME headers.',
      };
    }
  }

  return null;
}

export const CloudLinkTools: React.FC<CloudLinkToolsProps> = ({ tool, onSelectTool }) => {
  const [inputUrl, setInputUrl] = useState<string>(SAMPLE_LINKS[tool.id] || SAMPLE_LINKS['direct-links']);
  const [batchMode, setBatchMode] = useState<boolean>(false);
  const [batchInput, setBatchInput] = useState<string>(
    `https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/view?usp=sharing\nhttps://www.dropbox.com/scl/fi/9x8w7v6u5t4r3e2w1q0p/Bhvsy-Guide.pdf?rlkey=4m8n2b6v1c9x3z7l5k&dl=0\nhttps://github.com/Bhvsy/bhvsy.github.io/blob/main/index.html`
  );
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  // Google Photos specific custom sizing state
  const [gPhotoWidth, setGPhotoWidth] = useState<number>(1920);
  const [gPhotoHeight, setGPhotoHeight] = useState<number>(1080);
  const [gPhotoCrop, setGPhotoCrop] = useState<boolean>(false);
  const [gPhotoLoading, setGPhotoLoading] = useState<boolean>(false);
  const [gPhotoError, setGPhotoError] = useState<string | null>(null);

  // Link Expander state
  const [expanderLoading, setExpanderLoading] = useState<boolean>(false);
  const [expanderResult, setExpanderResult] = useState<any>(null);
  const [expanderError, setExpanderError] = useState<string | null>(null);

  // Link Rot Checker state
  const [rotLoading, setRotLoading] = useState<boolean>(false);
  const [rotResult, setRotResult] = useState<any>(null);
  const [rotFilter, setRotFilter] = useState<'all' | 'healthy' | 'redirected' | 'broken'>('all');

  useEffect(() => {
    setInputUrl(SAMPLE_LINKS[tool.id] || SAMPLE_LINKS['direct-links']);
    setGPhotoError(null);
    setExpanderError(null);
  }, [tool.id]);

  const converted = convertCloudUrl(inputUrl, tool.id);

  useEffect(() => {
    const targetForQr = converted?.directDownloadUrl || inputUrl;
    if (targetForQr && targetForQr.startsWith('http')) {
      QRCode.toDataURL(targetForQr, {
        width: 180,
        margin: 1,
        color: { dark: '#0f172a', light: '#ffffff' },
      })
        .then(setQrDataUrl)
        .catch(() => setQrDataUrl(''));
    }
  }, [converted?.directDownloadUrl, inputUrl]);

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  // Handler for Google Photos shortlink extraction
  const handleExtractGooglePhotos = async () => {
    if (!inputUrl.trim()) return;
    if (inputUrl.includes('googleusercontent.com')) {
      return;
    }
    setGPhotoLoading(true);
    setGPhotoError(null);
    try {
      const res = await fetch('/api/google-photos-extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: inputUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not extract Google Photos CDN URL');
      setInputUrl(data.originalWidthUrl);
    } catch (e: any) {
      setGPhotoError(e.message || 'Extraction failed');
    } finally {
      setGPhotoLoading(false);
    }
  };

  // Handler for Link Expander
  const handleExpandLink = async () => {
    if (!inputUrl.trim()) return;
    setExpanderLoading(true);
    setExpanderError(null);
    try {
      const res = await fetch('/api/expand-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: inputUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to trace redirect chain');
      setExpanderResult(data);
    } catch (e: any) {
      // Client-side fallback if running purely static on GitHub Pages
      try {
        const parsed = new URL(inputUrl.startsWith('http') ? inputUrl : 'https://' + inputUrl);
        const removed: string[] = [];
        ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid', 'ref'].forEach((k) => {
          if (parsed.searchParams.has(k)) {
            removed.push(`${k}=${parsed.searchParams.get(k)}`);
            parsed.searchParams.delete(k);
          }
        });
        setExpanderResult({
          originalUrl: inputUrl,
          finalUrl: inputUrl,
          cleanFinalUrl: parsed.toString(),
          removedTrackers: removed,
          hopCount: 1,
          hops: [
            {
              step: 1,
              url: inputUrl,
              status: 200,
              statusText: 'Client-Side Parsed',
              durationMs: 4,
            },
          ],
        });
      } catch {
        setExpanderError(e.message || 'Failed to trace URL');
      }
    } finally {
      setExpanderLoading(false);
    }
  };

  // Auto-run Link Expander on tool select
  useEffect(() => {
    if (tool.id === 'link-expander' && !expanderResult) {
      handleExpandLink();
    }
  }, [tool.id]);

  // Handler for Link Rot Checker
  const extractUrlsFromText = (raw: string): string[] => {
    const regex = /https?:\/\/[^\s)"'<>[\]]+/gi;
    const matches = raw.match(regex) || [];
    if (matches.length > 0) return Array.from(new Set(matches));
    return raw
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
  };

  const handleScanLinkRot = async () => {
    const urls = extractUrlsFromText(inputUrl);
    if (urls.length === 0) return;
    setRotLoading(true);
    try {
      const res = await fetch('/api/check-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Link check failed');
      setRotResult(data);
    } catch {
      setRotLoading(false);
    } finally {
      setRotLoading(false);
    }
  };

  useEffect(() => {
    if (tool.id === 'link-rot-checker' && !rotResult) {
      handleScanLinkRot();
    }
  }, [tool.id]);

  // ==========================================================
  // VIEW A: LINK EXPANDER & REDIRECT TRACER
  // ==========================================================
  if (tool.id === 'link-expander') {
    return (
      <div className="space-y-6">
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Shortened or Tracking-Heavy URL to Unshorten &amp; Sanitize
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setInputUrl(
                    'https://github.com/Bhvsy?utm_source=twitter&utm_medium=social&utm_campaign=news_guard_v2&gclid=EAIaIQobChMI'
                  )
                }
                className="px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors whitespace-nowrap shrink-0"
              >
                Load UTM Sample
              </button>
              <button
                type="button"
                onClick={() => setInputUrl('http://github.com/Bhvsy')}
                className="px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors whitespace-nowrap shrink-0"
              >
                Load 301 Hop Sample
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="Paste bit.ly, tinyurl.com, t.co, or affiliate tracking link..."
              className="flex-1 px-4 py-3 text-sm font-mono bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={handleExpandLink}
              disabled={expanderLoading}
              className="px-6 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
            >
              {expanderLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              {expanderLoading ? 'Tracing Hops...' : 'Trace Redirect Chain'}
            </button>
          </div>
          {expanderError && (
            <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{expanderError}</p>
          )}
        </div>

        {expanderResult && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Redirect Hop Chain &amp; Final Destination
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {expanderResult.hopCount} HTTP hop(s) traced · {expanderResult.removedTrackers?.length || 0} tracking parameter(s) stripped
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {expanderResult.hops?.map((hop: any) => (
                  <div
                    key={hop.step}
                    className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">Hop #{hop.step}</span>
                        <span>·</span>
                        <span
                          className={
                            hop.status >= 200 && hop.status < 300
                              ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                              : 'text-amber-600 dark:text-amber-400 font-semibold'
                          }
                        >
                          HTTP {hop.status} {hop.statusText}
                        </span>
                        <span>·</span>
                        <span>{hop.durationMs} ms</span>
                        {hop.server && (
                          <>
                            <span>·</span>
                            <span>Server: {hop.server}</span>
                          </>
                        )}
                      </div>
                      <p className="text-xs font-mono text-slate-800 dark:text-slate-200 break-all">{hop.url}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 space-y-3">
                <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                      Sanitized Tracker-Free Final URL
                    </span>
                    <button
                      type="button"
                      onClick={() => copyText(expanderResult.cleanFinalUrl, 'clean-final')}
                      className="px-3 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
                    >
                      {copiedKey === 'clean-final' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedKey === 'clean-final' ? 'Copied Clean URL' : 'Copy Clean URL'}
                    </button>
                  </div>
                  <p className="text-xs font-mono text-slate-900 dark:text-slate-100 break-all">
                    {expanderResult.cleanFinalUrl}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Stripped Ad &amp; UTM Trackers</h3>
              {expanderResult.removedTrackers?.length > 0 ? (
                <div className="space-y-2">
                  {expanderResult.removedTrackers.map((t: string, idx: number) => (
                    <div
                      key={idx}
                      className="px-3 py-2 text-xs font-mono bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 rounded-md break-all"
                    >
                      Removed: {t}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  No UTM, fbclid, or gclid tracking parameters were found on the final destination URL.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================================
  // VIEW B: BULK LINK ROT & DEAD URL CHECKER
  // ==========================================================
  if (tool.id === 'link-rot-checker') {
    const filteredResults =
      rotResult?.results?.filter((r: any) => (rotFilter === 'all' ? true : r.category === rotFilter)) || [];

    const exportCsv = () => {
      if (!rotResult?.results) return;
      const rows = [
        ['Original URL', 'HTTP Status', 'Category', 'Final Destination URL', 'Latency (ms)'],
        ...rotResult.results.map((r: any) => [r.url, r.status, r.category, r.finalUrl, r.durationMs]),
      ];
      const csv = rows.map((row) => row.map((v: any) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `bhvsy-link-rot-report-${Date.now()}.csv`;
      a.click();
    };

    return (
      <div className="space-y-6">
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Paste URL List, Markdown Post, or Raw HTML (Up to 25 Links per Batch)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Automatically extracts all http:// and https:// URLs and checks live status codes &amp; response latency.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setInputUrl(SAMPLE_LINKS['link-rot-checker'])}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors whitespace-nowrap shrink-0"
            >
              Reset Sample URLs
            </button>
          </div>

          <textarea
            rows={5}
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="Paste URLs (one per line) or paste an entire Markdown/HTML article..."
            className="w-full p-4 text-xs font-mono bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
              Detected {extractUrlsFromText(inputUrl).length} unique URL(s) ready for probing
            </span>
            <button
              type="button"
              onClick={handleScanLinkRot}
              disabled={rotLoading}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap shrink-0"
            >
              {rotLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              {rotLoading ? 'Probing All Endpoints...' : 'Scan All Links for Link Rot'}
            </button>
          </div>
        </div>

        {rotResult && (
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                {(['all', 'healthy', 'redirected', 'broken'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setRotFilter(tab)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors capitalize whitespace-nowrap shrink-0 ${
                      rotFilter === tab
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={exportCsv}
                className="px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                Export Audit CSV
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <th className="py-2.5 pr-4">Target URL</th>
                    <th className="py-2.5 px-4">HTTP Status</th>
                    <th className="py-2.5 px-4">State</th>
                    <th className="py-2.5 pl-4 text-right">Latency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 text-xs font-mono tabular-nums">
                  {filteredResults.map((item: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="py-3 pr-4 text-slate-900 dark:text-slate-100 max-w-md truncate">
                        {item.url}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={
                            item.ok
                              ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                              : 'text-rose-600 dark:text-rose-400 font-semibold'
                          }
                        >
                          {item.status ? `${item.status} ${item.statusText || ''}` : 'ERR / TIMEOUT'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 capitalize">{item.category}</td>
                      <td className="py-3 pl-4 text-right text-slate-500 dark:text-slate-400">{item.durationMs} ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================================
  // VIEW C: CLOUD DIRECT LINK GENERATORS (8 TOOLS)
  // ==========================================================
  const batchResults = batchMode
    ? batchInput
        .split('\n')
        .map((line) => convertCloudUrl(line, tool.id))
        .filter((x): x is ConvertedLinkResult => x !== null)
    : [];

  // Custom Google Photos dynamic parameter URL
  const googlePhotosCustomUrl =
    tool.id === 'google-photos' && converted
      ? `${converted.originalUrl.split('=')[0]}=w${gPhotoWidth}-h${gPhotoHeight}${gPhotoCrop ? '-c' : '-no'}`
      : null;

  return (
    <div className="space-y-6">
      {/* Provider Switcher Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
        <div className="flex flex-wrap items-center gap-1">
          {[
            { id: 'direct-links', label: 'Auto-Detect All' },
            { id: 'google-drive', label: 'Google Drive' },
            { id: 'google-photos', label: 'Google Photos' },
            { id: 'one-drive', label: 'OneDrive' },
            { id: 'dropbox', label: 'Dropbox' },
            { id: 'pcloud', label: 'pCloud' },
            { id: 'box', label: 'Box' },
            { id: 'github', label: 'GitHub / CDN' },
          ].map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelectTool(p.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                tool.id === p.id
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <button
            type="button"
            onClick={() => setBatchMode(false)}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              !batchMode
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Single Link
          </button>
          <button
            type="button"
            onClick={() => setBatchMode(true)}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              batchMode
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Batch Mode (Multi-URL)
          </button>
        </div>
      </div>

      {/* Main Input Card */}
      {!batchMode ? (
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Paste Public Share Link ({tool.shortName})
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setInputUrl(SAMPLE_LINKS[tool.id] || SAMPLE_LINKS['direct-links'])}
                className="px-2.5 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors whitespace-nowrap shrink-0"
              >
                Load Working Sample Link
              </button>
              <button
                type="button"
                onClick={() => setInputUrl('')}
                className="px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-md hover:bg-slate-200 transition-colors whitespace-nowrap shrink-0"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="Paste your shared cloud link here..."
              className="flex-1 px-4 py-3 text-sm font-mono bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {tool.id === 'google-photos' && inputUrl.includes('photos.app.goo.gl') && (
              <button
                type="button"
                onClick={handleExtractGooglePhotos}
                disabled={gPhotoLoading}
                className="px-5 py-3 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                {gPhotoLoading ? 'Extracting CDN...' : 'Extract Shortlink CDN'}
              </button>
            )}
          </div>

          {gPhotoError && <p className="text-xs text-rose-600 dark:text-rose-400">{gPhotoError}</p>}

          {/* Google Photos Dimension Customizer */}
          {tool.id === 'google-photos' && converted && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Target Width (px)</label>
                <input
                  type="number"
                  value={gPhotoWidth}
                  onChange={(e) => setGPhotoWidth(Number(e.target.value) || 1200)}
                  className="w-full px-3 py-1.5 text-xs font-mono tabular-nums bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Target Height (px)</label>
                <input
                  type="number"
                  value={gPhotoHeight}
                  onChange={(e) => setGPhotoHeight(Number(e.target.value) || 800)}
                  className="w-full px-3 py-1.5 text-xs font-mono tabular-nums bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => setGPhotoCrop(!gPhotoCrop)}
                  className={`w-full px-3 py-1.5 text-xs font-medium rounded-md border transition-colors whitespace-nowrap shrink-0 ${
                    gPhotoCrop
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {gPhotoCrop ? 'Smart Square Crop (-c): ON' : 'Smart Crop (-c): OFF'}
                </button>
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => {
                    setGPhotoWidth(2400);
                    setGPhotoHeight(1600);
                    setGPhotoCrop(false);
                  }}
                  className="w-full px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap shrink-0"
                >
                  Reset 2400×1600
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Batch Cloud URL Converter (Paste 1 URL per line — Auto-Detects All Providers)
            </label>
            <button
              type="button"
              onClick={() =>
                copyText(
                  batchResults.map((r) => r.directDownloadUrl).join('\n'),
                  'batch-all'
                )
              }
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              {copiedKey === 'batch-all' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedKey === 'batch-all' ? 'Copied All Direct Links!' : `Copy All (${batchResults.length}) Direct Links`}
            </button>
          </div>
          <textarea
            rows={5}
            value={batchInput}
            onChange={(e) => setBatchInput(e.target.value)}
            className="w-full p-4 text-xs font-mono bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100"
          />
          <div className="space-y-2">
            {batchResults.map((item, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    <span>{item.provider}</span>
                    <span className="mx-1.5">·</span>
                    <span className="font-mono">{item.fileIdOrToken}</span>
                  </div>
                  <p className="text-xs font-mono text-slate-900 dark:text-slate-100 truncate">
                    {item.directDownloadUrl}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => copyText(item.directDownloadUrl, `batch-${idx}`)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0"
                >
                  {copiedKey === `batch-${idx}` ? 'Copied!' : 'Copy Direct Link'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Output Grid for Single Link */}
      {!batchMode && converted && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Primary Direct Links Column */}
          <div className="lg:col-span-2 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  <span>Detected Platform: {converted.provider}</span>
                  <span className="mx-1.5">·</span>
                  <span className="font-mono">ID: {converted.fileIdOrToken}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                  Generated Direct &amp; Embed Endpoints
                </h3>
              </div>
              <a
                href={converted.directDownloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Test Link in New Tab
              </a>
            </div>

            {/* 1. Primary Direct Download Link */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  1. Instant Direct Download URL
                </span>
                <button
                  type="button"
                  onClick={() => copyText(converted.directDownloadUrl, 'direct')}
                  className="px-3 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
                >
                  {copiedKey === 'direct' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedKey === 'direct' ? 'Copied Direct URL' : 'Copy Direct URL'}
                </button>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono text-slate-900 dark:text-slate-100 break-all">
                {converted.directDownloadUrl}
              </div>
            </div>

            {/* 2. Raw Stream / CDN Embed URL */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  2. Raw Media / Global Edge CDN Embed URL
                </span>
                <button
                  type="button"
                  onClick={() => copyText(googlePhotosCustomUrl || converted.rawEmbedUrl, 'raw')}
                  className="px-3 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
                >
                  {copiedKey === 'raw' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedKey === 'raw' ? 'Copied Embed URL' : 'Copy Embed URL'}
                </button>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono text-slate-900 dark:text-slate-100 break-all">
                {googlePhotosCustomUrl || converted.rawEmbedUrl}
              </div>
            </div>

            {/* 3. HTML / Markdown / CLI Snippets */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-indigo-500" />
                    HTML Embed Tag
                  </span>
                  <button
                    type="button"
                    onClick={() => copyText(converted.htmlImgSnippet, 'html')}
                    className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    {copiedKey === 'html' ? 'Copied!' : 'Copy HTML'}
                  </button>
                </div>
                <p className="text-xs font-mono text-slate-600 dark:text-slate-400 break-all">
                  {converted.htmlImgSnippet}
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-indigo-500" />
                    Terminal cURL / Wget
                  </span>
                  <button
                    type="button"
                    onClick={() => copyText(converted.cliCurlSnippet, 'cli')}
                    className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    {copiedKey === 'cli' ? 'Copied!' : 'Copy CLI'}
                  </button>
                </div>
                <p className="text-xs font-mono text-slate-600 dark:text-slate-400 break-all">
                  {converted.cliCurlSnippet}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 pt-1">{converted.notes}</p>
          </div>

          {/* QR Code & Quick Share Card */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-between text-center space-y-4">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Direct Download QR Code</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Scan with any phone camera to trigger an immediate file download.
              </p>
            </div>

            {qrDataUrl ? (
              <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
                <img
                  src={qrDataUrl}
                  alt="Direct Download QR Code"
                  className="w-40 h-40 object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
            ) : (
              <div className="w-40 h-40 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                <QrCode className="w-8 h-8 text-slate-400" />
              </div>
            )}

            <div className="w-full space-y-2">
              {qrDataUrl && (
                <a
                  href={qrDataUrl}
                  download={`bhvsy-qr-${converted.fileIdOrToken.slice(0, 10)}.png`}
                  className="w-full py-2 px-4 text-xs font-semibold text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download QR PNG
                </a>
              )}
              <button
                type="button"
                onClick={() => copyText(converted.markdownSnippet, 'md')}
                className="w-full py-2 px-4 text-xs font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                {copiedKey === 'md' ? 'Copied Markdown!' : 'Copy Markdown Embed'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
