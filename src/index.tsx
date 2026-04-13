import React, { ImgHTMLAttributes } from "react";
import { SmartImageContext, useAICaptions } from "./useAICaption";

export const SmartImageProvider: React.FC<{
  value: { apiEndpoint?: string; disableAI?: boolean };
  children: React.ReactNode;
}> = ({ value, children }) => {
  return <SmartImageContext.Provider value={value}>{children}</SmartImageContext.Provider>;
};

export interface SmartImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  apiEndpoint?: string;
  fallbackAlt?: string;
  onCaptionGenerated?: (caption: string) => void;
  disableAI?: boolean;
  announceLive?: boolean;
  onCaptionError?: (error: Error) => void;
}

const SR_ONLY_STYLE: React.CSSProperties = {
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

export const SmartImage = ({
  src,
  alt,
  apiEndpoint: propsEndpoint,
  fallbackAlt = "Image loading or caption unavailable",
  onCaptionGenerated,
  disableAI: propsDisableAI,
  announceLive = false,
  onCaptionError,
  ...props
}: SmartImageProps) => {
  const { isGenerating, generatedAlt } = useAICaptions({
    src,
    alt,
    apiEndpoint: propsEndpoint,
    fallbackAlt,
    onCaptionGenerated,
    disableAI: propsDisableAI,
    announceLive,
    onCaptionError,
  });

  return (
    <>
      {announceLive && (
        <span style={SR_ONLY_STYLE} aria-live="polite" aria-atomic="true">
          {isGenerating
            ? "Generating image description. Please wait..."
            : generatedAlt
              ? `Image description generated: ${generatedAlt}`
              : ""}
        </span>
      )}
      <img src={src} alt={generatedAlt} aria-busy={isGenerating} {...props} />
    </>
  );
};
