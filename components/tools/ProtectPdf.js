"use client";

import { useState } from "react";
import FileDropzone from "@/components/FileDropzone";
import { downloadFile } from "@/lib/file-utils";

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
      script.onerror = () => reject(new Error("Failed to load PDF encryption engine."));
      document.head.appendChild(script);
    });
  }

  return {
    jsPDF: window.jspdf ? window.jspdf.jsPDF : null,
    pdfjsLib: window.pdfjsLib || null,
  };
}

export default function ProtectPdf() {
  const [files, setFiles] = useState([]);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [protectedBlob, setProtectedBlob] = useState(null);

  const handleProtect = async () => {
    if (!files.length) {
      setError("Please upload a PDF file.");
      return;
    }
    if (!password.trim()) {
      setError("Please enter a password.");
      return;
    }
    setError("");
    setProcessing(true);
    setDone(false);

    try {
      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();

      const { jsPDF, pdfjsLib } = await loadPdfEngines();
      if (!jsPDF || !pdfjsLib) {
        throw new Error("Could not load PDF processing tools.");
      }

      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdfDoc = await loadingTask.promise;
      const numPages = pdfDoc.numPages;

      let doc = null;

      for (let i = 1; i <= numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;

        const imgData = canvas.toDataURL("image/jpeg", 0.92);
        const pdfWidth = viewport.width / 2.0;
        const pdfHeight = viewport.height / 2.0;
        const orientation = pdfWidth > pdfHeight ? "landscape" : "portrait";

        if (i === 1) {
          doc = new jsPDF({
            orientation: orientation,
            unit: "pt",
            format: [pdfWidth, pdfHeight],
            encryption: {
              userPassword: password,
              ownerPassword: password,
              userPermissions: ["print", "modify", "copy", "annot-forms"],
            },
          });
          doc.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
        } else {
          doc.addPage([pdfWidth, pdfHeight], orientation);
          doc.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
        }
      }

      if (doc) {
        const blob = doc.output("blob");
        setProtectedBlob(blob);
        downloadFile(blob, `protected-${file.name}`);
        setDone(true);
      }
    } catch (err) {
      setError("Failed to protect PDF: " + err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadAgain = () => {
    if (protectedBlob && files.length > 0) {
      downloadFile(protectedBlob, `protected-${files[0].name}`);
    }
  };

  return (
    <div className="space-y-5">
      <FileDropzone
        accept=".pdf"
        maxSizeMB={50}
        files={files}
        onFilesChange={(newFiles) => {
          setFiles(newFiles);
          setDone(false);
          setProtectedBlob(null);
          setError("");
        }}
        hint="Upload PDF to password-protect"
      />

      {files.length > 0 && (
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700">Set PDF Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter password to lock PDF..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="tool-input pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-red-500 text-xs font-semibold">{error}</p>}

      {done && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span>🔒</span>
            <span>PDF successfully encrypted & protected with password!</span>
          </div>
          <button
            onClick={handleDownloadAgain}
            className="px-3 py-1 bg-emerald-700 text-white rounded-lg text-xs font-bold hover:bg-emerald-800"
          >
            Download Again
          </button>
        </div>
      )}

      <button
        onClick={handleProtect}
        disabled={!files.length || !password || processing}
        className="ct-btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {processing ? "Encrypting & Protecting PDF..." : "Protect PDF"}
      </button>
    </div>
  );
}

