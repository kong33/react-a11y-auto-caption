"use client";

import React from "react";
import Image, { ImageProps } from "next/image";

import { useAICaptions } from "./useAICaption";

export interface SmartNextImageProps extends Omit<ImageProps, "alt"> {
  alt?: string;
  apiEndpoint?: string;
  fallbackAlt?: string;
  onCaptionGenerated?: (caption: string) => void;
  onCaptionError?: (error: Error) => void;
  disableAI?: boolean;
  announceLive?: boolean;
  lazyGenerate?: boolean;
}
export const SR_ONLY_STYLE: React.CSSProperties = {
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
export const SmartNextImage = ({
  src,
  alt,
  apiEndpoint: propsEndpoint,
  fallbackAlt = "Image loading or caption unavailable",
  onCaptionGenerated,
  onCaptionError,
  disableAI: propsDisableAI,
  announceLive = false,
  lazyGenerate = true,
  ...props
}: SmartNextImageProps) => {
  const { isGenerating, generatedAlt, announcement, imgRef } = useAICaptions({
    src,
    alt,
    apiEndpoint: propsEndpoint,
    fallbackAlt,
    onCaptionGenerated,
    disableAI: propsDisableAI,
    announceLive,
    lazyGenerate,
  });
  return (
    <>
      {announceLive && (
        <span style={SR_ONLY_STYLE} aria-live="polite" aria-atomic="true">
          {announcement}
        </span>
      )}

      <Image src={src} ref={imgRef} alt={generatedAlt || fallbackAlt} aria-busy={isGenerating} {...props} />
    </>
  );
};
