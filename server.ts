import express from 'express';
import { createServer as createViteServer } from 'vite';
import dns from 'dns';
import tls from 'tls';
import net from 'net';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dnsPromises = dns.promises;

// Guard against SSRF to private/internal IP ranges
function isPrivateOrReservedHost(hostname: string): boolean {
  const clean = hostname.trim().toLowerCase();
  if (
    clean === 'localhost' ||
    clean.endsWith('.local') ||
    clean.endsWith('.internal') ||
    clean === '0.0.0.0' ||
    clean === '127.0.0.1' ||
    clean === '::1'
  ) {
    return true;
  }
  if (net.isIPv4(clean)) {
    const parts = clean.split('.').map(Number);
    if (
      parts[0] === 10 ||
      parts[0] === 127 ||
      parts[0] === 0 ||
      (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
      (parts[0] === 192 && parts[1] === 168) ||
      (parts[0] === 169 && parts[1] === 254)
    ) {
      return true;
    }
  }
  return false;
}

function extractDomain(input: string): string {
  let clean = input.trim();
  if (!clean) return '';
  try {
    if (clean.includes('://')) {
      const u = new URL(clean);
      return u.hostname;
    }
    const u = new URL('https://' + clean);
    return u.hostname;
  } catch {
    return clean.split('/')[0].split(':')[0];
  }
}

async function queryDnsRecords(domain: string) {
  const start = Date.now();
  const [a, aaaa, mx, txt, ns, cname, soa] = await Promise.all([
    dnsPromises.resolve4(domain).catch(() => [] as string[]),
    dnsPromises.resolve6(domain).catch(() => [] as string[]),
    dnsPromises.resolveMx(domain).catch(() => [] as dns.MxRecord[]),
    dnsPromises.resolveTxt(domain).catch(() => [] as string[][]),
    dnsPromises.resolveNs(domain).catch(() => [] as string[]),
    dnsPromises.resolveCname(domain).catch(() => [] as string[]),
    dnsPromises.resolveSoa(domain).catch(() => null),
  ]);

  return {
    domain,
    durationMs: Date.now() - start,
    records: {
      A: a,
      AAAA: aaaa,
      CNAME: cname,
      MX: mx.sort((x, y) => x.priority - y.priority),
      NS: ns,
      TXT: txt.map((chunks) => chunks.join('')),
      SOA: soa,
    },
  };
}

function inspectTlsCertificate(domain: string, port = 443): Promise<any> {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const socket = tls.connect(
      {
        host: domain,
        port,
        servername: domain,
        rejectUnauthorized: false,
        timeout: 6000,
      },
      () => {
        const cert = socket.getPeerCertificate(true);
        const cipher = socket.getCipher();
        const protocol = socket.getProtocol();
        const authorized = socket.authorized;
        const authError = socket.authorizationError;
        const handshakeMs = Date.now() - start;
        socket.end();

        if (!cert || Object.keys(cert).length === 0) {
          return reject(new Error('No TLS certificate presented by remote host'));
        }

        const validFrom = cert.valid_from ? new Date(cert.valid_from) : null;
        const validTo = cert.valid_to ? new Date(cert.valid_to) : null;
        const now = new Date();
        const daysRemaining = validTo
          ? Math.floor((validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          : 0;

        const altNames = cert.subjectaltname
          ? cert.subjectaltname.split(',').map((s: string) => s.trim().replace(/^DNS:/i, ''))
          : [];

        resolve({
          domain,
          port,
          handshakeMs,
          authorized,
          authorizationError: authError || null,
          protocol: protocol || 'TLSv1.3',
          cipher: cipher ? `${cipher.name} (${cipher.version})` : 'Unknown',
          subject: cert.subject || {},
          issuer: cert.issuer || {},
          serialNumber: cert.serialNumber || '',
          fingerprint256: cert.fingerprint256 || '',
          validFrom: validFrom ? validFrom.toISOString() : cert.valid_from,
          validTo: validTo ? validTo.toISOString() : cert.valid_to,
          daysRemaining,
          isExpired: daysRemaining < 0,
          altNames,
        });
      }
    );

    socket.on('timeout', () => {
      socket.destroy();
      reject(new Error('TLS connection timed out (6000ms)'));
    });

    socket.on('error', (err) => {
      socket.destroy();
      reject(err);
    });
  });
}

async function inspectHttpHeaders(targetUrl: string) {
  let formatted = targetUrl.trim();
  if (!/^https?:\/\//i.test(formatted)) {
    formatted = 'https://' + formatted;
  }
  const u = new URL(formatted);
  if (isPrivateOrReservedHost(u.hostname)) {
    throw new Error('Private or reserved hostname is not permitted');
  }

  const start = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 7500);

  try {
    const res = await fetch(u.toString(), {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': 'BhvsyTools-SecurityScanner/2.0 (+https://bhvsy.github.io)',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    const durationMs = Date.now() - start;
    const rawHeaders: Record<string, string> = {};
    res.headers.forEach((value, key) => {
      rawHeaders[key.toLowerCase()] = value;
    });

    const securityChecks = [
      {
        header: 'strict-transport-security',
        label: 'HTTP Strict Transport Security (HSTS)',
        present: Boolean(rawHeaders['strict-transport-security']),
        value: rawHeaders['strict-transport-security'] || null,
        recommendation: 'Add Strict-Transport-Security: max-age=63072000; includeSubDomains; preload',
        weight: 20,
      },
      {
        header: 'content-security-policy',
        label: 'Content Security Policy (CSP)',
        present: Boolean(rawHeaders['content-security-policy']),
        value: rawHeaders['content-security-policy'] || null,
        recommendation: 'Define a strict Content-Security-Policy header to mitigate XSS and injection attacks.',
        weight: 25,
      },
      {
        header: 'x-frame-options',
        label: 'X-Frame-Options / Clickjacking Guard',
        present:
          Boolean(rawHeaders['x-frame-options']) ||
          Boolean(rawHeaders['content-security-policy']?.includes('frame-ancestors')),
        value: rawHeaders['x-frame-options'] || (rawHeaders['content-security-policy']?.includes('frame-ancestors') ? 'Covered via CSP frame-ancestors' : null),
        recommendation: 'Set X-Frame-Options: SAMEORIGIN or DENY',
        weight: 15,
      },
      {
        header: 'x-content-type-options',
        label: 'X-Content-Type-Options',
        present: rawHeaders['x-content-type-options']?.toLowerCase() === 'nosniff',
        value: rawHeaders['x-content-type-options'] || null,
        recommendation: 'Set X-Content-Type-Options: nosniff',
        weight: 15,
      },
      {
        header: 'referrer-policy',
        label: 'Referrer-Policy',
        present: Boolean(rawHeaders['referrer-policy']),
        value: rawHeaders['referrer-policy'] || null,
        recommendation: 'Set Referrer-Policy: strict-origin-when-cross-origin',
        weight: 15,
      },
      {
        header: 'permissions-policy',
        label: 'Permissions-Policy',
        present: Boolean(rawHeaders['permissions-policy']),
        value: rawHeaders['permissions-policy'] || null,
        recommendation: 'Set Permissions-Policy: camera=(), microphone=(), geolocation=()',
        weight: 10,
      },
    ];

    const score = securityChecks.reduce((acc, item) => acc + (item.present ? item.weight : 0), 0);
    let grade = 'F';
    if (score >= 90) grade = 'A+';
    else if (score >= 80) grade = 'A';
    else if (score >= 65) grade = 'B';
    else if (score >= 50) grade = 'C';
    else if (score >= 30) grade = 'D';

    return {
      url: u.toString(),
      finalUrl: res.url,
      status: res.status,
      statusText: res.statusText,
      durationMs,
      score,
      grade,
      server: rawHeaders['server'] || rawHeaders['x-powered-by'] || 'Hidden / Edge Proxy',
      headers: rawHeaders,
      securityChecks,
    };
  } finally {
    clearTimeout(timer);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '5mb' }));

  // 1. Live DNS Checker Endpoint
  app.get('/api/dns', async (req, res) => {
    try {
      const raw = String(req.query.domain || '');
      const domain = extractDomain(raw);
      if (!domain || isPrivateOrReservedHost(domain)) {
        return res.status(400).json({ error: 'Please enter a valid public domain name.' });
      }
      const result = await queryDnsRecords(domain);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'DNS lookup failed' });
    }
  });

  // 2. Live TLS / SSL Certificate Inspector Endpoint
  app.get('/api/tls', async (req, res) => {
    try {
      const raw = String(req.query.domain || '');
      const domain = extractDomain(raw);
      if (!domain || isPrivateOrReservedHost(domain)) {
        return res.status(400).json({ error: 'Please enter a valid public domain name.' });
      }
      const result = await inspectTlsCertificate(domain, 443);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'TLS inspection failed' });
    }
  });

  // 3. HTTP Security Headers Inspector Endpoint
  app.get('/api/headers', async (req, res) => {
    try {
      const raw = String(req.query.url || '');
      if (!raw) {
        return res.status(400).json({ error: 'Please provide a URL or domain to inspect.' });
      }
      const result = await inspectHttpHeaders(raw);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'HTTP headers check failed' });
    }
  });

  // 4. Full Domain X-Ray (Combined DNS + TLS + Security Headers + IP Info)
  app.get('/api/domain-xray', async (req, res) => {
    try {
      const raw = String(req.query.domain || '');
      const domain = extractDomain(raw);
      if (!domain || isPrivateOrReservedHost(domain)) {
        return res.status(400).json({ error: 'Please enter a valid public domain name.' });
      }
      const start = Date.now();
      const [dnsData, tlsData, headersData] = await Promise.all([
        queryDnsRecords(domain).catch((e) => ({ error: e.message })),
        inspectTlsCertificate(domain, 443).catch((e) => ({ error: e.message })),
        inspectHttpHeaders('https://' + domain).catch((e) => ({ error: e.message })),
      ]);

      res.json({
        domain,
        scannedAt: new Date().toISOString(),
        totalScanMs: Date.now() - start,
        dns: dnsData,
        tls: tlsData,
        http: headersData,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Domain X-Ray failed' });
    }
  });

  // 5. Link Expander & Redirect Chain Tracer
  app.post('/api/expand-link', async (req, res) => {
    try {
      let currentUrl = String(req.body?.url || '').trim();
      if (!currentUrl) {
        return res.status(400).json({ error: 'Please provide a URL to trace.' });
      }
      if (!/^https?:\/\//i.test(currentUrl)) {
        currentUrl = 'https://' + currentUrl;
      }

      const hops: Array<{
        step: number;
        url: string;
        status: number;
        statusText: string;
        location?: string | null;
        server?: string | null;
        durationMs: number;
      }> = [];

      const maxHops = 10;
      for (let i = 0; i < maxHops; i++) {
        const parsed = new URL(currentUrl);
        if (isPrivateOrReservedHost(parsed.hostname)) {
          throw new Error('Redirect pointed to a private or reserved network host.');
        }

        const hopStart = Date.now();
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 6000);
        let response: Response;
        try {
          response = await fetch(currentUrl, {
            method: 'GET',
            redirect: 'manual',
            signal: controller.signal,
            headers: {
              'User-Agent': 'BhvsyTools-LinkExpander/2.0 (+https://bhvsy.github.io)',
            },
          });
        } finally {
          clearTimeout(timer);
        }

        const locationHeader = response.headers.get('location');
        hops.push({
          step: i + 1,
          url: currentUrl,
          status: response.status,
          statusText: response.statusText || (response.status === 200 ? 'OK' : 'Redirect'),
          location: locationHeader,
          server: response.headers.get('server'),
          durationMs: Date.now() - hopStart,
        });

        if (response.status >= 300 && response.status < 400 && locationHeader) {
          currentUrl = new URL(locationHeader, currentUrl).toString();
        } else {
          break;
        }
      }

      // Strip tracking query params (utm_*, fbclid, gclid, etc.) for clean URL output
      const finalUrlObj = new URL(currentUrl);
      const removedTrackers: string[] = [];
      const trackerKeys = [
        'utm_source',
        'utm_medium',
        'utm_campaign',
        'utm_term',
        'utm_content',
        'fbclid',
        'gclid',
        'igshid',
        'mc_cid',
        'mc_eid',
        'ref',
        'si',
      ];
      trackerKeys.forEach((k) => {
        if (finalUrlObj.searchParams.has(k)) {
          removedTrackers.push(`${k}=${finalUrlObj.searchParams.get(k)}`);
          finalUrlObj.searchParams.delete(k);
        }
      });

      res.json({
        originalUrl: req.body.url,
        finalUrl: currentUrl,
        cleanFinalUrl: finalUrlObj.toString(),
        removedTrackers,
        hopCount: hops.length,
        hops,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Could not expand URL' });
    }
  });

  // 6. Bulk Link Rot & Dead URL Checker
  app.post('/api/check-links', async (req, res) => {
    try {
      const rawUrls: string[] = Array.isArray(req.body?.urls) ? req.body.urls : [];
      const urls = rawUrls
        .map((u) => String(u).trim())
        .filter(Boolean)
        .slice(0, 25);

      if (urls.length === 0) {
        return res.status(400).json({ error: 'Provide at least one URL to check.' });
      }

      const results = await Promise.all(
        urls.map(async (rawUrl) => {
          let target = rawUrl;
          if (!/^https?:\/\//i.test(target)) {
            target = 'https://' + target;
          }
          const start = Date.now();
          try {
            const parsed = new URL(target);
            if (isPrivateOrReservedHost(parsed.hostname)) {
              return {
                url: rawUrl,
                status: 0,
                ok: false,
                category: 'blocked',
                finalUrl: target,
                durationMs: 0,
                error: 'Private host blocked',
              };
            }
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 6500);
            try {
              const resp = await fetch(target, {
                method: 'GET',
                redirect: 'follow',
                signal: controller.signal,
                headers: {
                  'User-Agent': 'BhvsyTools-LinkRotChecker/2.0 (+https://bhvsy.github.io)',
                },
              });
              const durationMs = Date.now() - start;
              const redirected = resp.url !== target;
              return {
                url: rawUrl,
                status: resp.status,
                statusText: resp.statusText,
                ok: resp.ok,
                category: resp.ok ? (redirected ? 'redirected' : 'healthy') : 'broken',
                finalUrl: resp.url,
                durationMs,
              };
            } finally {
              clearTimeout(timer);
            }
          } catch (e: any) {
            return {
              url: rawUrl,
              status: 0,
              statusText: 'Unreachable',
              ok: false,
              category: 'broken',
              finalUrl: target,
              durationMs: Date.now() - start,
              error: e.message || 'Connection failed',
            };
          }
        })
      );

      res.json({
        total: results.length,
        healthyCount: results.filter((r) => r.ok).length,
        brokenCount: results.filter((r) => !r.ok).length,
        results,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Bulk link check failed' });
    }
  });

  // 7. Google Photos Public Share URL Extractor
  app.post('/api/google-photos-extract', async (req, res) => {
    try {
      const shareUrl = String(req.body?.url || '').trim();
      if (!shareUrl) {
        return res.status(400).json({ error: 'Please paste a Google Photos share link or lh3.googleusercontent.com URL.' });
      }
      // If it is already an lh3.googleusercontent.com link, normalize it immediately
      if (shareUrl.includes('googleusercontent.com/')) {
        const baseUrl = shareUrl.split('=')[0];
        return res.json({
          baseUrl,
          originalWidthUrl: `${baseUrl}=w2400-h1600-no`,
          fullDownloadUrl: `${baseUrl}=d`,
          thumbnailUrl: `${baseUrl}=w600-h400-c`,
        });
      }

      const parsed = new URL(shareUrl);
      if (
        !parsed.hostname.endsWith('photos.app.goo.gl') &&
        !parsed.hostname.endsWith('photos.google.com')
      ) {
        return res.status(400).json({
          error: 'URL must be a photos.app.goo.gl or photos.google.com shared link.',
        });
      }

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 7000);
      try {
        const response = await fetch(shareUrl, {
          redirect: 'follow',
          signal: controller.signal,
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
          },
        });
        const html = await response.text();
        // Extract og:image or lh3.googleusercontent.com/pw/ links
        const ogMatch = html.match(/property=["']og:image["']\s+content=["'](https:\/\/lh3\.googleusercontent\.com\/[^"']+)["']/i)
          || html.match(/content=["'](https:\/\/lh3\.googleusercontent\.com\/[^"']+)["']\s+property=["']og:image["']/i)
          || html.match(/(https:\/\/lh3\.googleusercontent\.com\/pw\/[a-zA-Z0-9_-]+)/i)
          || html.match(/(https:\/\/lh3\.googleusercontent\.com\/[a-zA-Z0-9_-]{30,})/i);

        if (!ogMatch || !ogMatch[1]) {
          return res.status(422).json({
            error:
              'Could not locate a public image inside that Google Photos link. Make sure Link Sharing is enabled on the album/photo.',
          });
        }

        const baseUrl = ogMatch[1].split('=')[0];
        res.json({
          baseUrl,
          originalWidthUrl: `${baseUrl}=w2400-h1600-no`,
          fullDownloadUrl: `${baseUrl}=d`,
          thumbnailUrl: `${baseUrl}=w600-h400-c`,
        });
      } finally {
        clearTimeout(timer);
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to extract Google Photos direct URL' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*all', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Bhvsy Tools Server running on http://localhost:${PORT}`);
  });
}

startServer();
