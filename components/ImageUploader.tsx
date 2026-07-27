"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

interface Props {
  onImageReady: (dataUrl: string) => void;
  currentImage?: string;
}

export function ImageUploader({ onImageReady, currentImage }: Props) {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (accepted: File[]) => {
    setError(null);
    const file = accepted[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError("Máx 5MB"); return; }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) { setError("JPG, PNG ou WebP"); return; }
    try {
      const webp = await convertToWebP(file);
      setPreview(webp);
      onImageReady(webp);
    } catch { setError("Erro ao processar"); }
  }, [onImageReady]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { "image/jpeg": [], "image/png": [], "image/webp": [] }, maxFiles: 1, maxSize: 5 * 1024 * 1024,
  });

  return (
    <div>
      {preview ? (
        <div className="relative rounded-xl overflow-hidden bg-[var(--color-bg-card)] inline-block">
          <img src={preview} alt="Preview" className="w-24 h-24 object-cover" />
          <button onClick={() => { setPreview(null); onImageReady(""); }}
            className="absolute top-1 right-1 bg-black/60 backdrop-blur-sm text-white rounded-md p-0.5 hover:bg-black/80">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/></svg>
          </button>
        </div>
      ) : (
        <div {...getRootProps()}
          className={`inline-flex items-center gap-2 border-2 border-dashed rounded-xl px-4 py-3 cursor-pointer transition-colors ${
            isDragActive ? "border-[var(--color-accent-start)] bg-[var(--color-accent-start)]/5" : "border-[var(--color-border-subtle)] hover:border-[var(--color-text-muted)]"
          }`}>
          <input {...getInputProps()} />
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--color-text-muted)] shrink-0">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-sm text-[var(--color-text-secondary)]">Foto do produto</span>
          <span className="text-xs text-[var(--color-text-muted)] hidden sm:inline">JPG/PNG/WebP · 5MB</span>
        </div>
      )}
      {error && <p className="text-xs text-[var(--color-danger)] mt-1">{error}</p>}
    </div>
  );
}

function convertToWebP(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const MAX = 1200;
      let { width, height } = img;
      if (width > MAX || height > MAX) { const r = Math.min(MAX / width, MAX / height); width = Math.round(width * r); height = Math.round(height * r); }
      const canvas = document.createElement("canvas");
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => {
        if (!blob) {
          canvas.toBlob((jpegBlob) => {
            if (!jpegBlob) return reject(new Error("Canvas failed"));
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(jpegBlob);
          }, "image/jpeg", 0.85);
          return;
        }
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      }, "image/webp", 0.8);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Failed to load image")); };
    img.src = url;
  });
}
