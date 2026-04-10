import React, { useState, useEffect, useContext } from "react";
import Image, { ImageProps } from "next/image";

import { SmartImageContext } from "./index";

function isStaticImport(source: any): source is { src: string } {
  return typeof source === "object" && source !== null && "src" in source;
}

const captionCache = new Map<string, string>();
const pendingRequestCache = new Map<string, Promise<string>>();

export interface SmartNextImageProps extends Omit<ImageProps, "alt"> {
  alt?: string;
  apiEndpoint?: string;
  fallbackAlt?: string;
  onCaptionGenerated?: (caption: string) => void;
  disableAI?: boolean;
  announceLive?: boolean;
}

export const SmartNextImage = ({
  src,
  alt,
  apiEndpoint: propsEndpoint,
  fallbackAlt = "Image loading or caption unavailable",
  onCaptionGenerated,
  disableAI: propsDisableAI,
  announceLive = false,
  ...props
}: SmartNextImageProps) => {
  const context = useContext(SmartImageContext);
  const apiEndpoint = propsEndpoint || context?.apiEndpoint;
  const disableAI = propsDisableAI ?? context?.disableAI ?? false;

  const [generatedAlt, setGeneratedAlt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const imageUrl = isStaticImport(src) ? src.src : (src as string);

  useEffect(() => {
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
        "[SmartNextImage] Missing 'apiEndpoint' prop. Please provide a backend API URL via props or SmartImageProvider to enable AI caption generation.",
      );
      setGeneratedAlt(fallbackAlt);
      return;
    }

    if (captionCache.has(imageUrl)) {
      console.log("[SmartNextImage] Cache hit: Reusing existing caption.");
      const cachedCaption = captionCache.get(imageUrl)!;
      setGeneratedAlt(cachedCaption);

      if (onCaptionGenerated) onCaptionGenerated(cachedCaption);
      return;
    }

    const generateCaption = async () => {
      setIsGenerating(true);
      try {
        if (pendingRequestCache.has(imageUrl)) {
          console.log("[SmartNextImage] Pending request detected. Waiting for the existing API call to complete.");
          const caption = await pendingRequestCache.get(imageUrl)!;
          setGeneratedAlt(caption);
          if (onCaptionGenerated) onCaptionGenerated(caption);
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

        setGeneratedAlt(newCaption);

        if (onCaptionGenerated) onCaptionGenerated(newCaption);
      } catch (error) {
        console.error("[SmartNextImage] Caption Error:", error);
        pendingRequestCache.delete(imageUrl);
        setGeneratedAlt(fallbackAlt);
      } finally {
        setIsGenerating(false);
      }
    };

    generateCaption();
  }, [src, alt, apiEndpoint, fallbackAlt, onCaptionGenerated, disableAI, imageUrl]);

  const srOnlyStyle: React.CSSProperties = {
    position: "absolute",
    width: "1px",
    height: "1px",
    padding: 0,
    margin: "-1px",
    overflow: "hidden",
    clip: "rect(0, 0, 0, 0)",
    whiteSpace: "nowrap",
    borderWidth: 0,
  };

  return (
    <>
      {announceLive && (
        <span style={srOnlyStyle} aria-live="polite" aria-atomic="true">
          {isGenerating
            ? "Generating image description. Please wait..."
            : generatedAlt
              ? `Image description generated: ${generatedAlt}`
              : ""}
        </span>
      )}

      <Image src={src} alt={generatedAlt || ""} aria-busy={isGenerating} {...props} />
    </>
  );
};
