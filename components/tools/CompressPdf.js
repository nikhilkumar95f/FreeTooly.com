"use client";

import { useState } from "react";
import FileDropzone from "@/components/FileDropzone";
import { downloadFile } from "@/lib/file-utils";

async function loadPdfLib() {
  if (typeof window !== "undefined" && window.PDFLib) {
    return window.PDFLib;
  }
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return resolve(null);
    const script = document.createElement("script");
    script.src = "https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js";
    script.onload = () => resolve(window.PDFLib);
    script.onerror = () => reject(new Error("Failed to load PDF processing engine."));
    document.head.appendChild(script);
  });
}

async function loadPdfEngines() {
  if (typeof window === "undefined") return { jsPDF: null, pdfjsLib: null };

  if (!window.pdfjsLib) {
    await new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
      script.onload = () => {
        if (window.pdfjsLib) {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc =
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        }
        resolve();
      };
      script.onerror = () => reject(new Error("Failed to load PDF viewer engine."));
      document.head.appendChild(script);
    });
  }

  if (!window.jspdf) {
    await new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
      script.onload = resolve;
      script.onerror = () => reject(new Error("Failed to load PDF engine."));
      document.head.appendChild(script);
    });
  }

  return {
    jsPDF: window.jspdf ? window.jspdf.jsPDF : null,
    pdfjsLib: window.pdfjsLib || null,
  };
}

async function renderRasterPdf(arrayBuffer, renderScale, quality) {
  try {
    const { jsPDF, pdfjsLib } = await loadPdfEngines();
    if (!jsPDF || !pdfjsLib) return null;

    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer.slice(0) });
    const docPdfJs = await loadingTask.promise;
    const numPages = docPdfJs.numPages;

    let docJsPdf = null;
    for (let i = 1; i <= numPages; i++) {
      const page = await docPdfJs.getPage(i);
      const viewport = page.getViewport({ scale: renderScale });

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);

      await page.render({ canvasContext: context, viewport }).promise;

      const imgData = canvas.toDataURL("image/jpeg", quality);
      const pdfWidth = viewport.width / renderScale;
      const pdfHeight = viewport.height / renderScale;
      const orientation = pdfWidth > pdfHeight ? "landscape" : "portrait";

      if (i === 1) {
        docJsPdf = new jsPDF({
          orientation,
          unit: "pt",
          format: [pdfWidth, pdfHeight],
        });
        docJsPdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight, undefined, "FAST");
      } else {
        docJsPdf.addPage([pdfWidth, pdfHeight], orientation);
        docJsPdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight, undefined, "FAST");
      }
    }

    if (docJsPdf) {
      const buf = docJsPdf.output("arraybuffer");
      return new Uint8Array(buf);
    }
  } catch (err) {
    console.warn("Raster render failed:", err);
  }
  return null;
}

export default function CompressPdf() {
  const [files, setFiles] = useState([]);
  const [level, setLevel] = useState("medium");
  const [processing, setProcessing] = useState(false);
  const [resultStats, setResultStats] = useState(null);
  const [error, setError] = useState("");
  const [compressedBlob, setCompressedBlob] = useState(null);

  const handleCompress = async () => {
    if (!files.length) {
      setError("Please upload a PDF file.");
      return;
    }
    setError("");
    setProcessing(true);
    setResultStats(null);

    try {
      const file = files[0];
      const origBytes = file.size;
      const origMB = (origBytes / (1024 * 1024)).toFixed(2);
      const arrayBuffer = await file.arrayBuffer();

      // Step 1: Structural object stream compression (Low level)
      const pdfLib = await loadPdfLib();
      const PDFDocument = pdfLib.PDFDocument;

      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      pdfDoc.setTitle("");
      pdfDoc.setAuthor("");
      pdfDoc.setSubject("");
      pdfDoc.setKeywords([]);
      pdfDoc.setProducer("FreeTooly");
      pdfDoc.setCreator("FreeTooly");

      const lowBytes = await pdfDoc.save({ useObjectStreams: true });
      let finalBytes = lowBytes;

      if (level === "medium") {
        // Medium: Try scale 0.45, quality 0.25 to ensure it shrinks below Low
        let rasterBytes = await renderRasterPdf(arrayBuffer, 0.45, 0.25);
        if (rasterBytes && rasterBytes.length < lowBytes.length) {
          finalBytes = rasterBytes;
        } else {
          // If 0.45 scale wasn't smaller than Low, drop to 0.35 scale
          let smallerRaster = await renderRasterPdf(arrayBuffer, 0.35, 0.20);
          if (smallerRaster && smallerRaster.length < lowBytes.length) {
            finalBytes = smallerRaster;
          } else {
            finalBytes = lowBytes;
          }
        }
      } else if (level === "high") {
        // High: Try scale 0.30, quality 0.15 for aggressive compression
        let rasterBytes = await renderRasterPdf(arrayBuffer, 0.30, 0.15);
        if (rasterBytes && rasterBytes.length < lowBytes.length) {
          finalBytes = rasterBytes;
        } else {
          // Drop to 0.22 scale for maximum reduction
          let ultraRaster = await renderRasterPdf(arrayBuffer, 0.22, 0.12);
          if (ultraRaster && ultraRaster.length < lowBytes.length) {
            finalBytes = ultraRaster;
          } else {
            finalBytes = lowBytes;
          }
        }
      }

      // ULTIMATE RULE: Compressed size must NEVER exceed original file size
      if (finalBytes.length > origBytes) {
        finalBytes = lowBytes.length < origBytes ? lowBytes : new Uint8Array(arrayBuffer);
      }

      const finalBlob = new Blob([finalBytes], { type: "application/pdf" });
      const compBytes = finalBlob.size;
      const compressedMB = (compBytes / (1024 * 1024)).toFixed(2);
      const reduction = Math.max(1, Math.min(99, Math.round(((origBytes - compBytes) / origBytes) * 100)));

      setCompressedBlob(finalBlob);
      downloadFile(finalBlob, `compressed-${file.name}`);
      setResultStats({ origMB, compressedMB, reduction });
    } catch (err) {
      setError("Failed to compress PDF: " + err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadAgain = () => {
    if (compressedBlob && files.length > 0) {
      downloadFile(compressedBlob, `compressed-${files[0].name}`);
    }
  };

  return (
    <div className="space-y-5">
      <FileDropzone
        accept=".pdf"
        maxSizeMB={100}
        files={files}
        onFilesChange={(newFiles) => {
          setFiles(newFiles);
          setResultStats(null);
          setCompressedBlob(null);
          setError("");
        }}
        hint="Upload PDF file to compress"
      />

      {files.length > 0 && (
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700">Compression Level</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "low", label: "Low", sub: "Best Quality" },
              { id: "medium", label: "Medium", sub: "Recommended" },
              { id: "high", label: "High", sub: "Smallest Size" },
            ].map((lvl) => (
              <button
                key={lvl.id}
                onClick={() => setLevel(lvl.id)}
                className={`p-3 rounded-xl border text-left text-xs transition-all ${
                  level === lvl.id
                    ? "bg-blue-50 border-blue-600 text-blue-900 font-bold"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <div className="font-bold">{lvl.label}</div>
                <div className="text-[10px] text-slate-400">{lvl.sub}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {error && <p className="text-red-500 text-xs font-semibold">{error}</p>}

      {resultStats && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-bold">Original</div>
              <div className="text-sm font-bold text-slate-900">{resultStats.origMB} MB</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-bold">Compressed</div>
              <div className="text-sm font-bold text-emerald-700">{resultStats.compressedMB} MB</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-bold">Saved</div>
              <div className="text-sm font-bold text-emerald-700">-{resultStats.reduction}%</div>
            </div>
          </div>
          <button
            onClick={handleDownloadAgain}
            className="w-full py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800"
          >
            ⬇ Download Compressed PDF Again
          </button>
        </div>
      )}

      <button
        onClick={handleCompress}
        disabled={!files.length || processing}
        className="ct-btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {processing ? "Compressing PDF Pages..." : "Compress PDF"}
      </button>
    </div>
  );
}






