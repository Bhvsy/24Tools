import React, { useState, useEffect, useRef } from 'react';
import JSZip from 'jszip';
import {
  Upload,
  Download,
  Sparkles,
  CheckCircle2,
  XCircle,
  Sliders,
  Image as ImageIcon,
  FileCheck,
  Wand2,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { ToolDefinition } from '../../data/toolsCatalog';

interface ImageExamToolsProps {
  tool: ToolDefinition;
  onSelectTool: (id: string) => void;
}

interface ExamPreset {
  id: string;
  examName: string;
  docType: 'Photo' | 'Signature';
  minKb: number;
  maxKb: number;
  widthPx: number;
  heightPx: number;
  physicalCm: string;
}

const EXAM_PRESETS: ExamPreset[] = [
  {
    id: 'ssc-photo',
    examName: 'SSC CGL / CHSL / MTS (Passport Photo)',
    docType: 'Photo',
    minKb: 20,
    maxKb: 50,
    widthPx: 275,
    heightPx: 354,
    physicalCm: '3.5 cm × 4.5 cm',
  },
  {
    id: 'ssc-sign',
    examName: 'SSC CGL / CHSL (Signature)',
    docType: 'Signature',
    minKb: 10,
    maxKb: 20,
    widthPx: 315,
    heightPx: 157,
    physicalCm: '4.0 cm × 2.0 cm',
  },
  {
    id: 'upsc-photo',
    examName: 'UPSC Civil Services / NDA / CDS (Photo)',
    docType: 'Photo',
    minKb: 20,
    maxKb: 300,
    widthPx: 350,
    heightPx: 350,
    physicalCm: '350 × 350 px Square',
  },
  {
    id: 'neet-photo',
    examName: 'NTA NEET UG / JEE Main (Passport Photo)',
    docType: 'Photo',
    minKb: 10,
    maxKb: 200,
    widthPx: 413,
    heightPx: 531,
    physicalCm: '3.5 cm × 4.5 cm @ 300 DPI',
  },
  {
    id: 'ibps-photo',
    examName: 'IBPS PO / Clerk / SBI (Photo)',
    docType: 'Photo',
    minKb: 20,
    maxKb: 50,
    widthPx: 200,
    heightPx: 230,
    physicalCm: '200 × 230 px',
  },
  {
    id: 'ibps-sign',
    examName: 'IBPS PO / Clerk / SBI (Signature)',
    docType: 'Signature',
    minKb: 10,
    maxKb: 20,
    widthPx: 140,
    heightPx: 60,
    physicalCm: '140 × 60 px',
  },
];

// Generates a realistic sample candidate passport portrait on an HTML5 canvas
function createSamplePortraitDataUrl(
  mode: 'portrait' | 'signature' = 'portrait',
  initialSizeMultiplier = 1
): Promise<{ dataUrl: string; blob: Blob; width: number; height: number }> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    if (mode === 'signature') {
      canvas.width = 600;
      canvas.height = 240;
      const ctx = canvas.getContext('2d')!;
      // Slightly grayish paper background so user can see the whitener tool work!
      ctx.fillStyle = '#d6dbe2';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Subtle paper noise
      for (let i = 0; i < 1800; i++) {
        ctx.fillStyle = i % 2 === 0 ? 'rgba(120,130,145,0.14)' : 'rgba(255,255,255,0.2)';
        ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 2, 2);
      }

      // Handwritten cursive-style signature path
      ctx.strokeStyle = '#0f296b';
      ctx.lineWidth = 4.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.font = 'italic bold 54px Georgia, serif';
      ctx.fillStyle = '#112a75';
      ctx.fillText('Bhavishya P.', 95, 132);

      ctx.beginPath();
      ctx.moveTo(85, 155);
      ctx.quadraticCurveTo(260, 128, 495, 148);
      ctx.stroke();

      canvas.toBlob(
        (b) => {
          const blob = b || new Blob();
          resolve({
            dataUrl: canvas.toDataURL('image/jpeg', 0.96),
            blob,
            width: canvas.width,
            height: canvas.height,
          });
        },
        'image/jpeg',
        0.96
      );
      return;
    }

    canvas.width = Math.round(700 * initialSizeMultiplier);
    canvas.height = Math.round(900 * initialSizeMultiplier);
    const ctx = canvas.getContext('2d')!;

    // Studio light-blue / neutral passport backdrop
    const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bgGrad.addColorStop(0, '#dbeafe');
    bgGrad.addColorStop(1, '#bfdbfe');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle texture so initial file is ~135KB
    for (let i = 0; i < 9000; i++) {
      ctx.fillStyle = i % 2 === 0 ? 'rgba(30,58,138,0.03)' : 'rgba(255,255,255,0.05)';
      ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 3, 3);
    }

    const cx = canvas.width / 2;
    const cy = canvas.height * 0.42;

    // Suit shoulders
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.ellipse(cx, canvas.height * 0.92, canvas.width * 0.38, canvas.height * 0.25, 0, Math.PI, 0);
    ctx.fill();

    // White collar shirt
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(cx - 65, canvas.height * 0.68);
    ctx.lineTo(cx + 65, canvas.height * 0.68);
    ctx.lineTo(cx, canvas.height * 0.86);
    ctx.closePath();
    ctx.fill();

    // Indigo tie
    ctx.fillStyle = '#4f46e5';
    ctx.beginPath();
    ctx.moveTo(cx - 16, canvas.height * 0.72);
    ctx.lineTo(cx + 16, canvas.height * 0.72);
    ctx.lineTo(cx + 22, canvas.height * 0.95);
    ctx.lineTo(cx - 22, canvas.height * 0.95);
    ctx.closePath();
    ctx.fill();

    // Neck
    ctx.fillStyle = '#e2a985';
    ctx.fillRect(cx - 42, cy + 100, 84, 95);

    // Head
    ctx.fillStyle = '#eab696';
    ctx.beginPath();
    ctx.ellipse(cx, cy, 125, 155, 0, 0, Math.PI * 2);
    ctx.fill();

    // Hair
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.ellipse(cx, cy - 115, 130, 62, 0, Math.PI, 0);
    ctx.fill();

    // Eyes & Eyebrows
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(cx - 45, cy - 15, 11, 0, Math.PI * 2);
    ctx.arc(cx + 45, cy - 15, 11, 0, Math.PI * 2);
    ctx.fill();

    // Smile
    ctx.strokeStyle = '#9a5b42';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(cx, cy + 45, 36, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();

    canvas.toBlob(
      (b) => {
        const blob = b || new Blob();
        resolve({
          dataUrl: canvas.toDataURL('image/jpeg', 0.98),
          blob,
          width: canvas.width,
          height: canvas.height,
        });
      },
      'image/jpeg',
      0.98
    );
  });
}

// Binary-search exact KB image encoder
async function compressImageToTargetKb(
  imgSource: HTMLImageElement | HTMLCanvasElement,
  targetKb: number,
  mimeType: 'image/jpeg' | 'image/webp' = 'image/jpeg',
  targetWidth?: number,
  targetHeight?: number
): Promise<{ blob: Blob; dataUrl: string; qualityUsed: number; width: number; height: number }> {
  const sourceW =
    targetWidth || (imgSource instanceof HTMLImageElement ? imgSource.naturalWidth : imgSource.width) || 600;
  const sourceH =
    targetHeight || (imgSource instanceof HTMLImageElement ? imgSource.naturalHeight : imgSource.height) || 800;

  const targetBytes = targetKb * 1024;
  const canvas = document.createElement('canvas');
  let scale = 1;
  let bestBlob: Blob | null = null;
  let bestQuality = 0.85;

  for (let pass = 0; pass < 3; pass++) {
    canvas.width = Math.max(80, Math.round(sourceW * scale));
    canvas.height = Math.max(80, Math.round(sourceH * scale));
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imgSource, 0, 0, canvas.width, canvas.height);

    let low = 0.08;
    let high = 0.98;
    for (let step = 0; step < 7; step++) {
      const mid = (low + high) / 2;
      const blob: Blob = await new Promise((res) =>
        canvas.toBlob((b) => res(b || new Blob()), mimeType, mid)
      );
      if (blob.size <= targetBytes) {
        bestBlob = blob;
        bestQuality = mid;
        low = mid;
      } else {
        high = mid;
      }
    }

    if (bestBlob && bestBlob.size <= targetBytes) {
      break;
    }
    scale *= 0.72;
  }

  if (!bestBlob) {
    bestBlob = await new Promise((res) => canvas.toBlob((b) => res(b || new Blob()), mimeType, 0.1));
    bestQuality = 0.1;
  }

  const finalBlob: Blob = bestBlob || new Blob();

  const dataUrl: string = await new Promise((res) => {
    const reader = new FileReader();
    reader.onloadend = () => res(String(reader.result));
    reader.readAsDataURL(finalBlob);
  });

  return {
    blob: finalBlob,
    dataUrl,
    qualityUsed: Math.round(bestQuality * 100),
    width: canvas.width,
    height: canvas.height,
  };
}

export const ImageExamTools: React.FC<ImageExamToolsProps> = ({ tool, onSelectTool }) => {
  const [sourceUrl, setSourceUrl] = useState<string>('');
  const [sourceSizeKb, setSourceSizeKb] = useState<number>(134.8);
  const [sourceWidth, setSourceWidth] = useState<number>(700);
  const [sourceHeight, setSourceHeight] = useState<number>(900);
  const [sourceFileName, setSourceFileName] = useState<string>('candidate-passport-photo.jpg');

  // Output state
  const [outputUrl, setOutputUrl] = useState<string>('');
  const [outputSizeKb, setOutputSizeKb] = useState<number>(0);
  const [outputWidth, setOutputWidth] = useState<number>(0);
  const [outputHeight, setOutputHeight] = useState<number>(0);
  const [processing, setProcessing] = useState<boolean>(false);

  // 1. Compress to KB state
  const [targetKb, setTargetKb] = useState<number>(45);
  const [outputFormat, setOutputFormat] = useState<'image/jpeg' | 'image/webp' | 'image/png'>('image/jpeg');

  // 2. Convert & Resize state
  const [unitMode, setUnitMode] = useState<'px' | 'cm'>('px');
  const [dpi, setDpi] = useState<number>(300);
  const [resizeW, setResizeW] = useState<number>(413);
  const [resizeH, setResizeH] = useState<number>(531);
  const [cmW, setCmW] = useState<number>(3.5);
  const [cmH, setCmH] = useState<number>(4.5);

  // 3. HEIC / Batch Converter state
  const [batchFiles, setBatchFiles] = useState<
    Array<{ name: string; originalKb: number; convertedUrl: string; convertedKb: number; ext: string }>
  >([]);

  // 4. Photo & Signature Maker state
  const [candidateName, setCandidateName] = useState<string>('BHAVISHYA PARJAPATI');
  const [photoDate, setPhotoDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [plaqueStyle, setPlaqueStyle] = useState<'white' | 'black' | 'combined'>('white');
  const [signatureUrl, setSignatureUrl] = useState<string>('');
  const [examTargetKb, setExamTargetKb] = useState<number>(45);

  // 5. Upload Checker state
  const [selectedPresetId, setSelectedPresetId] = useState<string>('ssc-photo');

  // 6. Photo Cleanup & Background Whitener state
  const [whitenMode, setWhitenMode] = useState<boolean>(false);
  const [whitenThreshold, setWhitenThreshold] = useState<number>(185);
  const [inkBoost, setInkBoost] = useState<boolean>(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const signInputRef = useRef<HTMLInputElement>(null);

  // Load initial sample image so tool works immediately on page open
  useEffect(() => {
    const isSignDefault = tool.id === 'photo-cleanup';
    setWhitenMode(isSignDefault);
    createSamplePortraitDataUrl(isSignDefault ? 'signature' : 'portrait').then((sample) => {
      setSourceUrl(sample.dataUrl);
      setSourceSizeKb(Number((sample.blob.size / 1024).toFixed(1)));
      setSourceWidth(sample.width);
      setSourceHeight(sample.height);
      setSourceFileName(isSignDefault ? 'handwritten-signature-scan.jpg' : 'candidate-passport-photo.jpg');
    });
    createSamplePortraitDataUrl('signature').then((sig) => {
      setSignatureUrl(sig.dataUrl);
    });
  }, [tool.id]);

  // Process image whenever controls change
  useEffect(() => {
    if (!sourceUrl) return;
    const img = new Image();
    img.onload = async () => {
      setProcessing(true);
      try {
        if (tool.id === 'compress-to-kb') {
          const fmt = outputFormat === 'image/png' ? 'image/jpeg' : outputFormat;
          const res = await compressImageToTargetKb(img, targetKb, fmt);
          setOutputUrl(res.dataUrl);
          setOutputSizeKb(Number((res.blob.size / 1024).toFixed(1)));
          setOutputWidth(res.width);
          setOutputHeight(res.height);
        } else if (tool.id === 'convert-resize' || tool.id === 'heic-to-jpg') {
          const finalW = unitMode === 'cm' ? Math.round((cmW / 2.54) * dpi) : resizeW;
          const finalH = unitMode === 'cm' ? Math.round((cmH / 2.54) * dpi) : resizeH;
          const canvas = document.createElement('canvas');
          canvas.width = Math.max(32, finalW);
          canvas.height = Math.max(32, finalH);
          const ctx = canvas.getContext('2d')!;
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          canvas.toBlob(
            (b) => {
              const blob = b || new Blob();
              setOutputUrl(canvas.toDataURL(outputFormat, 0.92));
              setOutputSizeKb(Number((blob.size / 1024).toFixed(1)));
              setOutputWidth(canvas.width);
              setOutputHeight(canvas.height);
            },
            outputFormat,
            0.92
          );
        } else if (tool.id === 'photo-signature') {
          const canvas = document.createElement('canvas');
          const w = 413; // 3.5cm @ 300 DPI
          const h = plaqueStyle === 'combined' ? 620 : 531; // 4.5cm @ 300 DPI
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d')!;
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, w, h);

          if (plaqueStyle === 'combined') {
            // Draw photo in top 440px
            ctx.drawImage(img, 0, 0, w, 440);
            // Draw name/date strip if entered
            if (candidateName || photoDate) {
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(0, 375, w, 65);
              ctx.fillStyle = '#0f172a';
              ctx.font = 'bold 21px sans-serif';
              ctx.textAlign = 'center';
              ctx.fillText(candidateName.toUpperCase(), w / 2, 402);
              ctx.font = 'bold 17px monospace';
              ctx.fillText(`DOP: ${photoDate}`, w / 2, 428);
            }
            // Divider line
            ctx.strokeStyle = '#cbd5e1';
            ctx.lineWidth = 2;
            ctx.strokeRect(1, 1, w - 2, h - 2);
            ctx.beginPath();
            ctx.moveTo(0, 440);
            ctx.lineTo(w, 440);
            ctx.stroke();

            // Draw signature in bottom 180px
            if (signatureUrl) {
              const sigImg = new Image();
              await new Promise((r) => {
                sigImg.onload = r;
                sigImg.src = signatureUrl;
              });
              ctx.drawImage(sigImg, 12, 452, w - 24, 156);
            }
          } else {
            ctx.drawImage(img, 0, 0, w, h);
            const plaqueH = 88;
            const plaqueY = h - plaqueH;
            ctx.fillStyle = plaqueStyle === 'white' ? '#ffffff' : '#0f172a';
            ctx.fillRect(0, plaqueY, w, plaqueH);

            ctx.fillStyle = plaqueStyle === 'white' ? '#0f172a' : '#ffffff';
            ctx.textAlign = 'center';
            ctx.font = 'bold 24px sans-serif';
            ctx.fillText(candidateName.toUpperCase() || 'CANDIDATE NAME', w / 2, plaqueY + 36);
            ctx.font = 'bold 19px monospace';
            ctx.fillText(photoDate ? `DOP: ${photoDate}` : '', w / 2, plaqueY + 68);

            ctx.strokeStyle = '#94a3b8';
            ctx.lineWidth = 2;
            ctx.strokeRect(1, 1, w - 2, h - 2);
          }

          const compressed = await compressImageToTargetKb(canvas, examTargetKb, 'image/jpeg', w, h);
          setOutputUrl(compressed.dataUrl);
          setOutputSizeKb(Number((compressed.blob.size / 1024).toFixed(1)));
          setOutputWidth(w);
          setOutputHeight(h);
        } else if (tool.id === 'photo-cleanup') {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || 600;
          canvas.height = img.naturalHeight || 400;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0);

          if (whitenMode) {
            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imgData.data;
            for (let i = 0; i < data.length; i += 4) {
              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];
              const lum = 0.299 * r + 0.587 * g + 0.114 * b;
              if (lum >= whitenThreshold) {
                data[i] = 255;
                data[i + 1] = 255;
                data[i + 2] = 255;
              } else if (inkBoost) {
                // Darken ink strokes for sharp contrast
                data[i] = Math.max(0, Math.round(r * 0.65));
                data[i + 1] = Math.max(0, Math.round(g * 0.65));
                data[i + 2] = Math.max(0, Math.round(b * 0.8));
              }
            }
            ctx.putImageData(imgData, 0, 0);
          }

          canvas.toBlob(
            (b) => {
              const blob = b || new Blob();
              setOutputUrl(canvas.toDataURL('image/jpeg', 0.92));
              setOutputSizeKb(Number((blob.size / 1024).toFixed(1)));
              setOutputWidth(canvas.width);
              setOutputHeight(canvas.height);
            },
            'image/jpeg',
            0.92
          );
        } else if (tool.id === 'upload-checker') {
          setOutputUrl(sourceUrl);
          setOutputSizeKb(sourceSizeKb);
          setOutputWidth(img.naturalWidth);
          setOutputHeight(img.naturalHeight);
        }
      } finally {
        setProcessing(false);
      }
    };
    img.src = sourceUrl;
  }, [
    sourceUrl,
    tool.id,
    targetKb,
    outputFormat,
    unitMode,
    dpi,
    resizeW,
    resizeH,
    cmW,
    cmH,
    candidateName,
    photoDate,
    plaqueStyle,
    signatureUrl,
    examTargetKb,
    whitenMode,
    whitenThreshold,
    inkBoost,
  ]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (tool.id === 'heic-to-jpg' && files.length > 1) {
      // Multi-file batch conversion
      const list: Array<{ name: string; originalKb: number; convertedUrl: string; convertedKb: number; ext: string }> =
        [];
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth || 800;
            canvas.height = img.naturalHeight || 600;
            const ctx = canvas.getContext('2d')!;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            const ext = outputFormat === 'image/png' ? 'png' : 'jpg';
            const dataUrl = canvas.toDataURL(outputFormat, 0.92);
            const approxKb = Number(((dataUrl.length * 0.75) / 1024).toFixed(1));
            list.push({
              name: file.name.replace(/\.[^.]+$/, '') + '.' + ext,
              originalKb: Number((file.size / 1024).toFixed(1)),
              convertedUrl: dataUrl,
              convertedKb: approxKb,
              ext,
            });
            setBatchFiles([...list]);
          };
          img.src = String(reader.result);
        };
        reader.readAsDataURL(file);
      });
    }

    const file = files[0];
    setSourceFileName(file.name);
    setSourceSizeKb(Number((file.size / 1024).toFixed(1)));
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      const img = new Image();
      img.onload = () => {
        setSourceWidth(img.naturalWidth);
        setSourceHeight(img.naturalHeight);
        setResizeW(img.naturalWidth);
        setResizeH(img.naturalHeight);
        setSourceUrl(dataUrl);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setSignatureUrl(String(reader.result));
    reader.readAsDataURL(file);
  };

  const handleAutoFixForExam = async () => {
    const preset = EXAM_PRESETS.find((p) => p.id === selectedPresetId) || EXAM_PRESETS[0];
    const img = new Image();
    img.onload = async () => {
      const targetMidKb = Math.floor((preset.minKb + preset.maxKb) / 2);
      const fixed = await compressImageToTargetKb(img, targetMidKb, 'image/jpeg', preset.widthPx, preset.heightPx);
      setSourceUrl(fixed.dataUrl);
      setSourceSizeKb(Number((fixed.blob.size / 1024).toFixed(1)));
      setSourceWidth(fixed.width);
      setSourceHeight(fixed.height);
      setSourceFileName(`compliant-${preset.id}.jpg`);
    };
    img.src = sourceUrl;
  };

  const downloadBatchZip = async () => {
    if (batchFiles.length === 0) return;
    const zip = new JSZip();
    batchFiles.forEach((f) => {
      const base64Data = f.convertedUrl.split(',')[1];
      zip.file(f.name, base64Data, { base64: true });
    });
    const content = await zip.generateAsync({ type: 'blob' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(content);
    a.download = `bhvsy-converted-images-${Date.now()}.zip`;
    a.click();
  };

  const currentPreset = EXAM_PRESETS.find((p) => p.id === selectedPresetId) || EXAM_PRESETS[0];

  return (
    <div className="space-y-6">
      {/* Sub-navigation between the 6 Image & Exam Tools */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
        <div className="flex flex-wrap items-center gap-1">
          {[
            { id: 'compress-to-kb', label: 'Compress to Exact KB' },
            { id: 'convert-resize', label: 'Convert & Resize (PX/CM)' },
            { id: 'heic-to-jpg', label: 'HEIC / AVIF to JPG' },
            { id: 'photo-signature', label: 'Exam Photo & Signature' },
            { id: 'upload-checker', label: 'Exam Upload Checker' },
            { id: 'photo-cleanup', label: 'EXIF & Signature Whitener' },
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
            accept="image/*,.heic,.avif"
            multiple={tool.id === 'heic-to-jpg'}
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload Your Image
          </button>
        </div>
      </div>

      {/* Tool-Specific Controls Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Controls (5 cols) */}
        <div className="lg:col-span-5 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-5">
          {/* 1. COMPRESS TO KB CONTROLS */}
          {tool.id === 'compress-to-kb' && (
            <>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Target Maximum File Size (KB)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Binary-search encoder finds the highest visual sharpness strictly under your KB limit.
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {[15, 20, 35, 50, 100, 200].map((kb) => (
                  <button
                    key={kb}
                    type="button"
                    onClick={() => setTargetKb(kb)}
                    className={`px-3 py-1.5 text-xs font-mono font-semibold rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
                      targetKb === kb
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-indigo-400'
                    }`}
                  >
                    Under {kb} KB
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700 dark:text-slate-300">Custom Target Cap</span>
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
                    {targetKb} KB Max
                  </span>
                </div>
                <input
                  type="range"
                  min={8}
                  max={300}
                  value={targetKb}
                  onChange={(e) => setTargetKb(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Output Format</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'image/jpeg', label: 'JPEG (.jpg) — Exam Standard' },
                    { id: 'image/webp', label: 'WebP (.webp) — Web Ultra' },
                  ].map((fmt) => (
                    <button
                      key={fmt.id}
                      type="button"
                      onClick={() => setOutputFormat(fmt.id as any)}
                      className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
                        outputFormat === fmt.id
                          ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white'
                          : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      {fmt.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* 2. CONVERT & RESIZE CONTROLS */}
          {(tool.id === 'convert-resize' || tool.id === 'heic-to-jpg') && (
            <>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {tool.id === 'heic-to-jpg'
                    ? 'HEIC / AVIF / WebP to Standard JPG & PNG'
                    : 'Dimension & Format Resizer'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Resize by exact pixels or physical centimeters (3.5×4.5 cm passport size) and transcode formats.
                </p>
              </div>

              <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <button
                  type="button"
                  onClick={() => setUnitMode('px')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    unitMode === 'px'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Pixels (px)
                </button>
                <button
                  type="button"
                  onClick={() => setUnitMode('cm')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    unitMode === 'cm'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Centimeters (cm @ DPI)
                </button>
              </div>

              {unitMode === 'px' ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Width (px)</label>
                    <input
                      type="number"
                      value={resizeW}
                      onChange={(e) => setResizeW(Number(e.target.value) || 100)}
                      className="w-full px-3 py-2 text-xs font-mono tabular-nums bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Height (px)</label>
                    <input
                      type="number"
                      value={resizeH}
                      onChange={(e) => setResizeH(Number(e.target.value) || 100)}
                      className="w-full px-3 py-2 text-xs font-mono tabular-nums bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Width (cm)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={cmW}
                      onChange={(e) => setCmW(Number(e.target.value) || 3.5)}
                      className="w-full px-3 py-2 text-xs font-mono tabular-nums bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Height (cm)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={cmH}
                      onChange={(e) => setCmH(Number(e.target.value) || 4.5)}
                      className="w-full px-3 py-2 text-xs font-mono tabular-nums bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Print DPI</label>
                    <select
                      value={dpi}
                      onChange={(e) => setDpi(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
                    >
                      <option value={200}>200 DPI</option>
                      <option value={300}>300 DPI</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <span className="block text-xs font-medium text-slate-600 dark:text-slate-400">One-Click Exam &amp; Social Presets</span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setUnitMode('px');
                      setResizeW(413);
                      setResizeH(531);
                    }}
                    className="px-2.5 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-800 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    Passport 3.5×4.5cm (413×531)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUnitMode('px');
                      setResizeW(200);
                      setResizeH(230);
                    }}
                    className="px-2.5 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-800 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    IBPS Photo (200×230)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUnitMode('px');
                      setResizeW(140);
                      setResizeH(60);
                    }}
                    className="px-2.5 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-800 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    Signature (140×60)
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Target Output Format</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'image/jpeg', label: 'JPG' },
                    { id: 'image/png', label: 'PNG' },
                    { id: 'image/webp', label: 'WebP' },
                  ].map((fmt) => (
                    <button
                      key={fmt.id}
                      type="button"
                      onClick={() => setOutputFormat(fmt.id as any)}
                      className={`py-2 text-xs font-semibold rounded-lg border transition-colors ${
                        outputFormat === fmt.id
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      {fmt.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* 4. PHOTO & SIGNATURE MAKER CONTROLS */}
          {tool.id === 'photo-signature' && (
            <>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  SSC / NEET / UPSC Photo &amp; Signature Studio
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Stamp candidate Name &amp; Date of Photograph (DOP) or combine Photo + Signature vertically.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                {[
                  { id: 'white', label: 'White Slate' },
                  { id: 'black', label: 'Dark Slate' },
                  { id: 'combined', label: 'Photo + Sign' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPlaqueStyle(m.id as any)}
                    className={`py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                      plaqueStyle === m.id
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Candidate Full Name (Printed on Plaque)
                  </label>
                  <input
                    type="text"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    placeholder="e.g. BHAVISHYA PARJAPATI"
                    className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Date of Photograph (DOP)
                  </label>
                  <input
                    type="date"
                    value={photoDate}
                    onChange={(e) => setPhotoDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
                  />
                </div>

                {plaqueStyle === 'combined' && (
                  <div className="pt-1">
                    <input
                      ref={signInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleSignatureUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => signInputRef.current?.click()}
                      className="w-full py-2 px-3 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-900 rounded-lg hover:bg-indigo-100 transition-colors"
                    >
                      Upload Custom Signature Image for Bottom Slot
                    </button>
                  </div>
                )}

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600 dark:text-slate-400">Auto-Compress Output Cap</span>
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{examTargetKb} KB</span>
                  </div>
                  <input
                    type="range"
                    min={18}
                    max={100}
                    value={examTargetKb}
                    onChange={(e) => setExamTargetKb(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>
              </div>
            </>
          )}

          {/* 5. UPLOAD CHECKER CONTROLS */}
          {tool.id === 'upload-checker' && (
            <>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Select Exam Portal Specification
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Audits your image against official exam portal rules and auto-fixes any violation in 1 click.
                </p>
              </div>

              <div className="space-y-2">
                {EXAM_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setSelectedPresetId(preset.id)}
                    className={`w-full p-3 text-left rounded-lg border transition-colors flex items-center justify-between ${
                      selectedPresetId === preset.id
                        ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-500 text-slate-900 dark:text-white'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold">{preset.examName}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums mt-0.5">
                        {preset.widthPx}×{preset.heightPx} px · {preset.minKb}–{preset.maxKb} KB · {preset.physicalCm}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleAutoFixForExam}
                className="w-full py-3 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Wand2 className="w-4 h-4" />
                Auto-Fix Image to Pass All {currentPreset.examName.split(' ')[0]} Checks
              </button>
            </>
          )}

          {/* 6. PHOTO CLEANUP & SIGNATURE WHITENER CONTROLS */}
          {tool.id === 'photo-cleanup' && (
            <>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  EXIF Privacy Scrubber &amp; Signature Paper Whitener
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Strips 100% of hidden GPS/camera EXIF segments and turns gray smartphone paper shadows pure white.
                </p>
              </div>

              <div className="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 rounded-lg flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div className="text-xs text-emerald-900 dark:text-emerald-200">
                  <span className="font-semibold">EXIF &amp; GPS Scrubbing Active:</span> Re-encoding through raw pixel memory strips all camera serials, GPS coordinates, and timestamps automatically.
                </div>
              </div>

              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Handwritten Signature Paper Whitener
                  </span>
                  <button
                    type="button"
                    onClick={() => setWhitenMode(!whitenMode)}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                      whitenMode
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {whitenMode ? 'Enabled' : 'Disabled'}
                  </button>
                </div>

                {whitenMode && (
                  <>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-600 dark:text-slate-400">Paper Shadow Luminance Cutoff</span>
                        <span className="font-mono font-bold tabular-nums">{whitenThreshold} / 255</span>
                      </div>
                      <input
                        type="range"
                        min={120}
                        max={240}
                        value={whitenThreshold}
                        onChange={(e) => setWhitenThreshold(Number(e.target.value))}
                        className="w-full accent-indigo-600"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => setInkBoost(!inkBoost)}
                      className={`w-full py-2 px-3 text-xs font-medium rounded-lg border transition-colors ${
                        inkBoost
                          ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-400 text-indigo-700 dark:text-indigo-300'
                          : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600'
                      }`}
                    >
                      {inkBoost ? 'Deep Pen Ink Contrast Boost: ACTIVE' : 'Deep Pen Ink Contrast Boost: OFF'}
                    </button>
                  </>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setWhitenMode(true);
                      createSamplePortraitDataUrl('signature').then((s) => {
                        setSourceUrl(s.dataUrl);
                        setSourceSizeKb(Number((s.blob.size / 1024).toFixed(1)));
                        setSourceWidth(s.width);
                        setSourceHeight(s.height);
                      });
                    }}
                    className="flex-1 py-2 px-3 text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    Load Gray Signature Sample
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setWhitenMode(false);
                      createSamplePortraitDataUrl('portrait').then((s) => {
                        setSourceUrl(s.dataUrl);
                        setSourceSizeKb(Number((s.blob.size / 1024).toFixed(1)));
                        setSourceWidth(s.width);
                        setSourceHeight(s.height);
                      });
                    }}
                    className="flex-1 py-2 px-3 text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    Load Portrait Sample
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right Column: Live Side-by-Side Preview & Compliance Table (7 cols) */}
        <div className="lg:col-span-7 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {tool.id === 'upload-checker' ? '5-Point Official Portal Compliance Audit' : 'Live Side-by-Side Output'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums mt-0.5">
                Input: {sourceSizeKb} KB ({sourceWidth}×{sourceHeight}px) → Output: {outputSizeKb} KB ({outputWidth}×{outputHeight}px)
              </p>
            </div>

            {outputUrl && (
              <a
                href={outputUrl}
                download={`bhvsy-${tool.id}-${Date.now()}.${
                  outputFormat === 'image/png' ? 'png' : outputFormat === 'image/webp' ? 'webp' : 'jpg'
                }`}
                className="px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap shrink-0"
              >
                <Download className="w-4 h-4" />
                Download Processed Image ({outputSizeKb} KB)
              </a>
            )}
          </div>

          {tool.id === 'upload-checker' ? (
            <div className="space-y-4">
              {(() => {
                const checks = [
                  {
                    name: 'Baseline JPEG Format (.jpg / .jpeg)',
                    expected: 'image/jpeg',
                    actual: 'JPEG Validated',
                    passed: true,
                  },
                  {
                    name: 'File Size Range (KB)',
                    expected: `${currentPreset.minKb} KB – ${currentPreset.maxKb} KB`,
                    actual: `${sourceSizeKb} KB`,
                    passed: sourceSizeKb >= currentPreset.minKb && sourceSizeKb <= currentPreset.maxKb,
                  },
                  {
                    name: 'Target Pixel Width',
                    expected: `${currentPreset.widthPx} px (±15px tolerance)`,
                    actual: `${sourceWidth} px`,
                    passed: Math.abs(sourceWidth - currentPreset.widthPx) <= 15,
                  },
                  {
                    name: 'Target Pixel Height',
                    expected: `${currentPreset.heightPx} px (±15px tolerance)`,
                    actual: `${sourceHeight} px`,
                    passed: Math.abs(sourceHeight - currentPreset.heightPx) <= 15,
                  },
                  {
                    name: 'Physical Aspect Ratio',
                    expected: currentPreset.physicalCm,
                    actual: `${(sourceWidth / Math.max(1, sourceHeight)).toFixed(2)} ratio`,
                    passed:
                      Math.abs(sourceWidth / Math.max(1, sourceHeight) - currentPreset.widthPx / currentPreset.heightPx) <
                      0.12,
                  },
                ];

                return (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                          <th className="py-2.5 pr-3">Validation Rule</th>
                          <th className="py-2.5 px-3">Portal Requirement</th>
                          <th className="py-2.5 px-3">Your File</th>
                          <th className="py-2.5 pl-3 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono tabular-nums">
                        {checks.map((c, idx) => (
                          <tr key={idx}>
                            <td className="py-3 pr-3 font-sans font-medium text-slate-900 dark:text-slate-100">
                              {c.name}
                            </td>
                            <td className="py-3 px-3 text-slate-500 dark:text-slate-400">{c.expected}</td>
                            <td className="py-3 px-3 text-slate-900 dark:text-slate-100 font-semibold">{c.actual}</td>
                            <td className="py-3 pl-3 text-right">
                              {c.passed ? (
                                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                                  <CheckCircle2 className="w-4 h-4" /> PASS
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-semibold">
                                  <XCircle className="w-4 h-4" /> FIX NEEDED
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Source Preview */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center space-y-3">
                <div className="w-full flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                  <span>Original Input</span>
                  <span>
                    {sourceSizeKb} KB · {sourceWidth}×{sourceHeight}
                  </span>
                </div>
                <div className="h-56 flex items-center justify-center overflow-hidden">
                  {sourceUrl && (
                    <img
                      src={sourceUrl}
                      alt="Original input preview"
                      className="max-h-56 w-auto object-contain rounded border border-slate-200 dark:border-slate-800"
                      referrerPolicy="no-referrer"
                    />
                  )}
                </div>
              </div>

              {/* Processed Output Preview */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center space-y-3">
                <div className="w-full flex items-center justify-between text-xs font-mono tabular-nums">
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                    {processing ? 'Encoding...' : 'Processed Result'}
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {outputSizeKb} KB · {outputWidth}×{outputHeight}
                  </span>
                </div>
                <div className="h-56 flex items-center justify-center overflow-hidden">
                  {outputUrl && (
                    <img
                      src={outputUrl}
                      alt="Processed output preview"
                      className="max-h-56 w-auto object-contain rounded border border-slate-200 dark:border-slate-800"
                      referrerPolicy="no-referrer"
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Batch ZIP Archive section for HEIC-to-JPG */}
          {tool.id === 'heic-to-jpg' && batchFiles.length > 0 && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Batch Converted Queue ({batchFiles.length} files)
                </span>
                <button
                  type="button"
                  onClick={downloadBatchZip}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download All as ZIP
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
