export type ToolCategory = 'link' | 'image' | 'pdf' | 'domain';

export interface ToolFaq {
  question: string;
  answer: string;
}

export interface ToolDefinition {
  id: string;
  name: string;
  shortName: string;
  category: ToolCategory;
  categoryLabel: string;
  tagline: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
  executionMode: string;
  avgRpmTag: string;
  popular?: boolean;
  steps: string[];
  faqs: ToolFaq[];
}

export const TOOL_CATEGORIES: Array<{
  id: 'all' | ToolCategory;
  label: string;
  count: number;
  summary: string;
}> = [
  {
    id: 'all',
    label: 'All Utilities',
    count: 24,
    summary: 'Complete suite of 24 zero-login cloud link, image, PDF, and domain diagnostic tools.',
  },
  {
    id: 'link',
    label: 'Cloud & Link Tools',
    count: 10,
    summary: 'Instant direct download URLs for Google Drive, Photos, OneDrive, Dropbox, pCloud, Box, GitHub & shortlinks.',
  },
  {
    id: 'image',
    label: 'Image & Exam Lab',
    count: 6,
    summary: 'Exact-KB compression, HEIC conversion, exam photo-signature merger, form checker, and EXIF cleanup.',
  },
  {
    id: 'pdf',
    label: 'PDF Studio',
    count: 4,
    summary: '100% browser-native PDF merge, split, reorder, PDF-to-JPG extraction, digital signing, and protection.',
  },
  {
    id: 'domain',
    label: 'Domain & Net X-Ray',
    count: 4,
    summary: 'Live DNS propagation lookup, SSL/TLS certificate inspection, security headers grader, and full Domain X-Ray.',
  },
];

export const TOOLS_CATALOG: ToolDefinition[] = [
  // ==========================================
  // 1. CLOUD & LINK TOOLS (10 TOOLS)
  // ==========================================
  {
    id: 'direct-links',
    name: 'Universal Cloud Direct Link Hub',
    shortName: 'Direct Link Hub',
    category: 'link',
    categoryLabel: 'Cloud Link Engine',
    tagline: 'Auto-detects Google Drive, Photos, OneDrive, Dropbox, pCloud, Box & GitHub share URLs.',
    description:
      'Paste any shared link from 7 major cloud providers. Automatically detects the platform and generates permanent direct download URLs, HTML embed tags, Markdown snippets, cURL/Wget commands, and downloadable QR codes.',
    seoTitle: 'Universal Cloud Direct Link Generator – Drive, OneDrive, Dropbox | Bhvsy Tools',
    seoDescription:
      'Convert shared links from Google Drive, Google Photos, OneDrive, Dropbox, pCloud, Box, and GitHub into direct download links in one click.',
    keywords: [
      'cloud direct link generator',
      'direct download url converter',
      'google drive direct link',
      'onedrive direct download link',
      'dropbox direct link',
    ],
    executionMode: 'Instant Client-Side',
    avgRpmTag: '$14.50 Est. RPM',
    popular: true,
    steps: [
      'Copy the public share link from Google Drive, OneDrive, Dropbox, Box, pCloud, GitHub, or Google Photos.',
      'Paste one or multiple URLs into the Universal Direct Link Hub input box (supports batch conversion).',
      'Copy the direct download URL, HTML/Markdown embed code, or scan the generated QR code immediately.',
    ],
    faqs: [
      {
        question: 'Does the Universal Cloud Direct Link Generator store my shared files?',
        answer:
          'No. All URL parsing and pattern rewriting happen directly inside your browser in under 5 milliseconds. Your files remain hosted on your cloud provider.',
      },
      {
        question: 'Why does my direct download link ask for sign-in?',
        answer:
          'Ensure your cloud file permissions are set to "Anyone with the link can view" before converting the share URL.',
      },
      {
        question: 'Can I convert dozens of cloud links at once?',
        answer:
          'Yes. Switch to Batch Mode in the tool workspace to convert up to 100 cloud sharing links into direct URLs simultaneously.',
      },
    ],
  },
  {
    id: 'google-drive',
    name: 'Google Drive Direct Link Generator',
    shortName: 'Google Drive Link',
    category: 'link',
    categoryLabel: 'Cloud Link Engine',
    tagline: 'Convert Google Drive view links into instant direct download, preview, and raw stream URLs.',
    description:
      'Transform standard drive.google.com/file/d/ sharing links into 1-click direct download links, virus-scan bypass warnings for large archives, iframe document embed URLs, and CLI wget commands.',
    seoTitle: 'Google Drive Direct Download Link Generator (No Sign-In) | Bhvsy Tools',
    seoDescription:
      'Generate direct download links, image embed URLs, and terminal wget/curl commands from any public Google Drive sharing URL.',
    keywords: [
      'google drive direct link generator',
      'gdrive direct download link',
      'embed google drive image html',
      'wget google drive file',
    ],
    executionMode: 'Instant Client-Side',
    avgRpmTag: '$16.20 Est. RPM',
    popular: true,
    steps: [
      'Right-click your file in Google Drive, select Share, and set General Access to "Anyone with the link".',
      'Paste the copied drive.google.com link into the generator input.',
      'Copy the Direct Download URL, Large File Confirm URL, or HTML Image/Video Embed snippet.',
    ],
    faqs: [
      {
        question: 'How do I embed a Google Drive image directly in an HTML <img> tag?',
        answer:
          'Our generator outputs the high-speed lh3.googleusercontent.com/d/{FILE_ID} endpoint alongside uc?export=view, which renders cleanly inside HTML img tags and Notion pages.',
      },
      {
        question: 'What if my Google Drive file is larger than 100MB?',
        answer:
          'Use the generated Large File Confirm URL (drive.usercontent.google.com/download?id=...&confirm=t) or the ready-made cURL/Wget terminal snippet.',
      },
    ],
  },
  {
    id: 'google-photos',
    name: 'Google Photos Direct URL & Embed Generator',
    shortName: 'Google Photos URL',
    category: 'link',
    categoryLabel: 'Cloud Link Engine',
    tagline: 'Extract permanent CDN image links and custom-width parameters from Google Photos.',
    description:
      'Convert temporary photos.app.goo.gl share links or raw googleusercontent URLs into permanent, high-speed CDN image URLs with customizable width, height, smart crop, and force-download parameters.',
    seoTitle: 'Google Photos Direct Link & Image Embed Generator | Bhvsy Tools',
    seoDescription:
      'Convert Google Photos shared links into permanent direct image URLs for blogs, websites, Notion, and README files with custom width and crop parameters.',
    keywords: [
      'google photos direct link generator',
      'embed google photos on website',
      'photos.app.goo.gl to direct url',
      'lh3.googleusercontent.com parameters',
    ],
    executionMode: 'Hybrid Edge + Client',
    avgRpmTag: '$15.80 Est. RPM',
    popular: true,
    steps: [
      'Open Google Photos, click Share on any photo, and choose "Create Link" to get a photos.app.goo.gl URL.',
      'Paste the link into the extractor and click Extract Direct CDN URL.',
      'Adjust the target resolution (Original, 2400px, 1200px, or Square Crop) and copy your embed code.',
    ],
    faqs: [
      {
        question: 'How do URL parameters work on Google Photos lh3.googleusercontent.com links?',
        answer:
          'Appending =w1920-h1080 resizes the image on Google edge servers automatically, =s0 fetches the uncompressed original dimensions, and =d forces a direct browser file download.',
      },
      {
        question: 'Are extracted Google Photos links fast enough for production blogs?',
        answer:
          'Yes, they are served directly from Google global edge CDN (lh3.googleusercontent.com) with HTTP/3 and WebP content negotiation.',
      },
    ],
  },
  {
    id: 'one-drive',
    name: 'OneDrive Direct Download Link Generator',
    shortName: 'OneDrive Link',
    category: 'link',
    categoryLabel: 'Cloud Link Engine',
    tagline: 'Turn Microsoft OneDrive 1drv.ms and onedrive.live.com links into instant downloads.',
    description:
      'Converts OneDrive Personal and SharePoint/OneDrive for Business share URLs into direct download links using base64 URL token encoding and download=1 query transformation.',
    seoTitle: 'OneDrive Direct Download Link Generator (1drv.ms & SharePoint) | Bhvsy Tools',
    seoDescription:
      'Convert Microsoft OneDrive (1drv.ms, onedrive.live.com, and SharePoint) sharing URLs into direct download links with zero login required.',
    keywords: [
      'onedrive direct link generator',
      '1drv.ms direct download converter',
      'sharepoint direct download link',
      'onedrive embed link converter',
    ],
    executionMode: 'Instant Client-Side',
    avgRpmTag: '$18.40 Est. RPM',
    steps: [
      'In Microsoft OneDrive, select your file, click Share -> Copy Link (ensure Anyone with the link is enabled).',
      'Paste the 1drv.ms, onedrive.live.com, or SharePoint URL into the converter.',
      'Copy the generated API u! base64 direct stream link or the ?download=1 direct URL.',
    ],
    faqs: [
      {
        question: 'Why does OneDrive use a base64 u! token for direct downloads?',
        answer:
          'Microsoft OneDrive API allows direct unauthenticated file streaming when a public sharing URL is base64url-encoded and prefixed with u! on api.onedrive.com/v1.0/shares/.',
      },
      {
        question: 'Does this support OneDrive for Business / SharePoint URLs?',
        answer:
          'Yes. SharePoint and Office 365 tenant links are automatically converted using the download=1 endpoint convention.',
      },
    ],
  },
  {
    id: 'dropbox',
    name: 'Dropbox Direct & Raw Link Converter',
    shortName: 'Dropbox Link',
    category: 'link',
    categoryLabel: 'Cloud Link Engine',
    tagline: 'Convert Dropbox share URLs into direct file downloads (dl=1) and raw browser embeds (raw=1).',
    description:
      'Rewrites www.dropbox.com/scl/fi/ or /s/ links into dl.dropboxusercontent.com raw asset URLs so images, audio, videos, and stylesheets render natively without the Dropbox preview wrapper.',
    seoTitle: 'Dropbox Direct Download & Raw Asset Link Generator | Bhvsy Tools',
    seoDescription:
      'Convert Dropbox share links into direct download URLs (?dl=1) or raw browser-renderable media links (?raw=1) for websites and apps.',
    keywords: [
      'dropbox direct link generator',
      'dropbox raw image url',
      'dl.dropboxusercontent.com converter',
      'dropbox dl=0 to dl=1',
    ],
    executionMode: 'Instant Client-Side',
    avgRpmTag: '$14.90 Est. RPM',
    steps: [
      'Copy the public Dropbox link (ending in ?dl=0 or containing /scl/fi/ with an rlkey parameter).',
      'Paste the Dropbox URL into the converter field.',
      'Choose between Force Direct Download (?dl=1) or Raw Inline Media Stream (dl.dropboxusercontent.com).',
    ],
    faqs: [
      {
        question: 'Does this preserve the new Dropbox rlkey security parameter?',
        answer:
          'Yes! Modern Dropbox /scl/fi/ links require the rlkey query parameter to authorize access. Our parser preserves rlkey and st parameters while rewriting the host and delivery flags.',
      },
    ],
  },
  {
    id: 'pcloud',
    name: 'pCloud Direct Link Generator',
    shortName: 'pCloud Link',
    category: 'link',
    categoryLabel: 'Cloud Link Engine',
    tagline: 'Transform pCloud u.pcloud.link and e.pcloud.link URLs into direct download & stream links.',
    description:
      'Extract the pCloud file code from shared public links and generate direct download endpoints and media embed snippets for US and EU pCloud data regions.',
    seoTitle: 'pCloud Direct Download Link Generator (US & EU Regions) | Bhvsy Tools',
    seoDescription:
      'Convert pCloud shared links (u.pcloud.link and e.pcloud.link) into direct download and media streaming URLs.',
    keywords: ['pcloud direct link generator', 'u.pcloud.link direct download', 'e.pcloud.link converter'],
    executionMode: 'Instant Client-Side',
    avgRpmTag: '$13.10 Est. RPM',
    steps: [
      'Copy your public share link from pCloud (u.pcloud.link/publink/show?code=... or e.pcloud.link).',
      'Paste it into the pCloud URL input field.',
      'Copy the direct publink download endpoint or ready-made HTML audio/video embed tag.',
    ],
    faqs: [
      {
        question: 'What is the difference between u.pcloud.link and e.pcloud.link?',
        answer:
          'u.pcloud.link serves files hosted in the United States (Dallas, TX) data center, while e.pcloud.link serves files from the European Union (Luxembourg) data center. Both are supported automatically.',
      },
    ],
  },
  {
    id: 'box',
    name: 'Box Cloud Direct Link Converter',
    shortName: 'Box Cloud Link',
    category: 'link',
    categoryLabel: 'Cloud Link Engine',
    tagline: 'Convert Box.com shared file links into direct download static endpoints.',
    description:
      'Rewrites app.box.com/s/ shared file links into direct download static URLs and clean embeddable iframe widgets for enterprise documentation and client portals.',
    seoTitle: 'Box.com Direct Download Link & Embed Generator | Bhvsy Tools',
    seoDescription:
      'Convert Box cloud shared links (app.box.com/s/...) into direct file download URLs and embeddable viewer frames.',
    keywords: ['box direct link generator', 'app.box.com direct download', 'box cloud shared link converter'],
    executionMode: 'Instant Client-Side',
    avgRpmTag: '$17.50 Est. RPM',
    steps: [
      'Open Box.com, click Share on your file, and enable "People with the link" access.',
      'Paste your app.box.com/s/{SHARED_NAME} URL into the Box converter.',
      'Copy the direct static download endpoint or the Box Embed Widget iframe code.',
    ],
    faqs: [
      {
        question: 'Can I embed a Box document viewer directly on my site?',
        answer:
          'Yes. In addition to the direct download URL, the tool generates the official app.box.com/embed/s/{TOKEN} iframe snippet.',
      },
    ],
  },
  {
    id: 'github',
    name: 'GitHub Raw & jsDelivr CDN Link Generator',
    shortName: 'GitHub Raw & CDN',
    category: 'link',
    categoryLabel: 'Cloud Link Engine',
    tagline: 'Convert GitHub repo blobs into raw.githubusercontent.com and global jsDelivr CDN links.',
    description:
      'Transform any github.com/{user}/{repo}/blob/{branch}/{path} URL into a raw file URL, a production-grade jsDelivr CDN link (with proper Content-Type headers and minification), and a git clone/curl command.',
    seoTitle: 'GitHub Raw Link & jsDelivr CDN URL Converter | Bhvsy Tools',
    seoDescription:
      'Convert GitHub file blob URLs into raw.githubusercontent.com links and lightning-fast jsDelivr production CDN URLs.',
    keywords: [
      'github raw link generator',
      'github to jsdelivr cdn converter',
      'download single file from github',
      'raw.githubusercontent.com converter',
    ],
    executionMode: 'Instant Client-Side',
    avgRpmTag: '$15.40 Est. RPM',
    steps: [
      'Navigate to any file inside a public GitHub repository and copy the browser URL containing /blob/.',
      'Paste the GitHub URL into the converter.',
      'Copy the production jsDelivr CDN link (ideal for JS/CSS/Images) or raw.githubusercontent.com link.',
    ],
    faqs: [
      {
        question: 'Why should I use the jsDelivr CDN link instead of raw.githubusercontent.com?',
        answer:
          'GitHub serves raw.githubusercontent.com files with text/plain headers and strict rate limits. The generated cdn.jsdelivr.net/gh/ link serves files from a global multi-CDN with proper MIME types and permanent caching.',
      },
    ],
  },
  {
    id: 'link-expander',
    name: 'Short Link Expander & Redirect Tracer',
    shortName: 'Link Expander',
    category: 'link',
    categoryLabel: 'Link Intelligence',
    tagline: 'Unshorten bit.ly, t.co, tinyurl & trace every HTTP 301/302 redirect hop safely.',
    description:
      'Inspect where any shortened or obfuscated link actually leads before clicking it. Traces the full multi-hop redirect chain, records HTTP status codes and server latencies, and strips UTM/fbclid tracking parameters.',
    seoTitle: 'Short URL Expander & Redirect Chain Tracer (Unshorten Links) | Bhvsy Tools',
    seoDescription:
      'Safely unshorten bit.ly, tinyurl, t.co, and short links. View the complete 301/302 redirect hop chain and strip UTM tracking parameters.',
    keywords: [
      'url expander',
      'redirect chain checker',
      'unshorten url online',
      '301 302 redirect tracer',
      'remove utm parameters from url',
    ],
    executionMode: 'Live Server Probe',
    avgRpmTag: '$16.90 Est. RPM',
    steps: [
      'Paste any shortened URL (bit.ly, tinyurl.com, t.co, is.gd) or affiliate tracking link.',
      'Click "Trace Redirect Chain" to inspect every intermediate hop without opening the link in your browser.',
      'Copy the final destination URL or the tracker-free Clean URL stripped of utm_*, fbclid, and gclid tags.',
    ],
    faqs: [
      {
        question: 'How does the Link Expander protect me from phishing links?',
        answer:
          'Our server performs a headless, non-executing HTTP header trace with manual redirect following, revealing the exact final domain and every intermediate redirect hop before your browser ever visits the site.',
      },
    ],
  },
  {
    id: 'link-rot-checker',
    name: 'Bulk Link Rot & Dead URL Checker',
    shortName: 'Link Rot Checker',
    category: 'link',
    categoryLabel: 'Link Intelligence',
    tagline: 'Scan up to 25 URLs or paste Markdown/HTML to detect 404 broken links and slow redirects.',
    description:
      'Paste a list of URLs or raw blog Markdown/HTML. Automatically extracts all outbound links and checks their live HTTP status codes (200 OK, 301 Redirect, 404 Not Found, 500 Server Error) and response latency.',
    seoTitle: 'Bulk Link Rot & Broken URL Checker for Blogs & Docs | Bhvsy Tools',
    seoDescription:
      'Extract and test multiple URLs from Markdown, HTML, or plain lists to find broken 404 dead links and redirect chains.',
    keywords: ['link rot checker', 'broken link checker online', 'bulk url status checker', 'markdown dead link scanner'],
    executionMode: 'Live Server Probe',
    avgRpmTag: '$19.10 Est. RPM',
    steps: [
      'Paste a list of URLs (one per line) or paste raw HTML / Markdown content containing links.',
      'Click "Extract & Scan All Links" to run parallel HTTP status probes.',
      'Filter results by Healthy (200), Redirected (301/302), or Broken (404/Timeout) and export a CSV report.',
    ],
    faqs: [
      {
        question: 'Can I paste an entire Markdown blog post or README.md file?',
        answer:
          'Yes! Click "Extract URLs from Text/Markdown" and the tool will automatically pull every https:// link out of your document before testing them.',
      },
    ],
  },

  // ==========================================
  // 2. IMAGE & EXAM TOOLS (6 TOOLS)
  // ==========================================
  {
    id: 'compress-to-kb',
    name: 'Compress Image to Exact KB (10KB / 20KB / 50KB / 100KB)',
    shortName: 'Compress to KB',
    category: 'image',
    categoryLabel: 'Image & Exam Lab',
    tagline: 'Binary-search quality engine that hits your exact target KB limit for government & college portals.',
    description:
      'Need an image strictly under 20KB, 50KB, or 100KB for SSC, UPSC, IBPS, NEET, JEE, or passport portals? Our binary-search canvas encoder automatically finds the highest visual quality that fits strictly below your target KB.',
    seoTitle: 'Compress Image to 20KB, 50KB, 100KB Exact Size Online | Bhvsy Tools',
    seoDescription:
      'Compress JPG, PNG, and WebP images to an exact KB target (10KB, 20KB, 50KB, 100KB) in your browser for SSC, UPSC, NEET, JEE, and job forms.',
    keywords: [
      'compress image to 20kb',
      'compress image to 50kb',
      'reduce photo size in kb for exam form',
      'exact kb image compressor',
    ],
    executionMode: '100% Client-Side Canvas',
    avgRpmTag: '$12.80 Est. RPM',
    popular: true,
    steps: [
      'Drop your photo or signature image (JPG, PNG, WebP) into the workspace.',
      'Select a preset target (20 KB for signatures, 50 KB for passport photos, 100 KB for documents) or enter any custom KB value.',
      'Preview the side-by-side comparison with exact byte readouts and download your compressed JPG/WebP instantly.',
    ],
    faqs: [
      {
        question: 'How does the tool hit the exact KB target so accurately?',
        answer:
          'Instead of a vague percentage slider, our engine runs an 8-step binary search across JPEG/WebP quantization levels and progressive resolution scaling until the output blob is between 85% and 99% of your maximum KB cap.',
      },
      {
        question: 'Are my personal passport photos uploaded to any server?',
        answer:
          'Never. Compression runs 100% locally on your device GPU/CPU using the HTML5 OffscreenCanvas API.',
      },
    ],
  },
  {
    id: 'convert-resize',
    name: 'Image Converter & Pixel/CM/DPI Resizer',
    shortName: 'Convert & Resize',
    category: 'image',
    categoryLabel: 'Image & Exam Lab',
    tagline: 'Convert between JPG, PNG & WebP with exact pixel, centimeter, or aspect-ratio resizing.',
    description:
      'Resize images by pixels (px), centimeters (cm at 200/300 DPI), or social/exam aspect ratios (3.5×4.5cm Passport, 1:1, 16:9, 4:3) and transcode between JPEG, PNG, and WebP.',
    seoTitle: 'Image Format Converter & Pixel / CM Resizer (300 DPI) | Bhvsy Tools',
    seoDescription:
      'Resize images to exact pixel or centimeter dimensions (3.5x4.5cm passport size) and convert between JPG, PNG, and WebP locally.',
    keywords: [
      'image converter and resizer',
      'resize photo 3.5cm x 4.5cm',
      'webp to jpg converter',
      'png to jpg resizer online',
    ],
    executionMode: '100% Client-Side Canvas',
    avgRpmTag: '$13.40 Est. RPM',
    steps: [
      'Upload any image file and choose your unit mode: Pixels (px) or Physical Centimeters (cm @ 300 DPI).',
      'Pick a quick preset (Passport 3.5×4.5 cm, Signature 6×2 cm, Full HD 1920×1080) or enter custom dimensions.',
      'Select output format (JPG, PNG, WebP) and click Download Resized Image.',
    ],
    faqs: [
      {
        question: 'How many pixels is a standard 3.5 cm x 4.5 cm Indian passport photo?',
        answer:
          'At 200 DPI, 3.5 cm × 4.5 cm equals 276 × 354 pixels. At 300 DPI print quality, it equals 413 × 531 pixels. Our tool includes both one-click presets.',
      },
    ],
  },
  {
    id: 'heic-to-jpg',
    name: 'HEIC / AVIF / WebP to JPG & PNG Converter',
    shortName: 'HEIC/AVIF to JPG',
    category: 'image',
    categoryLabel: 'Image & Exam Lab',
    tagline: 'Convert modern iPhone & web image formats into universally accepted JPG or PNG files.',
    description:
      'Transform Apple iPhone photos, modern AVIF, WebP, or BMP files into standard high-compatibility JPEG or lossless PNG files with configurable background fill and batch ZIP export.',
    seoTitle: 'HEIC, AVIF & WebP to JPG/PNG Batch Converter | Bhvsy Tools',
    seoDescription:
      'Convert iPhone HEIC, AVIF, and WebP photos to standard JPG or PNG format in your browser with batch conversion support.',
    keywords: ['heic to jpg converter', 'avif to jpg online', 'iphone photo to jpeg converter', 'webp to png batch'],
    executionMode: '100% Client-Side Canvas',
    avgRpmTag: '$15.10 Est. RPM',
    steps: [
      'Drag and drop one or multiple images (.heic, .avif, .webp, .png, .bmp) into the dropzone.',
      'Select your target output format (Standard JPEG 92% Quality or Lossless PNG).',
      'Download individual converted files or grab all converted images as a single ZIP archive.',
    ],
    faqs: [
      {
        question: 'Why do government and job portals reject iPhone photos?',
        answer:
          'iPhones capture photos in HEIC format by default, and many modern browsers save images as WebP or AVIF. Most legacy application portals only accept baseline .jpg or .jpeg files.',
      },
    ],
  },
  {
    id: 'photo-signature',
    name: 'Exam Photo & Signature Maker (Name + Date Stamp)',
    shortName: 'Photo & Signature',
    category: 'image',
    categoryLabel: 'Image & Exam Lab',
    tagline: 'Add Name & Date of Photo (DOP) slate onto passport photos or combine Photo + Signature.',
    description:
      'Built specifically for SSC, UPSC, NEET, JEE, and IBPS exams. Automatically adds the mandatory white/black Name & Date of Photo plaque at the bottom of your passport photo, or merges Photo + Signature into a single composite image under 50KB.',
    seoTitle: 'Exam Photo Name & Date Stamp Maker + Photo Signature Merger | Bhvsy Tools',
    seoDescription:
      'Add candidate Name and Date of Photo (DOP) to passport photos or merge Photo and Signature for SSC, UPSC, NEET, JEE, and IBPS exams.',
    keywords: [
      'photo with name and date maker',
      'ssc photo signature maker',
      'merge photo and signature online',
      'neet passport photo date stamp',
    ],
    executionMode: '100% Client-Side Canvas',
    avgRpmTag: '$14.20 Est. RPM',
    popular: true,
    steps: [
      'Upload your passport photo (and optional signature image if using Combined Photo + Signature mode).',
      'Enter Candidate Full Name and Date of Photograph (DOP) to render the official exam compliant bottom plaque.',
      'Set your target KB limit (e.g., 50 KB) and download the ready-to-upload exam JPEG.',
    ],
    faqs: [
      {
        question: 'Does the Name & Date plaque cover too much of the face?',
        answer:
          'No. The slate is precision-calibrated to occupy the bottom 16% of the 3.5×4.5 cm frame with high-contrast bold typography, meeting NTA (NEET/JEE) and SSC guidelines.',
      },
    ],
  },
  {
    id: 'upload-checker',
    name: 'Exam & Portal Photo Upload Validator',
    shortName: 'Upload Checker',
    category: 'image',
    categoryLabel: 'Image & Exam Lab',
    tagline: 'Test if your photo or signature passes SSC, UPSC, IBPS, NEET, or GATE rules before uploading.',
    description:
      'Select an exam preset (SSC CGL/CHSL, UPSC Civil Services, IBPS/SBI PO, NEET UG, JEE Main, PAN/NSDL) and drop your file. Instantly audits file format, exact KB range, pixel dimensions, aspect ratio, and auto-fixes any failed check in one click!',
    seoTitle: 'Exam Photo & Signature Upload Eligibility Checker (SSC, UPSC, NEET) | Bhvsy Tools',
    seoDescription:
      'Verify if your photo and signature meet exact KB size, pixel dimension, and format rules for SSC, UPSC, IBPS, NEET, and JEE portals. One-click auto-fix included.',
    keywords: [
      'exam photo upload checker',
      'ssc photo size validator',
      'upsc photo dimension checker',
      'ibps photo signature specification check',
    ],
    executionMode: '100% Client-Side Audit',
    avgRpmTag: '$13.90 Est. RPM',
    steps: [
      'Choose your target exam or government portal preset (SSC, UPSC, IBPS, NEET/JEE, PAN Card) and Document Type (Photo or Signature).',
      'Drop your image file to run an instant 5-point compliance audit (Format, Min/Max KB, Width, Height, Aspect Ratio).',
      'If any rule fails, click "Auto-Fix to Match Exam Spec" to generate a 100% compliant file immediately.',
    ],
    faqs: [
      {
        question: 'What happens if my image fails the dimension or KB check?',
        answer:
          'You do not need to switch tools—just click the "Auto-Fix to Match Spec" button and our canvas engine resizes and re-encodes your image to pass all 5 checks.',
      },
    ],
  },
  {
    id: 'photo-cleanup',
    name: 'Photo EXIF Privacy Scrubber & Document Enhancer',
    shortName: 'Photo Cleanup',
    category: 'image',
    categoryLabel: 'Image & Exam Lab',
    tagline: 'Strip hidden GPS/EXIF camera metadata and whiten gray signature/document backgrounds.',
    description:
      'Dual-purpose utility: (1) Completely strips all hidden EXIF, GPS location coordinates, and camera serial metadata by re-encoding a clean pixel buffer, and (2) Whitens dark shadows on phone photos of handwritten signatures or documents.',
    seoTitle: 'Photo EXIF Metadata Remover & Signature Background Whitener | Bhvsy Tools',
    seoDescription:
      'Remove hidden GPS & EXIF metadata from photos and clean up gray shadows from handwritten signature scans in your browser.',
    keywords: [
      'remove exif data from photo',
      'signature background whitener',
      'clean scanned document online',
      'strip gps metadata image',
    ],
    executionMode: '100% Client-Side DSP',
    avgRpmTag: '$14.60 Est. RPM',
    steps: [
      'Upload a photo to scrub its hidden EXIF/GPS metadata, or upload a smartphone photo of a handwritten signature.',
      'Toggle "Signature & Document Background Whitener" and adjust the threshold slider to turn gray paper shadows pure white.',
      'Download your privacy-scrubbed, high-contrast output image.',
    ],
    faqs: [
      {
        question: 'Why do handwritten signature photos look gray when uploaded to forms?',
        answer:
          'Smartphone cameras meter white paper as 18% middle gray. Our thresholding filter pushes paper luminance above the cutoff to pure #FFFFFF white while sharpening blue or black ink.',
      },
    ],
  },

  // ==========================================
  // 3. PDF STUDIO TOOLS (4 TOOLS)
  // ==========================================
  {
    id: 'merge-split-reorder-pdf',
    name: 'Merge, Split & Reorder PDF Pages',
    shortName: 'Merge & Split PDF',
    category: 'pdf',
    categoryLabel: 'PDF Studio',
    tagline: 'Combine multiple PDFs, reorder pages, delete unwanted pages, or extract page ranges locally.',
    description:
      'Powered by WebAssembly/JavaScript pdf-lib right inside your browser. Upload multiple PDF files, reorder or remove specific pages, or extract custom page ranges (e.g., 1-3, 5) into a brand-new PDF with zero server uploads.',
    seoTitle: 'Merge, Split & Reorder PDF Pages Online (100% Private) | Bhvsy Tools',
    seoDescription:
      'Combine multiple PDF files, reorder individual pages, delete pages, or split PDF page ranges directly in your browser without uploading to a server.',
    keywords: [
      'merge pdf online free',
      'split pdf pages',
      'reorder pdf pages in browser',
      'client side pdf merger',
    ],
    executionMode: '100% Client-Side PDF-Lib',
    avgRpmTag: '$17.80 Est. RPM',
    popular: true,
    steps: [
      'Add one or more PDF files from your device (or click "Load Sample Multi-Page PDF" to test right away).',
      'Use the interactive Page Deck to move pages left/right, remove pages, or filter by page range.',
      'Click "Export Combined PDF" to generate and download your new PDF file instantly.',
    ],
    faqs: [
      {
        question: 'Are confidential PDF bank statements or IDs safe to merge here?',
        answer:
          '100% safe. The entire PDF binary parsing and assembly uses pdf-lib inside your browser memory. Not a single byte leaves your computer.',
      },
    ],
  },
  {
    id: 'pdf-to-jpg',
    name: 'PDF to High-Res Image & Page Extractor',
    shortName: 'PDF to Image/Cards',
    category: 'pdf',
    categoryLabel: 'PDF Studio',
    tagline: 'Inspect PDF page geometry, extract individual single-page PDFs, or render shareable page cards.',
    description:
      'Load any PDF document to inspect exact page dimensions (A4, Letter, Legal in points & mm), split every page into standalone 1-page files, or render high-resolution visual summary cards.',
    seoTitle: 'PDF Page Extractor & High-Res Page Card Exporter | Bhvsy Tools',
    seoDescription:
      'Extract individual pages from PDF documents, inspect page dimensions, and export high-resolution page snapshots or ZIP archives.',
    keywords: ['pdf page extractor', 'pdf to jpg online', 'extract single page from pdf', 'pdf dimension inspector'],
    executionMode: '100% Client-Side',
    avgRpmTag: '$16.40 Est. RPM',
    steps: [
      'Drop any PDF file (or generate a sample invoice PDF in 1 click) into the workspace.',
      'View the page breakdown table showing exact width, height, orientation, and paper standard.',
      'Download individual pages or export a bundled ZIP archive of all separated pages.',
    ],
    faqs: [
      {
        question: 'Can I extract just a single page from a 50-page PDF?',
        answer:
          'Yes! Each page row has a dedicated "Extract Page" button that downloads just that single page immediately.',
      },
    ],
  },
  {
    id: 'sign-pdf',
    name: 'Sign PDF (Draw, Type or Stamp Signature)',
    shortName: 'Sign PDF',
    category: 'pdf',
    categoryLabel: 'PDF Studio',
    tagline: 'Draw your handwritten signature on an ink pad or type a cursive sign-off and stamp it onto any PDF.',
    description:
      'Draw a smooth vector/raster signature using your mouse or touchscreen, choose ink color (Executive Blue, Jet Black, Crimson), position the signature stamp (Bottom Right, Bottom Left, Center) with an optional date & signer stamp, and save the signed PDF.',
    seoTitle: 'Sign PDF Online Free – Draw or Stamp Signature Locally | Bhvsy Tools',
    seoDescription:
      'Sign PDF documents directly in your browser. Draw your handwritten signature, select ink color and placement, and download the signed PDF.',
    keywords: ['sign pdf online free', 'add signature to pdf', 'electronic signature pdf browser', 'stamp pdf signature'],
    executionMode: '100% Client-Side PDF-Lib',
    avgRpmTag: '$21.30 Est. RPM',
    popular: true,
    steps: [
      'Upload your PDF document (or load the built-in NDA / Agreement sample PDF).',
      'Draw your signature on the interactive signature pad or switch to Typed Signature mode.',
      'Select target pages (Last Page, First Page, or All Pages), corner placement, and click "Stamp & Download Signed PDF".',
    ],
    faqs: [
      {
        question: 'Does the signature flatten into the PDF page permanently?',
        answer:
          'Yes. The signature PNG buffer and optional timestamp verification line are embedded directly into the PDF page content stream via pdf-lib.',
      },
    ],
  },
  {
    id: 'protect-pdf',
    name: 'Protect, Watermark & Metadata-Lock PDF',
    shortName: 'Protect & Watermark PDF',
    category: 'pdf',
    categoryLabel: 'PDF Studio',
    tagline: 'Stamp diagonal CONFIDENTIAL watermarks, scrub author metadata, and embed ownership records.',
    description:
      'Harden any PDF before sharing externally: stamp customizable diagonal security watermarks ("CONFIDENTIAL", "DO NOT DISTRIBUTE", or your custom email/ID) across every page, scrub hidden creator metadata, and lock custom Document Title/Author headers.',
    seoTitle: 'Watermark & Protect PDF Online – Diagonal Security Stamp & Metadata Lock | Bhvsy Tools',
    seoDescription:
      'Add diagonal security watermarks, scrub hidden PDF metadata, and stamp ownership credentials across all PDF pages locally in your browser.',
    keywords: [
      'watermark pdf online',
      'protect pdf confidential stamp',
      'scrub pdf metadata',
      'add diagonal watermark to pdf',
    ],
    executionMode: '100% Client-Side PDF-Lib',
    avgRpmTag: '$18.70 Est. RPM',
    steps: [
      'Drop your PDF file into the security workspace (or load the sample document).',
      'Enter your diagonal watermark text (e.g., "CONFIDENTIAL // BHVSY OS"), opacity, color, and metadata scrubbing options.',
      'Click "Apply Security Stamp & Export PDF" to download the hardened PDF file.',
    ],
    faqs: [
      {
        question: 'Why is diagonal watermarking plus metadata scrubbing recommended for leaked-document prevention?',
        answer:
          'Stamping a vector/text watermark across the center of every page prevents clean cropping, while scrubbing producer/creator metadata hides internal computer usernames and software versions.',
      },
    ],
  },

  // ==========================================
  // 4. DOMAIN & NETWORK X-RAY TOOLS (4 TOOLS)
  // ==========================================
  {
    id: 'dns-checker',
    name: 'Live DNS Record & Propagation Checker',
    shortName: 'DNS Checker',
    category: 'domain',
    categoryLabel: 'Domain & Net X-Ray',
    tagline: 'Query live A, AAAA, CNAME, MX, TXT, NS, and SOA records with ultra-fast server & DoH fallback.',
    description:
      'Inspect real-time DNS records for any domain name. Queries IPv4 (A), IPv6 (AAAA), Mail Servers (MX with priority), SPF/DMARC/Verification (TXT), Nameservers (NS), and Start of Authority (SOA) with query latency in milliseconds.',
    seoTitle: 'Live DNS Record Lookup (A, AAAA, MX, TXT, CNAME, NS, SOA) | Bhvsy Tools',
    seoDescription:
      'Check live DNS records including A, AAAA, MX, TXT (SPF/DMARC), CNAME, NS, and SOA for any domain name with millisecond response telemetry.',
    keywords: ['dns checker online', 'mx record lookup', 'txt spf dmarc checker', 'dns propagation lookup'],
    executionMode: 'Live Node DNS + Cloudflare DoH',
    avgRpmTag: '$22.50 Est. RPM',
    popular: true,
    steps: [
      'Enter any domain name (e.g., bhvsy.github.io, google.com, cloudflare.com, or rojuka.com).',
      'Click "Run DNS Lookup" to query all 7 core record types simultaneously.',
      'Filter by record type (A, AAAA, MX, TXT, NS, CNAME, SOA) or copy the full JSON diagnostic payload.',
    ],
    faqs: [
      {
        question: 'Does this DNS Checker work even when hosted on static GitHub Pages?',
        answer:
          'Yes! When running with our Node server it uses native dns.promises; if deployed on static GitHub Pages (bhvsy.github.io), it automatically falls back to Cloudflare DNS-over-HTTPS (1.1.1.1 DoH) directly from the browser!',
      },
    ],
  },
  {
    id: 'tls-checker',
    name: 'SSL / TLS Certificate & Expiry Inspector',
    shortName: 'TLS / SSL Checker',
    category: 'domain',
    categoryLabel: 'Domain & Net X-Ray',
    tagline: 'Inspect live X.509 SSL certificates, expiry countdown, SAN list, issuer CA, and TLS cipher suite.',
    description:
      'Performs a real port 443 TLS handshake with any public host to inspect its X.509 certificate chain: Subject CN, Issuer Certificate Authority, Valid From/To timestamps, Days Remaining until expiry, Subject Alternative Names (SANs), SHA-256 fingerprint, and negotiated TLS protocol.',
    seoTitle: 'SSL / TLS Certificate Checker & Expiry Countdown Inspector | Bhvsy Tools',
    seoDescription:
      'Inspect live SSL/TLS certificates for any domain. Check expiration date, days remaining, issuer CA, SANs, SHA-256 fingerprint, and TLS version.',
    keywords: [
      'ssl certificate checker',
      'tls handshake inspector',
      'check ssl expiry days remaining',
      'x509 san certificate lookup',
    ],
    executionMode: 'Live TLS Socket Probe',
    avgRpmTag: '$24.10 Est. RPM',
    steps: [
      'Enter any HTTPS domain or subdomain (e.g., bhvsy.github.io, github.com, stripe.com).',
      'Click "Inspect TLS Certificate" to initiate a real port 443 TLS socket handshake.',
      'Review the certificate validity status, days remaining countdown, cipher suite, and covered SAN wildcards.',
    ],
    faqs: [
      {
        question: 'When should I renew an SSL/TLS certificate before expiry?',
        answer:
          'Automated ACME / Let’s Encrypt certificates typically renew 30 days before expiration. Any certificate with fewer than 14 days remaining is flagged in amber/crimson by our inspector.',
      },
    ],
  },
  {
    id: 'headers-checker',
    name: 'HTTP Security Headers & Grade Auditor',
    shortName: 'Headers Checker',
    category: 'domain',
    categoryLabel: 'Domain & Net X-Ray',
    tagline: 'Audit HSTS, CSP, X-Frame-Options, Referrer-Policy & get an instant A+ to F security grade.',
    description:
      'Fetches live HTTP response headers from any URL and grades the server security posture from A+ to F across 6 OWASP-recommended headers (HSTS, Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy), complete with copyable nginx/Cloudflare fix snippets.',
    seoTitle: 'HTTP Security Headers Checker & OWASP Grade Auditor | Bhvsy Tools',
    seoDescription:
      'Inspect live HTTP response headers and audit HSTS, CSP, X-Frame-Options, and Referrer-Policy with an A+ to F security scorecard.',
    keywords: [
      'http security headers checker',
      'check hsts and csp header',
      'website security header grade',
      'inspect http response headers online',
    ],
    executionMode: 'Live HTTP Header Probe',
    avgRpmTag: '$23.40 Est. RPM',
    steps: [
      'Enter any website URL or hostname and click "Audit HTTP Headers".',
      'Review your overall Security Grade (A+ to F) and the pass/fail breakdown for all 6 critical OWASP headers.',
      'Browse the complete raw HTTP response headers table or copy recommended fix headers.',
    ],
    faqs: [
      {
        question: 'Why do many websites score a B or C on HTTP Security Headers?',
        answer:
          'Many sites configure HSTS and X-Frame-Options but omit Content-Security-Policy (CSP) or Permissions-Policy. Adding those two headers elevates most sites to an A or A+.',
      },
    ],
  },
  {
    id: 'domain-xray',
    name: 'Domain X-Ray (All-in-One OSINT & Infra Recon)',
    shortName: 'Domain X-Ray',
    category: 'domain',
    categoryLabel: 'Domain & Net X-Ray',
    tagline: 'Single-click full-stack domain recon combining DNS records, SSL/TLS cert, and HTTP security posture.',
    description:
      'Our flagship infrastructure scanner. Enter any domain once and execute a parallel 3-layer reconnaissance scan: complete DNS topology (A/AAAA/MX/TXT/NS), Port 443 TLS certificate authority & expiry audit, and HTTP security header grading + server stack fingerprinting.',
    seoTitle: 'Domain X-Ray – Complete DNS, SSL/TLS & HTTP Security Recon | Bhvsy Tools',
    seoDescription:
      'Run a complete 360-degree Domain X-Ray in one click: live DNS records, SSL/TLS certificate chain, HTTP security grade, and edge stack detection.',
    keywords: [
      'domain xray tool',
      'all in one domain lookup',
      'website infrastructure recon',
      'dns ssl http header scanner',
    ],
    executionMode: 'Parallel Multi-Layer Recon',
    avgRpmTag: '$26.80 Est. RPM',
    popular: true,
    steps: [
      'Type any target domain (try bhvsy.github.io, rojuka.com, or github.com) into the Domain X-Ray console.',
      'Click "Launch Full X-Ray" to execute DNS, TLS, and HTTP probes concurrently.',
      'Inspect the unified executive dashboard or export the complete JSON reconnaissance report.',
    ],
    faqs: [
      {
        question: 'What makes Domain X-Ray faster than checking DNS, SSL, and Headers separately?',
        answer:
          'Domain X-Ray dispatches the DNS resolver, TLS 443 socket handshake, and HTTP header probe in parallel via Promise.all, completing a full 3-layer audit in ~400ms.',
      },
    ],
  },
];
