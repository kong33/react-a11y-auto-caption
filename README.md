# react-a11y-auto-caption

> AI-powered alt text generation component for React and Next.js images.
> Generate captions during development, save them once, and reuse them in production for fast, accessible images.

[![npm version](https://img.shields.io/npm/v/react-a11y-auto-caption.svg)](https://www.npmjs.com/package/react-a11y-auto-caption)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Accessibility](https://img.shields.io/badge/Accessibility-100%25-brightgreen.svg)]()

---
## Why use react-a11y-auto-caption?

- **Generate once, reuse forever** — create captions during development, save them, and skip AI calls in production.
- **Built for accessibility** — automatically provide meaningful alt text for screen readers.
- **Works with React and Next.js** — includes both `<SmartImage>` and `<SmartNextImage>`.
- **Bring your own backend** — use your own FastAPI, Flask, or Node caption API.
- **Production-friendly** — caching, duplicate-request protection, and error handling are built in.

---

## Quick Start

### React

```tsx
import { SmartImage } from 'react-a11y-auto-caption';

export default function Demo() {
  return (
    <SmartImage
      src="https://example.com/image.jpg"
      apiEndpoint="http://localhost:8000/api/generate-caption"
    />
  );
}
```

### Next.js

```tsx
import { SmartNextImage } from 'react-a11y-auto-caption/next';
import sampleImage from '../public/sample.jpg';

export default function Demo() {
  return (
    <SmartNextImage
      src={sampleImage}
      width={500}
      height={300}
      apiEndpoint="http://localhost:8000/api/generate-caption"
    />
  );
}
```
> **Optional**: set the API endpoint once with a Provider

### Wrap your app with the Provider (Optional but Recommended)

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
## Recommended workflow

1. Generate captions during local development with light [python server](https://github.com/kong33/SmartImage)
2. Save them to your database with `onCaptionGenerated`
3. Pass the saved `alt` text in production
4. Skip AI requests entirely for zero extra latency

---

## API Reference

Both `<SmartImage>` and `<SmartNextImage>` inherit all standard HTML `<img>` (or `next/image`) attributes, plus the following:

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `apiEndpoint` | `string` | `undefined` | The URL of your AI backend API. Overrides the `SmartImageProvider` endpoint if provided. |
| `alt` | `string` | `undefined` | Manual alt text. If provided, AI generation is completely bypassed. |
| `fallbackAlt` | `string` | `"Image loading or caption unavailable"` | Text used when the AI request fails or times out. |
| `lazyGenerate` | `boolean` | `true` | Delays AI API calls until the image enters the viewport using `IntersectionObserver`.|
| `disableAI` | `boolean` | `false` | Disables AI generation and uses a mock caption. Recommended for testing. |
| `announceLive` | `boolean` | `false` | Enables `aria-live` region to announce generation status to screen readers. |
| `onCaptionGenerated` | `(caption: string) => void` | `undefined` | Callback fired when a caption is successfully generated. |
| `onCaptionError` | `(error: Error) => void` | `undefined` | Callback fired when caption generation fails. Use for logging or toast notifications. |

> **Note:** `<SmartNextImage>` requires standard Next.js image props such as `width` and `height` (unless using `fill`).

---

## Error Handling

You can handle errors in two ways depending on your use case.

**Via callback** — for external handling like logging or toasts:

```tsx
<SmartImage
  src={imageUrl}
  onCaptionError={(err) => toast.error(err.message)}
/>
```

**Via `useAICaptions` hook** — for UI branching:

```tsx
const { generatedAlt, isGenerating, error } = useAICaptions({ src });

if (error) return <p>Failed to generate caption.</p>;
```

---

## Backend Integration

This package needs a caption API endpoint to generate alt text.

The easiest way is to run the official local server:

```bash
npx react-a11y-auto-caption-server
```

By default, the server runs at:

```txt
http://127.0.0.1:8000/api/generate-caption
```

Use it with `SmartImage` or `SmartNextImage`:

```tsx
<SmartImage
  src="/example.jpg"
  apiEndpoint="http://127.0.0.1:8000/api/generate-caption"
/>
```

You can also change the port:

```bash
npx react-a11y-auto-caption-server --port 5000
```

Then update the endpoint:

```tsx
<SmartImage
  src="/example.jpg"
  apiEndpoint="http://127.0.0.1:5000/api/generate-caption"
/>
```

> First run may take a few minutes because the server creates a Python environment and installs AI dependencies.

For production, we recommend running your own caption server and applying CORS restrictions, file size limits, and rate limiting.

---

## What's New in v1.0.4

- **LRU Cache:** Replaced unbounded `Map` cache with an LRU implementation to prevent memory leaks in long-running apps.
- **`onCaptionError` callback:** New prop to handle caption generation failures externally (e.g. logging, toast notifications).
- **`error` state:** `useAICaptions` hook now returns an `error` field so you can branch your UI on failure.
- **Unmount safety:** Caption generation is now safely cancelled when a component unmounts, preventing stale state updates.
- **Next.js static import support:** `<SmartNextImage>` now correctly resolves both `StaticImageData` and `StaticRequire` import types.
- **Subpath exports:** Added `react-a11y-auto-caption/next` entry point for cleaner Next.js-specific imports.

  
