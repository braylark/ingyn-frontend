import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import {
  Loader2,
  RefreshCw,
  Send,
  Grid3X3,
  List,
  Sparkles,
} from "lucide-react";

const AVATAR_STORAGE_KEY = "ingyn_selected_avatar";

type ViewMode = "grid" | "list";

interface SelectedAvatar {
  name: string;
  characterId: string;
}

interface GeneratedPost {
  id: string;
  prompt: string;
  imageUrl?: string;
  caption: string;
  createdAt: string;
  status: "success" | "error";
  errorMessage?: string;
}

const getApiBaseUrl = () => {
  const raw = import.meta.env.VITE_API_BASE_URL || "";
  return raw.replace(/\/+$/, "");
};

export default function ContentCreationHub() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [posts, setPosts] = useState<GeneratedPost[]>([]);
  const [avatar, setAvatar] = useState<SelectedAvatar | null>(null);

  // Load selected avatar from CreateAmbassador setup
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const stored = window.localStorage.getItem(AVATAR_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as SelectedAvatar;
          if (parsed?.characterId) {
            setAvatar(parsed);
          }
        }
      }
    } catch (err) {
      console.error("Failed to read stored avatar:", err);
    }
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);

    const baseUrl = getApiBaseUrl();
    const url = `${baseUrl}/generate-image`;

    const requestBody: Record<string, unknown> = {
      prompt: prompt.trim(),
    };

    if (avatar?.characterId) {
      requestBody.characterId = avatar.characterId;
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const data = await response.json();

      const imageUrl =
        data.imageUrl || data.image_url || data.image || undefined;
      const caption =
        data.caption ||
        data.text ||
        "No caption was returned, but your image was generated.";

      const newPost: GeneratedPost = {
        id: crypto.randomUUID(),
        prompt: prompt.trim(),
        imageUrl,
        caption,
        createdAt: new Date().toISOString(),
        status: imageUrl ? "success" : "error",
        errorMessage: imageUrl ? undefined : "Missing image URL in response.",
      };

      setPosts((prev) => [newPost, ...prev]);
    } catch (error: any) {
      console.error("Error generating post:", error);

      const newPost: GeneratedPost = {
        id: crypto.randomUUID(),
        prompt: prompt.trim(),
        imageUrl: undefined,
        caption: "",
        createdAt: new Date().toISOString(),
        status: "error",
        errorMessage:
          "We couldn't generate this post. Try again or adjust your prompt.",
      };

      setPosts((prev) => [newPost, ...prev]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRetry = (post: GeneratedPost) => {
    setPrompt(post.prompt);
    // user can tweak text then click generate again
  };

  return (
    <div className="min-h-screen bg-[#F5F6FA]">
      <main className="max-w-6xl mx-auto px-4 pt-6 pb-10 space-y-5 md:space-y-6">
        {/* Top banner / prompt card */}
        <Card className="border-0 rounded-2xl p-4 md:p-5 space-y-4 md:space-y-5">
          <div className="flex flex-col md:flex-row md:items-start gap-3 md:gap-4 justify-between">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2">
                <Badge className="bg-[#6464B4]/10 text-[#6464B4] border-0 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Higgsfield Studio
                </Badge>
                {avatar?.name && (
                  <Badge className="bg-[#F3F4FF] text-[#4B4BB3] border-0 text-[11px]">
                    Using {avatar.name}
                  </Badge>
                )}
              </div>
              <h2 className="text-lg md:text-xl font-semibold text-[#111827]">
                Generate a Higgsfield visual + caption
              </h2>
              <p className="text-sm text-[#6B7280]">
                Describe the post you want. We&apos;ll generate an on-brand
                image and caption using your current ambassador.
              </p>
              {avatar?.name && (
                <p className="text-[11px] text-[#9CA3AF]">
                  Tip: Mention <span className="font-medium">{avatar.name}</span>{" "}
                  in your prompt for sharper consistency.
                </p>
              )}
            </div>

            {/* Small hint block on the right for desktop */}
            <div className="hidden md:flex flex-col items-end gap-1 text-right">
              <p className="text-xs text-[#6B7280]">
                Each post gets an estimated reach band.
              </p>
              <p className="text-xs text-[#6B7280]">
                We suggest a posting window, not a strict schedule.
              </p>
            </div>
          </div>

          {/* Prompt + button */}
          <div className="space-y-3">
            {/* Fake tabs header – Custom prompt / Templates */}
            <div className="inline-flex rounded-full bg-[#F3F4F6] p-1 text-xs">
              <button className="px-3 py-1 rounded-full bg-white shadow-sm text-[#111827] font-medium">
                Custom prompt
              </button>
              <button className="px-3 py-1 rounded-full text-[#6B7280]">
                Templates
              </button>
            </div>

            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., Lyra modeling neon streetwear sneakers in a moody night-time city scene..."
              className="min-h-[110px] md:min-h-[130px] rounded-2xl text-sm"
            />

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 justify-between">
              <div className="text-xs text-[#6B7280]">
                <span className="hidden sm:inline">
                  Every post gets an estimated reach band.{" "}
                </span>
                <span>We suggest a posting window, not a hard schedule.</span>
              </div>
              <Button
                className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-2 text-sm bg-[#111827] hover:bg-black w-full sm:w-auto"
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating…
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate with Higgsfield
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* Secondary controls (view mode / filters) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <p className="text-sm font-medium text-[#111827]">Generated posts</p>
            <div className="inline-flex items-center gap-1 rounded-full bg-white border border-gray-200 p-1">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs ${
                  viewMode === "grid"
                    ? "bg-[#111827] text-white"
                    : "text-[#6B7280]"
                }`}
              >
                <Grid3X3 className="w-3 h-3" />
                Grid
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs ${
                  viewMode === "list"
                    ? "bg-[#111827] text-white"
                    : "text-[#6B7280]"
                }`}
              >
                <List className="w-3 h-3" />
                List
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-[#6B7280]">
            <span className="hidden sm:inline">Showing</span>
            <select className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs">
              <option>Last 30 days</option>
              <option>Last 7 days</option>
              <option>All time</option>
            </select>
          </div>
        </div>

        {/* Generated posts */}
        {posts.length === 0 ? (
          <div className="border border-dashed border-gray-300 rounded-2xl bg-white/70 p-8 text-center text-sm text-[#6B7280]">
            No posts yet. Start by describing a post above — we&apos;ll generate
            a visual and caption with your ambassador&apos;s style.
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid gap-4 md:gap-5 md:grid-cols-2"
                : "space-y-4 md:space-y-5"
            }
          >
            {posts.map((post) => (
              <Card
                key={post.id}
                className="border-0 rounded-2xl overflow-hidden flex flex-col bg-white"
              >
                {/* Image area */}
                <div className="relative bg-[#F3F4F6]">
                  {post.status === "success" && post.imageUrl ? (
                    <ImageWithFallback
                      src={post.imageUrl}
                      alt={post.prompt}
                      className="w-full object-cover max-h-72 md:max-h-80"
                    />
                  ) : (
                    <div className="h-40 md:h-48 flex flex-col items-center justify-center text-sm text-[#6B7280] gap-2">
                      <p className="font-medium">
                        Something went wrong generating this post.
                      </p>
                      <p className="text-xs text-[#9CA3AF]">
                        Try again or adjust your prompt.
                      </p>
                    </div>
                  )}
                </div>

                {/* Content area */}
                <div className="p-4 md:p-5 flex flex-col gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-[#9CA3AF] mb-1">
                      Higgsfield Visual + Caption
                    </p>
                    {post.status === "success" && post.caption ? (
                      <p className="text-sm text-[#111827] leading-relaxed">
                        {post.caption}
                      </p>
                    ) : (
                      <p className="text-sm text-[#6B7280]">
                        {post.errorMessage ??
                          "We couldn't generate this post. Try again or adjust your prompt."}
                      </p>
                    )}
                  </div>

                  <div className="text-[11px] text-[#9CA3AF]">
                    Prompt: <span className="italic">{post.prompt}</span>
                  </div>

                  {/* Footer actions */}
                  <div className="pt-1 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-xs text-[#9CA3AF] cursor-not-allowed"
                    >
                      <span className="w-3 h-3 rounded-full border border-[#D1D5DB]" />
                      Save to Planner
                    </button>
                    <div className="flex items-center gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full h-8 w-8"
                        onClick={() => handleRetry(post)}
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </Button>
                      <Button className="rounded-full h-8 px-3 text-xs inline-flex items-center gap-1">
                        <Send className="w-3.5 h-3.5" />
                        Export
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
