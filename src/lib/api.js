const API_BASE = import.meta.env.VITE_API_BASE;

async function post(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
  }
  return res.json();
}

export async function generateImage(prompt, extra = {}) {
  return post("/api/v1/generate-image", { prompt, ...extra });
}

export async function generateText(prompt, extra = {}) {
  return post("/api/v1/generate-text", { prompt, ...extra });
}

export async function createCharacter(character) {
  return post("/api/v1/create-character", character);
}

export async function createVideo(videoPrompt) {
  return post("/api/v1/create-video", videoPrompt);
}
