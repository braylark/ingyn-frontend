import React, { useState } from "react";
import { generateImage, generateText } from "../lib/api";

/* ---------- Tiny inline banner (no external deps) ---------- */
type Banner = { type: "success" | "error" | "info" | "loading"; msg: string } | null;

function BannerBar({ banner, onClose }: { banner: Banner; onClose: () => void }) {
  if (!banner) return null;
  const colors =
    banner.type === "success"
      ? "bg-emerald-600"
      : banner.type === "error"
      ? "bg-rose-600"
      : banner.type === "loading"
      ? "bg-slate-600"
      : "bg-blue-600";
  return (
    <div className={`${colors} text-white text-sm px-3 py-2 rounded-md mb-3 flex items-center justify-between`}>
      <span>{banner.msg}</span>
      <button className="text-white/80 hover:text-white" onClick={onClose}>
        ×
      </button>
    </div>
  );
}

/* ---------- Helpers to normalize backend responses ---------- */
function extractImageSrc(resp: any): string | null {
  if (!resp) return null;
  if (typeof resp.image === "string") return resp.image;
  if (typeof resp.image_url === "string") return resp.image_url;

  if (Array.isArray(resp.images) && resp.images[0]) return resp.images[0];
  if (Array.isArray(resp.image_urls) && resp.image_urls[0]) return resp.image_urls[0];
  if (Array.isArray(resp.urls) && resp.urls[0]) return resp.urls[0];

  if (resp.result?.image) return resp.result.image;
  if (resp.result?.image_url) return resp.result.image_url;
  if (Array.isArray(resp.result?.images) && resp.result.images[0]) return resp.result.images[0];
  if (Array.isArray(resp.result?.urls) && resp.result.urls[0]) return resp.result.urls[0];
  if (resp.data?.image_url) return resp.data.image_url;

  const base64 =
    resp.image_base64 || resp.base64 || resp.result?.image_base64 || resp.data?.image_base64;
  if (typeof base64 === "string" && base64.length > 100) {
    const mime = base64.trim().startsWith("/") ? "image/jpeg" : "image/png";
    return `data:${mime};base64,${base64}`;
  }
  return null;
}

function normalizeCaption(resp: any, fallback: string): string {
  return resp?.text || resp?.caption || resp?.result?.text || resp?.result?.caption || `✨ ${fallback}`;
}

/* ---------- Main Component ---------- */
const ContentCreationHub: React.FC = () => {
  const [customPrompt, setCustomPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [banner, setBanner] = useState<Banner>(null);

  const [myPosts, setMyPosts] = useState<any[]>([]);
  const [nextId, setNextId] = useState(1);
  const [activeTab, setActiveTab] = useState<"create" | "my-posts">("create");

  const notify = (b: Banner) => setBanner(b);
  const clearBanner = () => setBanner(null);

  const handleGenerateCustomPost = async () => {
    if (!customPrompt.trim()) {
      notify({ type: "error", msg: "Please enter a prompt to generate content" });
      return;
    }

    setGenerating(true);
    notify({ type: "loading", msg: "Generating image…" });

    try {
      // 1) Image generation
      const imgRes: any = await generateImage(customPrompt);
      // console.log("generate-image response:", imgRes);
      const imageSrc = extractImageSrc(imgRes);
      if (!imageSrc) {
        const preview = JSON.stringify(imgRes)?.slice(0, 200);
        throw new Error(`No image found in response. Preview: ${preview}`);
      }

      // 2) Caption generation (best effort)
      let caption = "";
      try {
        const txtRes: any = await generateText(
          `Write an engaging, brand-safe caption (<=150 words) for the following image prompt: ${customPrompt}`
        );
        // console.log("generate-text response:", txtRes);
        caption = normalizeCaption(txtRes, customPrompt);
      } catch {
        caption = `✨ ${customPrompt}`;
      }

      // 3) Build post card
      const newPost = {
        id: nextId,
        image: imageSrc,
        caption,
        hashtags: ["#Custom", "#AIGenerated", "#YourBrand", "#ContentCreation"],
        predictedReach: `${(Math.random() * 3 + 1).toFixed(1)}K`,
        bestTime: `${Math.floor(Math.random() * 12 + 1)}:00 ${Math.random() > 0.5 ? "AM" : "PM"}`,
      };

      setMyPosts((prev) => [newPost, ...prev]);
      setNextId((n) => n + 1);
      setCustomPrompt("");
      setActiveTab("my-posts");

      notify({ type: "success", msg: "Custom post generated! Check 'My Posts'." });
    } catch (e: any) {
      console.error(e);
      notify({ type: "error", msg: e?.message || "Generation failed" });
    } finally {
      setGenerating(false);
      setTimeout(clearBanner, 3500);
    }
  };

  return (
    <div className="content-hub p-4">
      <h1 className="text-2xl font-bold mb-4">Content Creation Hub</h1>

      <BannerBar banner={banner} onClose={clearBanner} />

      {/* Create Tab */}
      {activeTab === "create" && (
        <div className="create-tab mb-6">
          <label className="block text-sm mb-2 font-medium">Generate Custom Content</label>
          <div className="flex gap-2 mb-3">
            <input
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Enter a description or idea for your post"
              className="flex-1 border rounded-lg px-3 py-2"
              disabled={generating}
            />
            <button
              onClick={handleGenerateCustomPost}
              disabled={generating}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              {generating ? "Generating..." : "Generate"}
            </button>
          </div>
        </div>
      )}

      {/* My Posts Tab */}
      {activeTab === "my-posts" && (
        <div className="my-posts">
          <h2 className="text-lg font-semibold mb-3">My Posts</h2>
          {myPosts.length === 0 ? (
            <p className="text-gray-500">No posts yet. Try generating one!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myPosts.map((post) => (
                <div key={post.id} className="border rounded-lg shadow-sm p-3 bg-white">
                  <img src={post.image} alt="Generated Post" className="rounded-lg mb-2 w-full h-48 object-cover" />
                  <p className="text-sm mb-1">{post.caption}</p>
                  <div className="text-xs text-gray-400 mb-2">{post.hashtags.join(" ")}</div>
                  <div className="text-xs text-gray-500">
                    Reach: {post.predictedReach} • Best Time: {post.bestTime}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Footer Tabs */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={() => setActiveTab("create")}
          className={`px-3 py-2 rounded-lg ${activeTab === "create" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}`}
        >
          Create
        </button>
        <button
          onClick={() => setActiveTab("my-posts")}
          className={`px-3 py-2 rounded-lg ${activeTab === "my-posts" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}`}
        >
          My Posts
        </button>
      </div>
    </div>
  );
};

export default ContentCreationHub;
