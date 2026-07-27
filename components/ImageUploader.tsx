"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

interface ImageUploaderProps {
  onImageReady: (dataUrl: string) => void;
  currentImage?: string;
}

export function ImageUploader({ onImageReady, currentImage }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (accepted: File[]) => {
      setError(null);
      const file = accepted[0];
      if (!file) return;

      // Validação cliente: tamanho
      if (file.size > 5 * 1024 * 1024) {
        setError("Imagem deve ter até 5MB");
        return;
      }

      // Validação cliente: formato
      const validTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        setError("Formatos aceitos: JPG, PNG ou WebP");
        return;
      }

      try {
        // Converter para WebP via Canvas
        const webpDataUrl = await convertToWebP(file);
        setPreview(webpDataUrl);
        onImageReady(webpDataUrl);
      } catch {
        setError("Erro ao processar imagem. Tente outra.");
      }
    },
    [onImageReady]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/jpeg": [], "image/png": [], "image/webp": [] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  });

  const removeImage = () => {
    setPreview(null);
    onImageReady("");
  };

  return (
    <div>
      <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
        Foto do produto (opcional)
      </label>

      {preview ? (
        <div className="relative rounded-xl overflow-hidden bg-[var(--color-bg-card)]">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover"
          />
          <button
            onClick={removeImage}
            className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white rounded-lg p-1.5 hover:bg-black/80 transition-colors"
            title="Remover imagem"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? "border-[var(--color-accent-start)] bg-[var(--color-accent-start)]/5"
              : "border-[var(--color-border-subtle)] hover:border-[var(--color-text-muted)]"
          }`}
        >
          <input {...getInputProps()} />
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="mx-auto mb-2 text-[var(--color-text-muted)]"
          >
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {isDragActive ? "Solte a imagem aqui" : "Arraste ou clique para enviar"}
          </p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            JPG, PNG ou WebP · máx 5MB
          </p>
        </div>
      )}

      {error && (
        <p className="text-xs text-[var(--color-danger)] mt-1">{error}</p>
      )}
    </div>
  );
}

/** Converte imagem para WebP usando Canvas API */
function convertToWebP(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      // Limitar dimensões
      const MAX = 1200;
      let { width, height } = img;
      if (width > MAX || height > MAX) {
        const ratio = Math.min(MAX / width, MAX / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            // Fallback: browser não suporta WebP → JPEG
            canvas.toBlob(
              (jpegBlob) => {
                if (!jpegBlob) return reject(new Error("Canvas failed"));
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(jpegBlob);
              },
              "image/jpeg",
              0.85
            );
            return;
          }
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        },
        "image/webp",
        0.8
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };

    img.src = url;
  });
}
