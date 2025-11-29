import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { MoreHorizontal, RefreshCw, Send, Sparkles } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const AVATAR_STORAGE_KEY = "ingyn_selected_avatar";

type GeneratedPostStatus = "idle" | "generating" | "success" | "failed";

interface GeneratedPost {
  id: string;
  prompt: string;
  imageUrl?: string;
  caption?: string;
  status: GeneratedPostStatus;
  createdAt: string;
}

export default function ContentCreationHub() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [posts, setPosts] = useState<GeneratedPost[]>([]);

  const [currentCharacterName, setCurrentCharacterName] = useState<
    string | null
  >(null);

  // Read selected ambassador from localStorage
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const stored = window.localStorage.getItem(AVATAR_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as {
            name?: string;
            characterId?: string;
          };
          if (parsed?.name) {
            setCurrentCharacterName(parsed.name);
          }
        }
      }
    } catch (err) {
      console.error("Error reading avatar from localStorage:", err);
    }
  }, []);

  const getSelectedCharacterId = (): string | undefined => {
    try {
      if (typeof window === "undefined") return undefined;
      const stored = window.localStorage.getItem(AVATAR_STORAGE_KEY);
      if (!stored) return undefined;
      const parsed = JSON.parse(stored) as {
        characterId?: string;
      };
      return parsed.characterId;
    } catch (err) {
      console.error("Failed to parse stored avatar:", err);
      return undefined;
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setError(null);
    setIsGenerating(true);

    const characterId = getSelectedCharacterId();
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "";
    const apiUrl = `${baseUrl.replace(/\/$/, "")}/generate-image`;

    const newPost: GeneratedPost = {
      id: `${Date.now()}`,
      prompt: prompt.trim(),
      status: "generating",
      createdAt: new Date().toISOString(),
    };

    setPosts((prev) => [newPost, ...prev]);

    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          characterId,
        }),
      });

      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }

      const data = await res.json();

      setPosts((prev) =>
        prev.map((post) =>
          post.id === newPost.id
            ? {
                ...post,
                status: "success",
                imageUrl: data.imageUrl ?? data.image_url,
                caption: data.caption ?? data.text ?? "",
              }
            : post,
        ),
      );
    } catch (err: any) {
      console.error("Error generating image:", err);
      setError("We couldn’t generate this post. Try again or tweak your prompt.");

      setPosts((prev) =>
        prev.map((post) =>
          post.id === newPost.id
            ? {
                ...post,
                status: "failed",
              }
            : post,
        ),
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRetry = (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    setPrompt(post.prompt);
    void handleGenerate();
  };

  const hasPosts = posts.length > 0;

  return (
    <div className="min-h-screen bg-[#F5F6FA]">
      <main className="max-w-6xl mx-auto px-4 py-6 md:py-8 space-y-6">
        {/* Header / Prompt area */}
        <Card className="bg-white border-0 rounded-2xl p-4 md:p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2">
                <Badge className="bg-[#E5ECFF] text-[#3B4AB8] border-0 text-[11px]">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Higgsfield Visual + Caption
                </Badge>
                {currentCharacterName && (
                  <span className="text-[11px] text-[#6B7280]">
                    Using ambassador: <strong>{currentCharacterName}</strong>
                  </span>
                )}
              </div>
              <h1 className="text-lg md:text-xl font-semibold text-[#111827]">
                Generate scroll-stopping posts in one click
              </h1>
              <p className="text-xs md:text-sm text-[#6B7280] max-w-xl">
                Describe the scene or idea. We’ll create an on-brand Higgsfield
                visual and caption tailored to your ambassador.
              </p>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-[#9CA3AF]">
              <span>Auto-estimates reach</span>
            </div>
          </div>

          {/* Prompt area */}
          <div className="space-y-3">
            <Tabs defaultValue="custom">
              <TabsList className="bg-[#F3F4FF] rounded-full p-1 inline-flex">
                <TabsTrigger
                  value="custom"
                  className="rounded-full px-3 py-1 text-xs"
                >
                  Custom prompt
                </TabsTrigger>
                <TabsTrigger
                  value="templates"
                  className="rounded-full px-3 py-1 text-xs"
                  disabled
                >
                  Templates (coming soon)
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <Textarea
              placeholder="e.g., Lyra modeling neon streetwear headphones in a studio, bold cinematic lighting..."
              className="min-h-[110px] rounded-2xl text-sm"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-[11px] text-[#6B7280]">
              <div className="flex flex-col gap-1">
                <span>
                  ✨ Mention <strong>Lyra</strong> or <strong>Mello</strong> in your
                  prompt for sharper, character-aware results.
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-1 h-1 rounded-full bg-[#9CA3AF]" />
                  Uses your current ambassador training data.
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="hidden md:inline text-[#9CA3AF]">
                  We suggest a posting window, not a hard schedule.
                </span>
                <Button
                  className="rounded-full px-4 py-2 text-sm bg-[#111827] hover:bg-black flex items-center gap-2"
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Generating...
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

            {error && (
              <p className="text-xs text-red-500 mt-1">
                {error} If it keeps happening, try simplifying your prompt.
              </p>
            )}
          </div>
        </Card>

        {/* Generated posts / Insights */}
        <Card className="bg-white border-0 rounded-2xl p-4 md:p-6 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-semibold text-[#111827]">
                Generated posts
              </h2>
              <TabsList className="bg-[#F3F4FF] rounded-full p-1 h-8">
                <TabsTrigger
                  value="grid"
                  className={`rounded-full px-3 py-1 text-xs ${
                    viewMode === "grid" ? "bg-white shadow-sm" : ""
                  }`}
                  onClick={() => setViewMode("grid")}
                >
                  Grid
                </TabsTrigger>
                <TabsTrigger
                  value="list"
                  className={`rounded-full px-3 py-1 text-xs ${
                    viewMode === "list" ? "bg-white shadow-sm" : ""
                  }`}
                  onClick={() => setViewMode("list")}
                >
                  List
                </TabsTrigger>
              </TabsList>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem disabled>Filter by reach (soon)</DropdownMenuItem>
                <DropdownMenuItem disabled>Export report (soon)</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {!hasPosts && (
            <div className="border border-dashed border-gray-200 rounded-2xl py-10 flex flex-col items-center justify-center gap-2">
              <Sparkles className="w-6 h-6 text-[#9CA3AF]" />
              <p className="text-sm font-medium text-[#111827]">
                No posts generated yet
              </p>
              <p className="text-xs text-[#6B7280] max-w-sm text-center">
                Start with a short, punchy prompt like &quot;Lyra unboxing our new
                sneakers in a cozy studio&quot; and we&apos;ll handle the visual and
                caption.
              </p>
            </div>
          )}

          {hasPosts && (
            <div
              className={
                viewMode === "grid"
                  ? "grid gap-4 md:gap-5 md:grid-cols-2"
                  : "space-y-4"
              }
            >
              {posts.map((post) => {
                const isLoading = post.status === "generating";
                const isFailed = post.status === "failed";

                return (
                  <Card
                    key={post.id}
                    className="border border-gray-100 rounded-2xl p-3 md:p-4 flex flex-col gap-3"
                  >
                    {/* Image / placeholder */}
                    <div className="relative rounded-xl bg-[#F9FAFB] overflow-hidden min-h-[180px] max-h-[260px] flex items-center justify-center">
                      {post.status === "success" && post.imageUrl ? (
                        <img
                          src={post.imageUrl}
                          alt={post.caption || post.prompt}
                          className="w-full h-full object-cover"
                        />
                      ) : isLoading ? (
                        <div className="flex flex-col items-center gap-2 text-xs text-[#6B7280]">
                          <RefreshCw className="w-5 h-5 animate-spin text-[#6464B4]" />
                          <span>Crafting your Higgsfield visual…</span>
                        </div>
                      ) : isFailed ? (
                        <div className="flex flex-col items-center gap-1 text-xs text-[#6B7280]">
                          <span className="font-medium text-[#111827]">
                            Something went wrong generating this post.
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-1 rounded-full h-7 px-3 text-xs"
                            onClick={() => handleRetry(post.id)}
                          >
                            <RefreshCw className="w-3 h-3 mr-1" />
                            Try again
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1 text-xs text-[#6B7280]">
                          <span>Ready when you are.</span>
                        </div>
                      )}
                    </div>

                    {/* Caption + actions */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-[#4F46E5]">
                            Higgsfield Visual + Caption
                          </span>
                          <span className="text-[11px] text-[#9CA3AF]">
                            {new Date(post.createdAt).toLocaleString()}
                          </span>
                        </div>
                        {post.status === "success" && (
                          <Badge className="bg-[#ECFDF5] text-[#166534] border-0 text-[10px]">
                            Ready to export
                          </Badge>
                        )}
                        {post.status === "generating" && (
                          <Badge className="bg-[#EFF6FF] text-[#1D4ED8] border-0 text-[10px]">
                            Generating…
                          </Badge>
                        )}
                        {post.status === "failed" && (
                          <Badge className="bg-[#FEF2F2] text-[#B91C1C] border-0 text-[10px]">
                            Generation failed
                          </Badge>
                        )}
                      </div>

                      {post.caption ? (
                        <p className="text-sm text-[#111827] whitespace-pre-line">
                          {post.caption}
                        </p>
                      ) : (
                        <p className="text-xs text-[#6B7280]">
                          {post.status === "generating"
                            ? "We’re writing your caption..."
                            : "Caption will appear here once generated."}
                        </p>
                      )}

                      <div className="pt-2 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 text-[11px] text-[#9CA3AF]">
                          <span>♡ Save to Planner</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 rounded-full text-xs px-3"
                            onClick={() => handleRetry(post.id)}
                            disabled={isLoading}
                          >
                            <RefreshCw className="w-3 h-3 mr-1" />
                            Regenerate
                          </Button>
                          <Button
                            size="sm"
                            className="h-8 rounded-full text-xs px-3 bg-[#111827] hover:bg-black flex items-center gap-1.5"
                          >
                            <Send className="w-3 h-3" />
                            Export
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
