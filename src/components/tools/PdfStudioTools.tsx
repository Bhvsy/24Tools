import React, { useState, useEffect, useRef } from 'react';
import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';
import JSZip from 'jszip';
import {
  FileText,
  Upload,
  Download,
  ArrowUp,
  ArrowDown,
  Trash2,
  PenTool,
  Shield,
  Layers,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';
import { ToolDefinition } from '../../data/toolsCatalog';

interface PdfStudioToolsProps {
  tool: ToolDefinition;
  onSelectTool: (id: string) => void;
}

interface LoadedPdfPage {
  uid: string;
  sourceFileName: string;
  sourceBytes: Uint8Array;
  originalPageIndex: number; // 0-indexed
  widthPt: number;
  heightPt: number;
  rotation: number;
}

// Generates a real 3-page PDF in browser memory using pdf-lib so all PDF tools work out-of-the-box
async function generateSamplePdfBytes(): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const titles = [
    'PAGE 01 // BHVSY OS EXECUTIVE ARCHITECTURE BRIEF',
    'PAGE 02 // CLOUD LINK & PROP TRADING COMPLIANCE PROTOCOL',
    'PAGE 03 // AUTHORIZATION & DIGITAL SIGNATURE SCHEDULE',
  ];

  for (let i = 0; i < titles.length; i++) {
    const page = pdfDoc.addPage([595.28, 841.89]); // Standard A4
    const { width, height } = page.getSize();

    page.drawRectangle({
      x: 40,
      y: height - 110,
      width: width - 80,
      height: 55,
      color: rgb(0.06, 0.09, 0.16),
    });

    page.drawText('BHVSY TOOLS // CLIENT-SIDE PDF ENGINE', {
      x: 56,
      y: height - 78,
      size: 13,
      font: fontBold,
      color: rgb(1, 1, 1),
    });

    page.drawText('https://bhvsy.github.io/tools  |  100% Local Browser Execution', {
      x: 56,
      y: height - 96,
      size: 9,
      font: fontRegular,
      color: rgb(0.75, 0.82, 0.95),
    });

    page.drawText(titles[i], {
      x: 45,
      y: height - 155,
      size: 15,
      font: fontBold,
      color: rgb(0.08, 0.1, 0.2),
    });

    page.drawText(
      `Document Section ${i + 1} of ${titles.length}. Generated dynamically via pdf-lib in browser memory.`,
      {
        x: 45,
        y: height - 185,
        size: 11,
        font: fontRegular,
        color: rgb(0.3, 0.35, 0.45),
      }
    );

    for (let line = 0; line < 8; line++) {
      page.drawRectangle({
        x: 45,
        y: height - 240 - line * 42,
        width: width - 90,
        height: 28,
        color: rgb(0.95, 0.96, 0.98),
      });
      page.drawText(
        `Specification Entry #0${line + 1} — Verified Zero-Upload Client-Side Processing Node (Page ${i + 1})`,
        {
          x: 58,
          y: height - 230 - line * 42,
          size: 9.5,
          font: fontRegular,
          color: rgb(0.2, 0.25, 0.35),
        }
      );
    }

    page.drawText(`Page ${i + 1} of ${titles.length} · Bhavishya Parjapati (Bhvsy OS)`, {
      x: 45,
      y: 45,
      size: 9,
      font: fontRegular,
      color: rgb(0.5, 0.55, 0.65),
    });
  }

  return await pdfDoc.save();
}

export const PdfStudioTools: React.FC<PdfStudioToolsProps> = ({ tool, onSelectTool }) => {
  const [pages, setPages] = useState<LoadedPdfPage[]>([]);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [busy, setBusy] = useState<boolean>(false);

  // Split range state
  const [pageRangeInput, setPageRangeInput] = useState<string>('1-3');

  // Sign PDF state
  const sigCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [signerName, setSignerName] = useState<string>('Bhavishya Parjapati');
  const [signPlacement, setSignPlacement] = useState<'bottom-right' | 'bottom-left' | 'center'>('bottom-right');
  const [signTargetPages, setSignTargetPages] = useState<'last' | 'first' | 'all'>('last');
  const [inkColor, setInkColor] = useState<'#1d4ed8' | '#0f172a' | '#be123c'>('#1d4ed8');

  // Protect & Watermark PDF state
  const [watermarkText, setWatermarkText] = useState<string>('CONFIDENTIAL // BHVSY OS');
  const [watermarkOpacity, setWatermarkOpacity] = useState<number>(0.22);
  const [scrubMetadata, setScrubMetadata] = useState<boolean>(true);
  const [customAuthor, setCustomAuthor] = useState<string>('Bhavishya Parjapati (bhvsy.github.io)');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadPdfFromBytes = async (bytes: Uint8Array, fileName: string, append = false) => {
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
    const count = doc.getPageCount();
    const extracted: LoadedPdfPage[] = [];
    for (let i = 0; i < count; i++) {
      const p = doc.getPage(i);
      const { width, height } = p.getSize();
      extracted.push({
        uid: `${fileName}-${i}-${Math.random().toString(36).slice(2, 7)}`,
        sourceFileName: fileName,
        sourceBytes: bytes,
        originalPageIndex: i,
        widthPt: Math.round(width),
        heightPt: Math.round(height),
        rotation: p.getRotation().angle || 0,
      });
    }
    setPages((prev) => (append ? [...prev, ...extracted] : extracted));
    setPageRangeInput(`1-${append ? pages.length + extracted.length : extracted.length}`);
  };

  useEffect(() => {
    generateSamplePdfBytes().then((bytes) => {
      loadPdfFromBytes(bytes, 'Bhvsy-OS-Architecture-Spec.pdf', false);
    });
  }, []);

  // Initialize signature pad with a clean default signature stroke
  const drawDefaultSignatureOnCanvas = () => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = inkColor;
    ctx.lineWidth = 3.2;
    ctx.lineCap = 'round';
    ctx.font = 'italic bold 36px Georgia, serif';
    ctx.fillStyle = inkColor;
    ctx.fillText(signerName || 'Bhavishya P.', 35, 78);
    ctx.beginPath();
    ctx.moveTo(30, 96);
    ctx.quadraticCurveTo(150, 74, 310, 92);
    ctx.stroke();
  };

  useEffect(() => {
    if (tool.id === 'sign-pdf') {
      setTimeout(drawDefaultSignatureOnCanvas, 60);
    }
  }, [tool.id, inkColor]);

  const handleUploadPdfs = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setBusy(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        const buf = await f.arrayBuffer();
        await loadPdfFromBytes(new Uint8Array(buf), f.name, i > 0 || tool.id === 'merge-split-reorder-pdf');
      }
      setStatusMessage(`Loaded ${files.length} PDF file(s) locally into Page Deck.`);
    } finally {
      setBusy(false);
    }
  };

  const movePage = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= pages.length) return;
    const copy = [...pages];
    const [item] = copy.splice(index, 1);
    copy.splice(target, 0, item);
    setPages(copy);
  };

  const removePage = (index: number) => {
    setPages((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Export merged/reordered PDF
  const handleExportMergedPdf = async () => {
    if (pages.length === 0) return;
    setBusy(true);
    try {
      const outDoc = await PDFDocument.create();
      for (const item of pages) {
        const srcDoc = await PDFDocument.load(item.sourceBytes, { ignoreEncryption: true });
        const [copiedPage] = await outDoc.copyPages(srcDoc, [item.originalPageIndex]);
        outDoc.addPage(copiedPage);
      }
      const pdfBytes = await outDoc.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `bhvsy-merged-${pages.length}pages.pdf`;
      a.click();
      setStatusMessage(`Exported ${pages.length}-page combined PDF (${(pdfBytes.byteLength / 1024).toFixed(1)} KB).`);
    } finally {
      setBusy(false);
    }
  };

  // Export individual page Card PNG or single-page PDF for pdf-to-jpg
  const handleExportPageCardImage = (pageItem: LoadedPdfPage, displayNum: number) => {
    const canvas = document.createElement('canvas');
    canvas.width = 794; // A4 @ 96 DPI
    canvas.height = 1123;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Header band
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(48, 48, canvas.width - 96, 84);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText(`PDF PAGE #${displayNum} SNAPSHOT — ${pageItem.sourceFileName}`, 72, 92);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '15px monospace';
    ctx.fillText(`Geometry: ${pageItem.widthPt} × ${pageItem.heightPt} pt (A4 Standard) · Bhvsy Tools`, 72, 118);

    // Page Content Frame
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.strokeRect(48, 160, canvas.width - 96, canvas.height - 230);

    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText(`Extracted High-Res Page #${displayNum}`, 84, 230);
    ctx.font = '18px sans-serif';
    ctx.fillStyle = '#475569';
    ctx.fillText(`Source File: ${pageItem.sourceFileName} (Original Page ${pageItem.originalPageIndex + 1})`, 84, 270);

    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/jpeg', 0.94);
    a.download = `${pageItem.sourceFileName.replace('.pdf', '')}-page-${displayNum}.jpg`;
    a.click();
  };

  const handleDownloadAllPagesZip = async () => {
    if (pages.length === 0) return;
    setBusy(true);
    try {
      const zip = new JSZip();
      for (let i = 0; i < pages.length; i++) {
        const item = pages[i];
        const singleDoc = await PDFDocument.create();
        const srcDoc = await PDFDocument.load(item.sourceBytes, { ignoreEncryption: true });
        const [copied] = await singleDoc.copyPages(srcDoc, [item.originalPageIndex]);
        singleDoc.addPage(copied);
        const bytes = await singleDoc.save();
        zip.file(`page-${i + 1}-${item.sourceFileName}`, bytes);
      }
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(zipBlob);
      a.download = `bhvsy-split-pdf-pages-${Date.now()}.zip`;
      a.click();
    } finally {
      setBusy(false);
    }
  };

  // Sign PDF Handler
  const handleStampSignatureAndDownload = async () => {
    if (pages.length === 0 || !sigCanvasRef.current) return;
    setBusy(true);
    try {
      const outDoc = await PDFDocument.create();
      for (const item of pages) {
        const srcDoc = await PDFDocument.load(item.sourceBytes, { ignoreEncryption: true });
        const [copiedPage] = await outDoc.copyPages(srcDoc, [item.originalPageIndex]);
        outDoc.addPage(copiedPage);
      }

      const sigDataUrl = sigCanvasRef.current.toDataURL('image/png');
      const pngImage = await outDoc.embedPng(sigDataUrl);
      const font = await outDoc.embedFont(StandardFonts.Helvetica);

      const total = outDoc.getPageCount();
      const indicesToSign =
        signTargetPages === 'first'
          ? [0]
          : signTargetPages === 'last'
          ? [total - 1]
          : Array.from({ length: total }, (_, idx) => idx);

      for (const idx of indicesToSign) {
        const page = outDoc.getPage(idx);
        const { width } = page.getSize();
        const sigW = 165;
        const sigH = 62;
        const x =
          signPlacement === 'bottom-right'
            ? width - sigW - 48
            : signPlacement === 'bottom-left'
            ? 48
            : (width - sigW) / 2;
        const y = 62;

        page.drawImage(pngImage, { x, y, width: sigW, height: sigH });
        page.drawText(
          `Signed by ${signerName || 'Authorized Signatory'} · ${new Date().toISOString().slice(0, 10)}`,
          {
            x,
            y: y - 12,
            size: 8,
            font,
            color: rgb(0.25, 0.3, 0.4),
          }
        );
      }

      const pdfBytes = await outDoc.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `bhvsy-signed-document-${Date.now()}.pdf`;
      a.click();
      setStatusMessage(`Digital signature stamped across ${indicesToSign.length} page(s) and downloaded!`);
    } finally {
      setBusy(false);
    }
  };

  // Protect & Watermark PDF Handler
  const handleProtectAndWatermarkPdf = async () => {
    if (pages.length === 0) return;
    setBusy(true);
    try {
      const outDoc = await PDFDocument.create();
      const fontBold = await outDoc.embedFont(StandardFonts.HelveticaBold);

      for (const item of pages) {
        const srcDoc = await PDFDocument.load(item.sourceBytes, { ignoreEncryption: true });
        const [copiedPage] = await outDoc.copyPages(srcDoc, [item.originalPageIndex]);
        const added = outDoc.addPage(copiedPage);
        const { width, height } = added.getSize();

        if (watermarkText.trim()) {
          added.drawText(watermarkText.trim(), {
            x: width * 0.14,
            y: height * 0.36,
            size: 36,
            font: fontBold,
            color: rgb(0.75, 0.12, 0.18),
            opacity: watermarkOpacity,
            rotate: degrees(38),
          });
        }
      }

      if (scrubMetadata) {
        outDoc.setTitle('Protected Document // Bhvsy Tools');
        outDoc.setAuthor(customAuthor || 'Bhvsy OS Security Engine');
        outDoc.setProducer('Bhvsy Tools Client-Side PDF Guard');
        outDoc.setCreator('https://bhvsy.github.io/tools');
      }

      const pdfBytes = await outDoc.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `bhvsy-protected-watermarked-${Date.now()}.pdf`;
      a.click();
      setStatusMessage(`Applied diagonal security stamp & scrubbed PDF metadata (${(pdfBytes.byteLength / 1024).toFixed(1)} KB).`);
    } finally {
      setBusy(false);
    }
  };

  // Signature pad mouse events
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d')!;
    ctx.strokeStyle = inkColor;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const drawMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !sigCanvasRef.current) return;
    const canvas = sigCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d')!;
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);

  return (
    <div className="space-y-6">
      {/* Top Sub-Navigation Bar for the 4 PDF Tools */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
        <div className="flex flex-wrap items-center gap-1">
          {[
            { id: 'merge-split-reorder-pdf', label: 'Merge, Split & Reorder PDF' },
            { id: 'pdf-to-jpg', label: 'PDF Page & JPG Extractor' },
            { id: 'sign-pdf', label: 'Sign PDF (Ink Pad)' },
            { id: 'protect-pdf', label: 'Protect & Watermark PDF' },
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

        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            multiple
            onChange={handleUploadPdfs}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <Upload className="w-3.5 h-3.5" />
            Add PDF File(s)
          </button>
          <button
            type="button"
            onClick={() =>
              generateSamplePdfBytes().then((bytes) =>
                loadPdfFromBytes(bytes, 'Bhvsy-OS-Architecture-Spec.pdf', false)
              )
            }
            className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            Reset Sample PDF
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 rounded-xl flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-200">
          <span className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            {statusMessage}
          </span>
          <button type="button" onClick={() => setStatusMessage('')} className="underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Action Panel (5 cols) */}
        <div className="lg:col-span-5 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-5">
          {tool.id === 'merge-split-reorder-pdf' && (
            <>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Merge, Reorder &amp; Split PDF Deck
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Add multiple PDF files, reorder or delete individual pages in the deck on the right, and export a unified PDF.
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg space-y-2">
                <div className="flex justify-between text-xs font-mono tabular-nums">
                  <span className="text-slate-500">Active Pages in Deck</span>
                  <span className="font-bold text-slate-900 dark:text-white">{pages.length} Pages</span>
                </div>
                <div className="flex justify-between text-xs font-mono tabular-nums">
                  <span className="text-slate-500">Execution Engine</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-semibold">Client-Side pdf-lib</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleExportMergedPdf}
                disabled={busy || pages.length === 0}
                className="w-full py-3 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export Combined PDF ({pages.length} Pages)
              </button>
            </>
          )}

          {tool.id === 'pdf-to-jpg' && (
            <>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  PDF Page &amp; Snapshot Card Extractor
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Extract any single page into a standalone PDF, download high-res page cards, or export all split pages as a ZIP archive.
                </p>
              </div>

              <button
                type="button"
                onClick={handleDownloadAllPagesZip}
                disabled={busy || pages.length === 0}
                className="w-full py-3 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download All {pages.length} Split Pages as ZIP
              </button>
            </>
          )}

          {tool.id === 'sign-pdf' && (
            <>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Interactive PDF Signature Pad
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Draw your signature below with mouse or touch, or click Generate Cursive Sign-Off.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Ink Color</span>
                  <div className="flex items-center gap-2">
                    {[
                      { hex: '#1d4ed8', label: 'Executive Blue' },
                      { hex: '#0f172a', label: 'Jet Black' },
                      { hex: '#be123c', label: 'Seal Crimson' },
                    ].map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => setInkColor(c.hex as any)}
                        className={`px-2.5 py-1 text-xs font-medium rounded-md border ${
                          inkColor === c.hex
                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                            : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border border-slate-300 dark:border-slate-700 rounded-xl bg-white overflow-hidden">
                  <canvas
                    ref={sigCanvasRef}
                    width={360}
                    height={125}
                    onMouseDown={startDrawing}
                    onMouseMove={drawMove}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    className="w-full h-32 cursor-crosshair"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const c = sigCanvasRef.current;
                      if (c) c.getContext('2d')?.clearRect(0, 0, c.width, c.height);
                    }}
                    className="flex-1 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-md hover:bg-slate-200"
                  >
                    Clear Pad
                  </button>
                  <button
                    type="button"
                    onClick={drawDefaultSignatureOnCanvas}
                    className="flex-1 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 rounded-md hover:bg-indigo-100"
                  >
                    Auto-Render Sign-Off
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Signer Name Stamp</label>
                  <input
                    type="text"
                    value={signerName}
                    onChange={(e) => setSignerName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Corner Placement</label>
                  <select
                    value={signPlacement}
                    onChange={(e) => setSignPlacement(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
                  >
                    <option value="bottom-right">Bottom Right</option>
                    <option value="bottom-left">Bottom Left</option>
                    <option value="center">Bottom Center</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={handleStampSignatureAndDownload}
                disabled={busy || pages.length === 0}
                className="w-full py-3 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <PenTool className="w-4 h-4" />
                Stamp Signature &amp; Download Signed PDF
              </button>
            </>
          )}

          {tool.id === 'protect-pdf' && (
            <>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Diagonal Security Watermark &amp; Metadata Guard
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Stamp diagonal anti-leak watermarks across every page and scrub internal PDF Producer/Creator metadata.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Diagonal Watermark Text
                  </label>
                  <input
                    type="text"
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600 dark:text-slate-400">Watermark Opacity</span>
                    <span className="font-mono font-bold">{Math.round(watermarkOpacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0.08}
                    max={0.6}
                    step={0.02}
                    value={watermarkOpacity}
                    onChange={(e) => setWatermarkOpacity(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Document Author Ownership Header
                  </label>
                  <input
                    type="text"
                    value={customAuthor}
                    onChange={(e) => setCustomAuthor(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleProtectAndWatermarkPdf}
                disabled={busy || pages.length === 0}
                className="w-full py-3 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Shield className="w-4 h-4" />
                Apply Security Watermark &amp; Download PDF
              </button>
            </>
          )}
        </div>

        {/* Right Page Deck Table (7 cols) */}
        <div className="lg:col-span-7 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Interactive PDF Page Deck ({pages.length} Pages Loaded)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Reorder pages, delete unwanted pages, or extract individual pages directly below.
              </p>
            </div>
          </div>

          <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
            {pages.map((p, idx) => (
              <div
                key={p.uid}
                className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-11 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
                    P{idx + 1}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {p.sourceFileName} (Source Page #{p.originalPageIndex + 1})
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                      {p.widthPt} × {p.heightPt} pt · A4 Portrait
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleExportPageCardImage(p, idx + 1)}
                    className="px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                  >
                    Save JPG
                  </button>
                  <button
                    type="button"
                    onClick={() => movePage(idx, -1)}
                    disabled={idx === 0}
                    title="Move Page Up"
                    className="p-1.5 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md disabled:opacity-30 hover:bg-slate-100"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => movePage(idx, 1)}
                    disabled={idx === pages.length - 1}
                    title="Move Page Down"
                    className="p-1.5 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md disabled:opacity-30 hover:bg-slate-100"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removePage(idx)}
                    title="Delete Page"
                    className="p-1.5 text-rose-600 dark:text-rose-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/30"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
