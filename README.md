# react-a11y-auto-caption

> A smart React & Next.js component <br/>
> that automatically generates highly accurate `alt` text for images using AI.<br/>
> **Generate captions effortlessly during local development, <br/>
> save them to your database, and serve 100% accessible images in production<br/>
> with zero API costs and zero latency.**

[![npm version](https://img.shields.io/npm/v/react-a11y-auto-caption.svg)](https://www.npmjs.com/package/react-a11y-auto-caption)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Accessibility](https://img.shields.io/badge/Accessibility-100%25-brightgreen.svg)]()

---

## Why use this library?

- **Generate Once, Serve Forever (Best Practice):** Automatically generate captions during local development, easily save them to your database using the `onCaptionGenerated` callback, and completely bypass AI requests in production.
- **Cost-Free Local AI Server:** Comes with a ready-to-use, lightweight FastAPI Python server. It runs perfectly on your local machine, meaning you don't need to pay for expensive cloud GPUs or third-party API subscriptions (like OpenAI).
- **Zero-Config Accessibility:** Automatically describes images for screen readers without manual data entry.
- **First-Class Next.js Support:** Provides a dedicated `<SmartNextImage>` component optimized for Next.js, supporting both static imports and URL strings.
- **Smart LRU Caching:** Built-in LRU memory cache (max 500 entries) prevents duplicate API calls and unbounded memory growth.
- **Concurrent Request Defense:** Safely handles simultaneous renders of the same image across multiple components.
- **Reliable Error Handling:** Exposes errors via both `onCaptionError` callback and returned `error` state for full control over failure UX.
- **Global Provider Pattern:** Set your API endpoint once at the root level and forget about it.
- **Developer Experience (DX):** Built-in test mode (`disableAI`) and intelligent console warnings for smooth debugging.

---

## What's New in v1.1.0

- **LRU Cache:** Replaced unbounded `Map` cache with an LRU implementation to prevent memory leaks in long-running apps.
- **`onCaptionError` callback:** New prop to handle caption generation failures externally (e.g. logging, toast notifications).
- **`error` state:** `useAICaptions` hook now returns an `error` field so you can branch your UI on failure.
- **Unmount safety:** Caption generation is now safely cancelled when a component unmounts, preventing stale state updates.
- **Next.js static import support:** `<SmartNextImage>` now correctly resolves both `StaticImageData` and `StaticRequire` import types.
- **Subpath exports:** Added `react-a11y-auto-caption/next` entry point for cleaner Next.js-specific imports.

---

## Installation

```bash
# npm
npm install react-a11y-auto-caption

# yarn
yarn add react-a11y-auto-caption

# pnpm
pnpm add react-a11y-auto-caption
```

---

## Quick Start

### 1. Wrap your app with the Provider (Optional but Recommended)

Set your backend API endpoint once globally. Otherwise, pass `apiEndpoint` directly as a prop.

```tsx
// App.tsx or layout.tsx
import { SmartImageProvider } from "react-a11y-auto-caption";

export default function App({ children }) {
  return (
    <SmartImageProvider value={{ apiEndpoint: "https://your-api.com/api/generate-caption" }}>
      {children}
    </SmartImageProvider>
  );
}
```

### 2. Use it in your components

**Vanilla React (Vite, CRA):**

```tsx
import { SmartImage } from "react-a11y-auto-caption";

function Gallery() {
  return <SmartImage src="https://example.com/beautiful-landscape.jpg" announceLive={true} />;
}
```

**Next.js:**

```tsx
import { SmartNextImage } from "react-a11y-auto-caption/next";
import dogPic from "../public/dog.jpg";

function NextGallery() {
  return <SmartNextImage src={dogPic} width={500} height={300} disableAI={process.env.NODE_ENV === "production"} />;
}
```

---

## API Reference

Both `<SmartImage>` and `<SmartNextImage>` inherit all standard HTML `<img>` (or `next/image`) attributes, plus the following:

| Prop                 | Type                        | Default                                  | Description                                                                              |
| :------------------- | :-------------------------- | :--------------------------------------- | :--------------------------------------------------------------------------------------- |
| `apiEndpoint`        | `string`                    | `undefined`                              | The URL of your AI backend API. Overrides the `SmartImageProvider` endpoint if provided. |
| `alt`                | `string`                    | `undefined`                              | Manual alt text. If provided, AI generation is completely bypassed.                      |
| `fallbackAlt`        | `string`                    | `"Image loading or caption unavailable"` | Text used when the AI request fails or times out.                                        |
| `disableAI`          | `boolean`                   | `false`                                  | Disables AI generation and uses a mock caption. Recommended for testing.                 |
| `announceLive`       | `boolean`                   | `false`                                  | Enables `aria-live` region to announce generation status to screen readers.              |
| `onCaptionGenerated` | `(caption: string) => void` | `undefined`                              | Callback fired when a caption is successfully generated.                                 |
| `onCaptionError`     | `(error: Error) => void`    | `undefined`                              | Callback fired when caption generation fails. Use for logging or toast notifications.    |

> **Note:** `<SmartNextImage>` requires standard Next.js image props such as `width` and `height` (unless using `fill`).

---

## Error Handling

You can handle errors in two ways depending on your use case.

**Via callback** — for external handling like logging or toasts:

```tsx
<SmartImage src={imageUrl} onCaptionError={(err) => toast.error(err.message)} />
```

**Via `useAICaptions` hook** — for UI branching:

```tsx
const { generatedAlt, isGenerating, error } = useAICaptions({ src });

if (error) return <p>Failed to generate caption.</p>;
```

---

## Best Practice: Generate Once, Save, Reuse

Generating captions on-the-fly for every user is slow. The recommended pattern is to generate once and persist to your database:

```tsx
<SmartImage
  src={image.url}
  alt={image.savedAlt} // If provided, AI is skipped entirely
  apiEndpoint="http://localhost:8000/api/generate-caption"
  onCaptionGenerated={(text) => {
    saveToDatabase(image.id, text);
  }}
/>
```

---

## Security & Backend Integration

This package requires a backend to process images through an AI model (e.g. ViT-GPT2). We provide a ready-to-use FastAPI reference server in [this repository](https://github.com/kong33/SmartImage).

For security, all cross-origin requests are blocked by default. Set the `ALLOWED_ORIGINS` environment variable in your server's `.env` file:

```bash
# Production
ALLOWED_ORIGINS=https://your-frontend-domain.com

# Local development
ALLOWED_ORIGINS=http://localhost:3000
```

> **Note:** Separate multiple origins with a comma and no spaces. Adjust the port if using Vite (`5173`) or another local server.
