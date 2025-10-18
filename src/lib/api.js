// src/lib/api.js
const API_BASE = import.meta.env.VITE_API_BASE;

async function postJSON(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json();
}

/** Prompt-only image generation */
export async function generateImage(prompt, extra = {}) {
  // NOTE: prompt-only payload; no characterId sent
  const payload = { prompt, ...extra };
  return postJSON("/api/v1/generate-image", payload);
}

/** Optional caption/text generation (also prompt-only) */
export async function generateText(prompt) {
  return postJSON("/api/v1/generate-text", { prompt });
}
