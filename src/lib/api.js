// src/lib/api.js
const API_BASE = import.meta.env.VITE_API_BASE;
// If you later set Vercel env var, it will be used; otherwise "default-character"
const DEFAULT_CHARACTER_ID = import.meta.env.VITE_DEFAULT_CHARACTER_ID || "default-character";

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

// ---- Image generation: prompt + forced default characterId ----
export async function generateImage(prompt, extra = {}) {
  const payload = {
    prompt,
    aspect_ratio: extra.aspect_ratio ?? "1:1",
    count: extra.count ?? 1,
    characterId: extra.characterId ?? DEFAULT_CHARACTER_ID, // ← required by backend
    ...(extra.style ? { style: extra.style } : {}),
  };
  return postJSON("/api/v1/generate-image", payload);
}

// ---- Caption generation: prompt + (optional) characterId ----
export async function generateText(prompt, extra = {}) {
  const payload = {
    prompt,
    ...(extra.characterId ? { characterId: extra.characterId } : {}),
  };
  return postJSON("/api/v1/generate-text", payload);
}
