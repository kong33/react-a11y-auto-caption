import { StaticImport } from "next/dist/shared/lib/get-img-props";
import { StaticImageData } from "next/image";
import { createContext, useContext, useEffect, useRef, useState } from "react";

export interface UseAICaptionOptions {
  src?: string | StaticImport;
  alt?: string;
  apiEndpoint?: string;
  fallbackAlt?: string;
  onCaptionGenerated?: (caption: string) => void;
  onCaptionError?: (error: Error) => void;
  disableAI?: boolean;
  announceLive?: boolean;
}

interface SmartImageContextProps {
  apiEndpoint?: string;
  disableAI?: boolean;
}

export const SmartImageContext = createContext<SmartImageContextProps | undefined>(undefined);

const MAX_SIZE = 500;

class LRUCaptionCache {
  private cache = new Map<string, string>();

  get(key: string): string | undefined {
    if (!this.cache.has(key)) return undefined;

    const value = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }
  set(key: string, value: string) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    if (this.cache.size >= MAX_SIZE) {
      this.cache.delete(this.cache.keys().next().value!);
    }
    this.cache.set(key, value);
  }
  has(key: string) {
    return this.cache.has(key);
  }
  clear() {
    this.cache.clear();
  }
}

const captionCache = new LRUCaptionCache();
const pendingRequestCache = new Map<string, Promise<string>>();

function isStaticImageData(src: string | StaticImport): src is StaticImageData {
  return typeof src === "object" && src !== null && "src" in src;
}

function resolveImageUrl(src: string | StaticImport): string {
  if (typeof src === "string") return src;
  if (isStaticImageData(src)) return src.src;
  return src.default.src;
}

const log = process.env.NODE_ENV === "development" ? console.log : () => {};

export const useAICaptions = ({
  src,
  alt,
  apiEndpoint: propsEndpoint,
  fallbackAlt = "Image loading or caption unavailable",
  onCaptionGenerated,
  disableAI: propsDisableAI,
  onCaptionError,
}: UseAICaptionOptions) => {
  const context = useContext(SmartImageContext);

  const apiEndpoint = propsEndpoint || context?.apiEndpoint;
  const disableAI = propsDisableAI ?? context?.disableAI ?? false;

  const [generatedAlt, setGeneratedAlt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const onCaptionGeneratedRef = useRef(onCaptionGenerated);
  const onCaptionErrorRef = useRef(onCaptionError);

  useEffect(() => {
    onCaptionGeneratedRef.current = onCaptionGenerated;
    onCaptionErrorRef.current = onCaptionError;
  });

  useEffect(() => {
    setError(null);

    if (alt) {
      setGeneratedAlt(alt);
      return;
    }

    if (!src) return;

    if (disableAI) {
      setGeneratedAlt("[Testing mode: AI caption generation disabled]");
      return;
    }

    if (!apiEndpoint) {
      console.warn(
        "[SmartImage] Missing 'apiEndpoint' prop. Please provide a backend API URL via props or SmartImageProvider to enable AI caption generation.",
      );
      setGeneratedAlt(fallbackAlt);
      return;
    }

    const imageUrl = resolveImageUrl(src);

    if (captionCache.has(imageUrl)) {
      log("[SmartImage] Cache hit: Reusing existing caption.");
      const cachedCaption = captionCache.get(imageUrl)!;
      setGeneratedAlt(cachedCaption);
      if (onCaptionGeneratedRef.current) onCaptionGeneratedRef.current(cachedCaption);
      return;
    }

    let cancelled = false;

    const generateCaption = async () => {
      setIsGenerating(true);
      try {
        if (pendingRequestCache.has(imageUrl)) {
          log("[SmartImage] Pending request detected. Waiting for the existing API call to complete.");
          const caption = await pendingRequestCache.get(imageUrl)!;
          if (cancelled) return;
          setGeneratedAlt(caption);
          if (onCaptionGeneratedRef.current) onCaptionGeneratedRef.current(caption);
          return;
        }

        const fetchPromise = (async () => {
          const imageResponse = await fetch(imageUrl);
          const imageBlob = await imageResponse.blob();
          const imageFile = new File([imageBlob], "image.jpg", {
            type: imageBlob.type || "image/jpeg",
          });
          const formData = new FormData();
          formData.append("file", imageFile);

          const response = await fetch(apiEndpoint, {
            method: "POST",
            body: formData,
          });

          if (!response.ok) throw new Error("AI API request failed");
          const data = await response.json();
          if (data.caption) return data.caption;
          throw new Error("No caption returned from the API.");
        })();

        pendingRequestCache.set(imageUrl, fetchPromise);

        const newCaption = await fetchPromise;
        pendingRequestCache.delete(imageUrl);
        captionCache.set(imageUrl, newCaption);

        if (cancelled) return;
        setGeneratedAlt(newCaption);
        if (onCaptionGeneratedRef.current) onCaptionGeneratedRef.current(newCaption);
      } catch (err) {
        const normalizedError = err instanceof Error ? err : new Error("Unknown error");
        pendingRequestCache.delete(imageUrl);
        if (cancelled) return;
        setError(normalizedError);
        setGeneratedAlt(fallbackAlt);
        if (onCaptionErrorRef.current) onCaptionErrorRef.current(normalizedError);
      } finally {
        if (!cancelled) setIsGenerating(false);
      }
    };

    generateCaption();

    return () => {
      cancelled = true;
    };
  }, [src, alt, apiEndpoint, fallbackAlt, disableAI]);

  return { generatedAlt, isGenerating, error };
};
