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
- **Local-first by default** — run the official caption server with `npx`.
- **Production-friendly** — caching, duplicate-request protection, lazy generation, and error handling are built in.

---

## Installation

```bash
npm install react-a11y-auto-caption
```

or:

```bash
yarn add react-a11y-auto-caption
```

or:

```bash
pnpm add react-a11y-auto-caption
```

---

## Quick Start

### 1. Start the local caption server

```bash
npx react-a11y-auto-caption-server
```

Default endpoint:

```txt
http://127.0.0.1:8000/api/generate-caption
```

If port `8000` is unavailable, use another port:

```bash
npx react-a11y-auto-caption-server --port 5000
```

Then use:

```txt
http://127.0.0.1:5000/api/generate-caption
```

### 2. Use `SmartImage`

```tsx
import { SmartImage } from "react-a11y-auto-caption";

export default function Demo() {
  return (
    <SmartImage
      src="/example.jpg"
      apiEndpoint="http://127.0.0.1:8000/api/generate-caption"
    />
  );
}
```

### 3. Use `SmartNextImage`

```tsx
import { SmartNextImage } from "react-a11y-auto-caption/next";
import sampleImage from "../public/sample.jpg";

export default function Demo() {
  return (
    <SmartNextImage
      src={sampleImage}
      width={500}
      height={300}
      apiEndpoint="http://127.0.0.1:8000/api/generate-caption"
    />
  );
}
```

---

## Provider Setup

You can set the backend API endpoint once globally instead of passing `apiEndpoint` to every image.

```tsx
import { SmartImageProvider } from "react-a11y-auto-caption";

export default function App({ children }) {
  return (
    <SmartImageProvider
      value={{
        apiEndpoint: "http://127.0.0.1:8000/api/generate-caption",
      }}
    >
      {children}
    </SmartImageProvider>
  );
}
```

Then use `SmartImage` without repeating the endpoint:

```tsx
<SmartImage src="/example.jpg" />
```

---

## Recommended Workflow

1. Run the local caption server with `npx react-a11y-auto-caption-server`
2. Generate captions during development
3. Save generated captions to your database with `onCaptionGenerated`
4. Pass the saved `alt` text in production
5. Skip AI requests entirely for faster production pages

Example:

```tsx
<SmartImage
  src="/example.jpg"
  alt={savedAlt || undefined}
  apiEndpoint="http://127.0.0.1:8000/api/generate-caption"
  onCaptionGenerated={(caption) => {
    saveAltTextToDatabase(caption);
  }}
/>
```

> If `alt` is provided, AI generation is bypassed. This is intentional so saved captions can be reused in production.

---

## Public Demo Server

You can test the package with the public demo server:

```txt
https://kong3333-react-a11y-auto-caption-server.hf.space/api/generate-caption
```

Example:

```tsx
<SmartImage
  src="/example.jpg"
  apiEndpoint="https://kong3333-react-a11y-auto-caption-server.hf.space/api/generate-caption"
/>
```

> The public demo server is for testing only. It may be slow, paused, or unavailable depending on free-tier limits.  
> For production, run your own caption server.

---

## Backend Integration

This package needs a caption API endpoint that accepts an image file and returns a caption.

The official local server is the easiest option:

```bash
npx react-a11y-auto-caption-server
```

Default endpoint:

```txt
http://127.0.0.1:8000/api/generate-caption
```

Custom port:

```bash
npx react-a11y-auto-caption-server --port 5000
```

Custom endpoint:

```txt
http://127.0.0.1:5000/api/generate-caption
```

The caption server automatically allows local development origins such as:

```txt
http://localhost:<any-port>
http://127.0.0.1:<any-port>
```

For production or internal company servers, configure `ALLOWED_ORIGINS` on the server side.

Example:

```env
ALLOWED_ORIGINS=https://your-frontend-domain.com,http://localhost:3000
```

If your frontend runs locally but the caption server runs on another machine, your frontend endpoint should point to that machine:

```tsx
<SmartImage
  src="/example.jpg"
  apiEndpoint="http://192.168.0.20:8000/api/generate-caption"
/>
```

---

## API Reference

Both `<SmartImage>` and `<SmartNextImage>` inherit standard HTML `<img>` or `next/image` props, plus the following:

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `apiEndpoint` | `string` | `undefined` | The URL of your AI backend API. Overrides the `SmartImageProvider` endpoint if provided. |
| `alt` | `string` | `undefined` | Manual alt text. If provided, AI generation is completely bypassed. |
| `fallbackAlt` | `string` | `"Image loading or caption unavailable"` | Text used when the AI request fails. |
| `lazyGenerate` | `boolean` | `true` | Delays AI API calls until the image enters the viewport using `IntersectionObserver`. |
| `disableAI` | `boolean` | `false` | Disables AI generation and uses a mock caption. Useful for tests. |
| `announceLive` | `boolean` | `false` | Enables an `aria-live` region to announce generation status to screen readers. |
| `onCaptionGenerated` | `(caption: string) => void` | `undefined` | Callback fired when a caption is successfully generated. |
| `onCaptionError` | `(error: Error) => void` | `undefined` | Callback fired when caption generation fails. Useful for logging or toast notifications. |

> `<SmartNextImage>` requires standard Next.js image props such as `width` and `height`, unless using `fill`.

---

## Error Handling

Use `onCaptionError` for logging, toast messages, or debugging.

```tsx
<SmartImage
  src="/example.jpg"
  apiEndpoint="http://127.0.0.1:8000/api/generate-caption"
  onCaptionError={(error) => {
    console.error("Caption generation failed:", error);
  }}
/>
```

You can also use the hook directly:

```tsx
const { generatedAlt, isGenerating, error } = useAICaptions({
  src: "/example.jpg",
  apiEndpoint: "http://127.0.0.1:8000/api/generate-caption",
});

if (error) return <p>Failed to generate caption.</p>;
```

---

## Troubleshooting

### API request does not run

Check that:

- `apiEndpoint` points to `/api/generate-caption`
- the caption server is running
- the frontend endpoint uses the same port as the server
- `alt` is not already provided if you expect AI generation
- `lazyGenerate={false}` is used while debugging viewport-related issues
- the latest package version is installed

Debug example:

```tsx
<SmartImage
  src="/example.jpg"
  apiEndpoint="http://127.0.0.1:8000/api/generate-caption"
  lazyGenerate={false}
  onCaptionGenerated={(caption) => console.log("Generated:", caption)}
  onCaptionError={(error) => console.error("Caption error:", error)}
/>
```

### Port 8000 is unavailable

Run the server on another port:

```bash
npx react-a11y-auto-caption-server --port 8001
```

Then update your frontend:

```tsx
<SmartImage
  src="/example.jpg"
  apiEndpoint="http://127.0.0.1:8001/api/generate-caption"
/>
```

### External image URLs

If an external image URL fails before reaching the caption server, try a local image first:

```tsx
<SmartImage
  src="/sample.jpg"
  apiEndpoint="http://127.0.0.1:8000/api/generate-caption"
/>
```

Some external image hosts block browser-side `fetch()` access even if the image displays correctly in an `<img>` tag.

---

## What's New

- Fixed lazy generation so captions are triggered correctly after images enter the viewport.
- Added official `npx react-a11y-auto-caption-server` workflow.
- Added custom backend server port support.
- Added public demo server option for quick testing.

---

## Related

- [`react-a11y-auto-caption-server`](https://www.npmjs.com/package/react-a11y-auto-caption-server)

---

## License

MIT
