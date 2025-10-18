import { useEffect, useRef, useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Sparkles,
  TrendingUp,
  Calendar,
  Send,
  Heart,
  LayoutGrid,
  List,
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import TrainAmbassadorDialog from "./TrainAmbassadorDialog";
import AccountCreationDialog from "./AccountCreationDialog";
import PaymentDialog from "./PaymentDialog";

/* ──────────────────────────────────────────────────────────────────────────
   Minimal Skeleton with Shimmer (no extra deps)
   ────────────────────────────────────────────────────────────────────────── */
function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden bg-gray-200/80 rounded-lg ${className}`}
      aria-busy="true"
      aria-live="polite"
      role="status"
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent" />
      <style>{`@keyframes shimmer { 100% { transform: translateX(100%); } }`}</style>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Types & Helpers
   ────────────────────────────────────────────────────────────────────────── */
type PostStatus = "processing" | "ready" | "failed";

interface PostItem {
  id: number;
  image: string;
  caption: string;
  status: PostStatus;
  hashtags: string[];
  predictedReach: string;
  bestTime: string;
}

interface ContentCreationHubProps {
  hasAccount: boolean;
  onAccountCreated: () => void;
}

/** Try to verify an image URL is actually loadable by <img>. */
function testImageLoad(url: string, timeoutMs = 10000): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("timeout"));
    }, timeoutMs);
    function cleanup() {
      clearTimeout(timer);
      img.onload = null;
      img.onerror = null;
    }
    img.onload = () => {
      cleanup();
      resolve();
    };
    img.onerror = () => {
      cleanup();
      reject(new Error("img error"));
    };
    img.crossOrigin = "anonymous";
    img.referrerPolicy = "no-referrer";
    img.src = url;
  });
}

/** Poll until an image URL becomes loadable (if backend posts a URL before file exists). */
async function waitForImageReady(url: string, maxWaitMs = 60000, intervalMs = 2000) {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    try {
      await testImageLoad(url, 7000);
      return;
    } catch {
      await new Promise((r) => setTimeout(r, intervalMs));
    }
  }
  throw new Error("image not ready after wait");
}

/* ──────────────────────────────────────────────────────────────────────────
   Component
   ────────────────────────────────────────────────────────────────────────── */
export default function ContentCreationHub({
  hasAccount,
  onAccountCreated,
}: ContentCreationHubProps) {
  const [customPrompt, setCustomPrompt] = useState("");
  const [generating, setGenerating] = useState(false);

  const [myPosts, setMyPosts] = useState<PostItem[]>([]);
  const [nextId, setNextId] = useState(100);
  const [activeTab, setActiveTab] = useState("my-posts");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [showTrainDialog, setShowTrainDialog] = useState(false);
  const [showAccountDialog, setShowAccountDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  const [pendingAction, setPendingAction] = useState<"schedule" | "post" | null>(null);
  const [pendingPostId, setPendingPostId] = useState<number | null>(null);

  const promptRef = useRef<HTMLTextAreaElement | null>(null);

  /* ── TEMP PLACEHOLDER (for demo while backend is being wired) ──────────── */
  // This proves the full UI loop with a real image. Replace when your backend
  // returns a valid, publicly loadable URL.
  const imageSrc = "https://picsum.photos/600/600"; // temporary image placeholder

  /* ────────────────────────────────────────────────────────────────────────
     Generate: optimistic post + skeleton → swap to image when ready
     ──────────────────────────────────────────────────────────────────────── */
  const handleGenerateCustomPost = async () => {
    if (!customPrompt.trim()) {
      // Keep it simple: highlight the input
      promptRef.current?.focus();
      return;
    }

    setGenerating(true);

    // 1) Create an optimistic "processing" post immediately (renders skeleton)
    const optimisticId = nextId;
    const optimisticPost: PostItem = {
      id: optimisticId,
      image: "", // no image yet
      caption: "Generating…",
      status: "processing",
      hashtags: ["#Generating"],
      predictedReach: "—",
      bestTime: "—",
    };

    setMyPosts((prev) => [optimisticPost, ...prev]);
    setNextId((n) => n + 1);
    setActiveTab("my-posts");

    try {
      // ── TODO (LATER): Call your backend here to generate image from the prompt ─────────
      // const imgRes = await generateImage(customPrompt, { aspect_ratio: "1:1", count: 1 });
      // const finalUrl = extractImageSrc(imgRes);
      // if (!finalUrl) throw new Error("No image returned");
      // await waitForImageReady(finalUrl, 60000, 2000);

      // For now we simulate the same experience using a public placeholder image.
      const finalUrl = imageSrc;
      try {
        await waitForImageReady(finalUrl, 15000, 1500);
      } catch {
        // If a public placeholder ever fails (unlikely), keep processing and retry in bg
      }

      // ── TODO (LATER): Optional caption generation via backend ─────────────
      // const txtRes = await generateText(`Write a caption for: ${customPrompt}`);
      // const caption = normalizeCaption(txtRes, customPrompt);
      const caption = `✨ ${customPrompt}`;

      // 2) Update the optimistic post with real data
      let status: PostStatus = "ready";
      setMyPosts((prev) =>
        prev.map((p) =>
          p.id === optimisticId ? { ...p, image: finalUrl, caption, status } : p
        )
      );

      // 3) If we ever left it "processing", retry in background and flip to ready
      if (status === "processing") {
        (async () => {
          try {
            await waitForImageReady(finalUrl, 60000, 2000);
            setMyPosts((prev) =>
              prev.map((p) =>
                p.id === optimisticId ? { ...p, status: "ready" } : p
              )
            );
          } catch {
            setMyPosts((prev) =>
              prev.map((p) =>
                p.id === optimisticId ? { ...p, status: "failed" } : p
              )
            );
          }
        })();
      }

      setCustomPrompt("");
    } catch (e) {
      // If generation failed outright, mark as failed
      setMyPosts((prev) =>
        prev.map((p) =>
          p.id === optimisticId
            ? { ...p, status: "failed", caption: "Generation failed" }
            : p
        )
      );
    } finally {
      setGenerating(false);
    }
  };

  /* ────────────────────────────────────────────────────────────────────────
     Post actions (Schedule / Post Now)
     ──────────────────────────────────────────────────────────────────────── */
  const handleScheduleClick = (postId: number) => {
    if (!hasAccount) {
      setPendingAction("schedule");
      setPendingPostId(postId);
      setShowAccountDialog(true);
    } else {
      // later: call your scheduler; for demo we just no-op
    }
  };

  const handlePostNowClick = (postId: number) => {
    if (!hasAccount) {
      setPendingAction("post");
      setPendingPostId(postId);
      setShowAccountDialog(true);
    } else {
      // later: call social posting; for demo we just no-op
    }
  };

  const handleAccountCreationComplete = () => {
    setShowAccountDialog(false);
    setShowPaymentDialog(true);
  };

  const handlePaymentComplete = () => {
    setShowPaymentDialog(false);
    onAccountCreated();
    setPendingAction(null);
    setPendingPostId(null);
  };

  /* ────────────────────────────────────────────────────────────────────────
     Render
     ──────────────────────────────────────────────────────────────────────── */
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1">
          <h1 className="text-3xl text-[#1E1E1E] mb-2">Create Content</h1>
          <p className="text-gray-600">
            AI-powered content suggestions tailored to your audience
          </p>
        </div>
      </div>

      {/* Prompt-only input */}
      <Card className="p-6 bg-white border-0 rounded-2xl">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-[#6464B4]" />
            <h3 className="text-[#1E1E1E]">Generate Custom Content</h3>
          </div>
          <Textarea
            ref={promptRef}
            placeholder="Describe the post you want to create..."
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            className="rounded-xl border-gray-200 min-h-[80px]"
          />
          <Button
            onClick={handleGenerateCustomPost}
            disabled={generating}
            className="bg-[rgb(100,100,180)] hover:bg-[#6464B4] text-white rounded-xl px-6 disabled:opacity-60"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {generating ? "Generating…" : "Generate"}
          </Button>
        </div>
      </Card>

      {/* Posts */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <TabsList className="bg-gray-100 border border-gray-200">
            <TabsTrigger
              value="my-posts"
              className="data-[state=active]:bg-[#6464B4] data-[state=active]:text-white text-gray-600"
            >
              My Posts {myPosts.length > 0 && `(${myPosts.length})`}
            </TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2 bg-gray-100 border border-gray-200 rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("grid")}
              className={`rounded-md ${
                viewMode === "grid"
                  ? "bg-[#6464B4] text-white hover:bg-[#6464B4]"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("list")}
              className={`rounded-md ${
                viewMode === "list"
                  ? "bg-[#6464B4] text-white hover:bg-[#6464B4]"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <TabsContent value="my-posts" className="mt-4">
          {myPosts.length === 0 ? (
            <Card className="p-12 bg-white border border-gray-200 rounded-2xl text-center">
              <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl text-[#1E1E1E] mb-2">No posts yet</h3>
              <p className="text-gray-600 mb-6">
                Generate custom content using the AI prompt above.
              </p>
            </Card>
          ) : (
            <div
              className={
                viewMode === "grid" ? "grid lg:grid-cols-3 gap-6" : "space-y-4"
              }
            >
              {myPosts.map((post) => (
                <Card
                  key={post.id}
                  className="bg-white border-0 rounded-2xl overflow-hidden"
                >
                  {/* Image area with skeleton/failed/ready states */}
                  <div className="w-full aspect-square relative">
                    {post.status !== "ready" ? (
                      <div className="w-full h-full">
                        <Skeleton className="w-full h-full" />
                        <div className="absolute inset-0 flex items-end justify-between p-3">
                          <span className="text-white/90 text-xs bg-black/50 rounded px-2 py-1">
                            {post.status === "processing"
                              ? "Generating…"
                              : "Failed"}
                          </span>
                          {post.status === "failed" && (
                            <button
                              className="text-white/90 text-xs bg-black/50 rounded px-2 py-1"
                              onClick={() => {
                                // simple retry UX: push the caption back into the prompt box
                                const seed =
                                  post.caption?.replace(/^✨\s?/, "") || "";
                                setCustomPrompt(seed);
                                document
                                  .querySelector("textarea")
                                  ?.scrollIntoView({ behavior: "smooth" });
                                promptRef.current?.focus();
                              }}
                            >
                              Retry
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <ImageWithFallback
                        src={post.image}
                        alt={`Post ${post.id}`}
                        className="w-full h-full object-cover"
                        crossOrigin="anonymous"
                        referrerPolicy="no-referrer"
                      />
                    )}

                    {/* Overlay badges only when ready */}
                    {post.status === "ready" && (
                      <div className="absolute bottom-3 left-3 right-3 flex gap-2">
                        <div className="flex-1 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2">
                          <Heart className="w-4 h-4 text-white" />
                          <span className="text-white text-sm">
                            ~{post.predictedReach}
                          </span>
                        </div>
                        <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-[#00D1B2]" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Meta, caption, actions */}
                  <div className="p-4 space-y-4">
                    <p className="text-sm text-[#1E1E1E]">{post.caption}</p>
                    <div className="flex flex-wrap gap-2">
                      {post.hashtags.map((tag, idx) => (
                        <Badge
                          key={idx}
                          className="bg-gray-100 text-[#A1A1A1] hover:bg-gray-100 text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => handleScheduleClick(post.id)}
                        disabled={post.status !== "ready"}
                        className="flex-1 bg-[rgb(100,100,180)] hover:bg-[#6464B4] text-white rounded-xl disabled:opacity-60"
                        size="sm"
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Schedule
                      </Button>
                      <Button
                        onClick={() => handlePostNowClick(post.id)}
                        disabled={post.status !== "ready"}
                        variant="outline"
                        className="flex-1 border-gray-200 rounded-xl disabled:opacity-60"
                        size="sm"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Post Now
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialogs (unchanged) */}
      <TrainAmbassadorDialog
        isOpen={showTrainDialog}
        onClose={() => setShowTrainDialog(false)}
      />
      <AccountCreationDialog
        isOpen={showAccountDialog}
        onComplete={handleAccountCreationComplete}
      />
      <PaymentDialog
        isOpen={showPaymentDialog}
        onClose={() => {
          setShowPaymentDialog(false);
          setPendingAction(null);
          setPendingPostId(null);
        }}
        onComplete={handlePaymentComplete}
      />
    </div>
  );
}
