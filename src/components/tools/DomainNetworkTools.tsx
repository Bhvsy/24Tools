import React, { useState, useEffect } from 'react';
import {
  Globe,
  ShieldCheck,
  Lock,
  Server,
  RefreshCw,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Download,
  Search,
} from 'lucide-react';
import { ToolDefinition } from '../../data/toolsCatalog';

interface DomainNetworkToolsProps {
  tool: ToolDefinition;
  onSelectTool: (id: string) => void;
}

// Browser-direct Cloudflare 1.1.1.1 DNS-over-HTTPS fallback so static GitHub Pages deployments work seamlessly!
async function queryCloudflareDohFallback(domain: string) {
  const start = Date.now();
  const types = ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS'];
  const results: Record<string, any> = {
    A: [],
    AAAA: [],
    CNAME: [],
    MX: [],
    TXT: [],
    NS: [],
    SOA: null,
  };

  await Promise.all(
    types.map(async (t) => {
      try {
        const res = await fetch(
          `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=${t}`,
          { headers: { Accept: 'application/dns-json' } }
        );
        const data = await res.json();
        const answers = Array.isArray(data.Answer) ? data.Answer : [];
        if (t === 'MX') {
          results.MX = answers.map((a: any) => {
            const parts = String(a.data).split(' ');
            return { priority: Number(parts[0]) || 10, exchange: parts[1] || a.data };
          });
        } else {
          results[t] = answers.map((a: any) => String(a.data).replace(/^"|"$/g, ''));
        }
      } catch {
        // ignore individual type failure
      }
    })
  );

  return {
    domain,
    durationMs: Date.now() - start,
    records: results,
  };
}

export const DomainNetworkTools: React.FC<DomainNetworkToolsProps> = ({ tool, onSelectTool }) => {
  const [domainInput, setDomainInput] = useState<string>('bhvsy.github.io');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const [dnsData, setDnsData] = useState<any>(null);
  const [tlsData, setTlsData] = useState<any>(null);
  const [headersData, setHeadersData] = useState<any>(null);
  const [xrayData, setXrayData] = useState<any>(null);
  const [activeRecordFilter, setActiveRecordFilter] = useState<string>('ALL');

  const runProbe = async (targetDomain = domainInput) => {
    const clean = targetDomain.trim();
    if (!clean) return;
    setLoading(true);
    setError(null);

    try {
      if (tool.id === 'dns-checker') {
        try {
          const res = await fetch(`/api/dns?domain=${encodeURIComponent(clean)}`);
          if (!res.ok) throw new Error('Backend DNS error');
          const data = await res.json();
          setDnsData(data);
        } catch {
          const fallback = await queryCloudflareDohFallback(clean.replace(/^https?:\/\//, '').split('/')[0]);
          setDnsData(fallback);
        }
      } else if (tool.id === 'tls-checker') {
        const res = await fetch(`/api/tls?domain=${encodeURIComponent(clean)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'TLS handshake failed');
        setTlsData(data);
      } else if (tool.id === 'headers-checker') {
        const res = await fetch(`/api/headers?url=${encodeURIComponent(clean)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'HTTP headers check failed');
        setHeadersData(data);
      } else if (tool.id === 'domain-xray') {
        const res = await fetch(`/api/domain-xray?domain=${encodeURIComponent(clean)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Domain X-Ray failed');
        setXrayData(data);
      }
    } catch (e: any) {
      setError(e.message || 'Diagnostic probe failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runProbe(domainInput);
  }, [tool.id]);

  const copyJsonReport = (payload: any) => {
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="space-y-6">
      {/* Sub-navigation between the 4 Domain & Net Tools */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
        <div className="flex flex-wrap items-center gap-1">
          {[
            { id: 'dns-checker', label: 'DNS Record Checker' },
            { id: 'tls-checker', label: 'SSL / TLS Inspector' },
            { id: 'headers-checker', label: 'HTTP Security Headers' },
            { id: 'domain-xray', label: 'Full Domain X-Ray (360°)' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTool(item.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                tool.id === item.id
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-slate-400 mr-1">Quick Targets:</span>
          {['bhvsy.github.io', 'rojuka.com', 'cloudflare.com', 'github.com'].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => {
                setDomainInput(preset);
                runProbe(preset);
              }}
              className="px-2.5 py-1 text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-md transition-colors"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Main Input Bar */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={domainInput}
            onChange={(e) => setDomainInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && runProbe()}
            placeholder="Enter domain or URL (e.g., bhvsy.github.io, rojuka.com, google.com)..."
            className="flex-1 px-4 py-3 text-sm font-mono bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="button"
            onClick={() => runProbe()}
            disabled={loading}
            className="px-6 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {loading ? 'Probing Target...' : `Run ${tool.shortName}`}
          </button>
        </div>
        {error && <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{error}</p>}
      </div>

      {/* 1. DNS CHECKER OUTPUT */}
      {tool.id === 'dns-checker' && dnsData && (
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                DNS Resolution Table for <span className="font-mono text-indigo-600 dark:text-indigo-400">{dnsData.domain}</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums mt-0.5">
                Query completed in {dnsData.durationMs} ms · Live Authoritative / DoH Records
              </p>
            </div>

            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
              {['ALL', 'A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS'].map((rt) => (
                <button
                  key={rt}
                  type="button"
                  onClick={() => setActiveRecordFilter(rt)}
                  className={`px-2.5 py-1 text-xs font-mono font-semibold rounded-md transition-colors ${
                    activeRecordFilter === rt
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {rt}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-mono tabular-nums">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                  <th className="py-2.5 pr-4 w-24">Type</th>
                  <th className="py-2.5 px-4">Record Value / Target</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {(['A', 'AAAA', 'CNAME', 'MX', 'NS', 'TXT'] as const)
                  .filter((t) => activeRecordFilter === 'ALL' || activeRecordFilter === t)
                  .flatMap((t) => {
                    const list = dnsData.records?.[t] || [];
                    return list.map((val: any, idx: number) => (
                      <tr key={`${t}-${idx}`} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                        <td className="py-3 pr-4 font-bold text-indigo-600 dark:text-indigo-400">{t}</td>
                        <td className="py-3 px-4 text-slate-900 dark:text-slate-100 break-all">
                          {t === 'MX' ? `Priority ${val.priority} → ${val.exchange}` : String(val)}
                        </td>
                      </tr>
                    ));
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. TLS CERTIFICATE CHECKER OUTPUT */}
      {tool.id === 'tls-checker' && tlsData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  X.509 SSL/TLS Certificate Chain — <span className="font-mono">{tlsData.domain}</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums mt-0.5">
                  Port {tlsData.port} Handshake: {tlsData.handshakeMs} ms · Protocol: {tlsData.protocol} · Cipher: {tlsData.cipher}
                </p>
              </div>
              <span
                className={`text-xs font-mono font-bold ${
                  tlsData.daysRemaining > 14
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {tlsData.daysRemaining} Days Remaining
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg space-y-1.5">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Subject Common Name (CN)</span>
                <p className="font-mono font-bold text-slate-900 dark:text-slate-100">
                  {tlsData.subject?.CN || tlsData.domain}
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg space-y-1.5">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Issuer Certificate Authority</span>
                <p className="font-mono font-bold text-slate-900 dark:text-slate-100">
                  {tlsData.issuer?.O || tlsData.issuer?.CN || 'Verified CA'} ({tlsData.issuer?.CN})
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg space-y-1.5">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Valid From (UTC)</span>
                <p className="font-mono tabular-nums text-slate-900 dark:text-slate-100">{tlsData.validFrom}</p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg space-y-1.5">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Expires On (UTC)</span>
                <p className="font-mono tabular-nums text-slate-900 dark:text-slate-100">{tlsData.validTo}</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                SHA-256 Certificate Fingerprint
              </span>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono text-slate-700 dark:text-slate-300 break-all">
                {tlsData.fingerprint256}
              </div>
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Subject Alternative Names ({tlsData.altNames?.length || 0} SANs)
            </h4>
            <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1">
              {tlsData.altNames?.map((san: string, i: number) => (
                <div
                  key={i}
                  className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-xs font-mono text-slate-700 dark:text-slate-300"
                >
                  {san}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. HTTP SECURITY HEADERS OUTPUT */}
      {tool.id === 'headers-checker' && headersData && (
        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-2xl font-display font-extrabold">
                  {headersData.grade}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    HTTP Security Posture Score: {headersData.score}/100
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums mt-0.5">
                    HTTP {headersData.status} · Edge Server: {headersData.server} · {headersData.durationMs} ms
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => copyJsonReport(headersData)}
                className="px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied JSON' : 'Copy Audit JSON'}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                    <th className="py-2.5 pr-4">Security Header</th>
                    <th className="py-2.5 px-4">State</th>
                    <th className="py-2.5 pl-4">Detected Value / Remediation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                  {headersData.securityChecks?.map((chk: any, idx: number) => (
                    <tr key={idx}>
                      <td className="py-3 pr-4 font-sans font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                        {chk.label}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {chk.present ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> PRESENT
                          </span>
                        ) : (
                          <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" /> MISSING
                          </span>
                        )}
                      </td>
                      <td className="py-3 pl-4 text-slate-600 dark:text-slate-400 break-all">
                        {chk.present ? chk.value : chk.recommendation}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. FULL DOMAIN X-RAY (ALL-IN-ONE) OUTPUT */}
      {tool.id === 'domain-xray' && xrayData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1">
              <span className="text-xs text-slate-500 dark:text-slate-400">DNS IPv4 / IPv6 Endpoints</span>
              <div className="text-lg font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                {(xrayData.dns?.records?.A?.length || 0) + (xrayData.dns?.records?.AAAA?.length || 0)} Active IPs
              </div>
              <p className="text-xs font-mono text-slate-500 truncate">
                {xrayData.dns?.records?.A?.slice(0, 2).join(', ') || 'Edge CNAME'}
              </p>
            </div>

            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1">
              <span className="text-xs text-slate-500 dark:text-slate-400">SSL / TLS Certificate Status</span>
              <div className="text-lg font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {xrayData.tls?.daysRemaining ?? 'N/A'} Days Valid
              </div>
              <p className="text-xs font-mono text-slate-500 truncate">
                CA: {xrayData.tls?.issuer?.O || xrayData.tls?.issuer?.CN || 'TLS 1.3'}
              </p>
            </div>

            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1">
              <span className="text-xs text-slate-500 dark:text-slate-400">HTTP Security Grade &amp; Stack</span>
              <div className="text-lg font-mono font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
                Grade {xrayData.http?.grade || 'B'} ({xrayData.http?.score || 70}/100)
              </div>
              <p className="text-xs font-mono text-slate-500 truncate">
                Server: {xrayData.http?.server || 'Edge Proxy'} · Scan: {xrayData.totalScanMs} ms
              </p>
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Complete Domain X-Ray Telemetry Dump ({xrayData.domain})
              </h3>
              <button
                type="button"
                onClick={() => copyJsonReport(xrayData)}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied Full X-Ray JSON' : 'Copy Full Recon JSON'}
              </button>
            </div>

            <pre className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono text-slate-700 dark:text-slate-300 overflow-x-auto max-h-80">
              {JSON.stringify(xrayData, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
