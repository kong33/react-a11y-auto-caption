# react-a11y-auto-caption

> A smart React & Next.js component that automatically generates highly accurate `alt` text for images using AI,<br/>
making your web applications instantly accessible (a11y) to everyone.

[![npm version](https://img.shields.io/npm/v/react-a11y-auto-caption.svg)](https://www.npmjs.com/package/react-a11y-auto-caption)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Accessibility](https://img.shields.io/badge/Accessibility-100%25-brightgreen.svg)]()

## Why use this library?

- **Zero-Config Accessibility:** Automatically describes images for screen readers without manual data entry.
- **First-Class Next.js Support:** Provides a dedicated `<SmartNextImage>` component optimized for Next.js.
- **Smart Request Caching:** Built-in memory caching prevents duplicate API calls for the same image, saving your server costs.
- **Concurrent Request Defense:** Safely handles simultaneous renders of the same image across multiple components.
- **Global Provider Pattern:** Set your API endpoint once at the root level and forget about it.
- **Developer Experience (DX):** Built-in test mode (`disableAI`) and intelligent console warnings for smooth debugging.

---

## Installation

npm
```bash
npm install react-a11y-auto-caption
```
yarn berry
```bash
yarn add react-a11y-auto-caption
```
pnpm
```bash
pnpm add react-a11y-auto-caption
```

---
## Quick Start

### 1. Wrap your app with the Provider (Optional but Recommended) <br/>
Set your backend API endpoint once globally. <br/>
Otherwise, you can simply pass apiEndpoint as a prop when using `<SmartImage>` <br/>

```ts
// App.tsx or layout.tsx
import { SmartImageProvider } from 'react-a11y-auto-caption';

export default function App({ children }) {
  return (
    <SmartImageProvider value={{ apiEndpoint: "https://your-api.com/api/generate-caption" }}>
      {children}
    </SmartImageProvider>
  );
}
```
### 2. Use it in your components
For Vanilla React (Vite, CRA):<br/>
```ts
import { SmartImage } from 'react-a11y-auto-caption';

function Gallery() {
  return (
    <SmartImage 
      src="[https://example.com/beautiful-landscape.jpg](https://example.com/beautiful-landscape.jpg)" 
      announceLive={true} 
    />
  );
}
```

For Next.js: <br/>
```ts
import { SmartNextImage } from 'react-a11y-auto-caption';
import dogPic from '../public/dog.jpg';

function NextGallery() {
  return (
    <SmartNextImage 
      src={dogPic} 
      width={500} 
      height={300}
      // You can override global settings per component
      disableAI={process.env.NODE_ENV === 'development'} 
    />
  );
}
```
---

## API Reference 
Both `SmartImage` and `SmartNextImage` inherit all standard `<img>` / `next/image` props, plus the following: <br/>
## API Reference (Props)

Both `<SmartImage>` and `<SmartNextImage>` inherit all standard HTML `<img>` (or `next/image`) attributes. The following custom props are available:

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `apiEndpoint` | `string` | `undefined` | The URL of your AI backend API. Overrides the `SmartImageProvider`'s endpoint if provided. |
| `alt` | `string` | `undefined` | Manual alt text. If provided, the AI generation is completely bypassed. |
| `fallbackAlt` | `string` | `"Image loading or caption unavailable"` | The text displayed if the AI API request fails or times out. |
| `disableAI` | `boolean` | `false` | Disables AI generation and uses a mock caption. Highly recommended for local development and testing. |
| `announceLive` | `boolean` | `false` | Enables `aria-live` regions to dynamically announce the generation status to screen readers. |
| `onCaptionGenerated`| `function` | `undefined` | Callback fired when a caption is successfully generated. `(caption: string) => void` |

> **Note:** If you are using `<SmartNextImage>`, you must also provide standard required Next.js image props such as `width` and `height` (unless using `fill`).
---
## Security & Backend Integration

This package requires a backend to process the images through an AI model (like ViT-GPT2). <br/>
We provide a ready-to-use FastAPI reference server in [this repository.](https://github.com/kong33/SmartImage)<br/>

Depending on your architecture, choose one of the following integration methods:<br/>
---
### Option A: Deploying our Standalone AI Microservice
If you are deploying our Python FastAPI example server directly:<br/>
For security reasons, all cross-origin requests are blocked by default. <br/>
You MUST set the ALLOWED_ORIGINS environment variable in your server's .env file<br/>
to allow your frontend to communicate with it. <br/>

```python
# For production

# .env file on your Python server
ALLOWED_ORIGINS=https://your-frontend-domain.com,https://your-frontend-domain2.com
```
```python
# For local development

# .env file on your Python server
ALLOWED_ORIGINS=http://localhost:3000
```
> **Note:** Change the port if you are using Vite 5173 or another local server You can allow multiple environments simultaneously by separating them with a comma (no spaces).


### Option B: Integrating into Your Existing Backend (Recommended)
If you already have a backend (Node.js, Spring, Django, etc.), <br/>
simply copy the AI inference logic from our Python example. <br/>
You can safely ignore our CORS middleware settings and rely on your existing server's security configurations.

