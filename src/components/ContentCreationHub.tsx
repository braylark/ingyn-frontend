import { useRef, useState } from "react";
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
  Loader2, // spinner icon
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import TrainAmbassadorDialog from "./TrainAmbassadorDialog";
import AccountCreationDialog from "./AccountCreationDialog";
import PaymentDialog from "./PaymentDialog";

/* ──────────────────────────────────────────────────────────────────────────
   CONSTANTS
   ────────────────────────────────────────────────────────────────────────── */

// reference character id for backend
const CHARACTER_ID = "8cc016ad-c9c7-460e-a1d3-f348f8f8ae46";

// keep "" if you're proxying /api on the same origin (Netlify -> Render)
const API_BASE = "";

/* ──────────────────────────────────────────────────────────────────────────
   Types
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

/* ──────────────────────────────────────────────────────────────────────────
   Skeleton + LoadingCard
   - We’re making a “visual loading state” with shimmer + spinner + overlay text
   ────────────────────────────────────────────────────────────────────────── */
function ShimmerBox({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden bg-gray-200/80 rounded-lg ${className}`}
      aria-busy="true"
      aria-live="polite"
      role="status"
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      <style>{`@keyframes shimmer { 100% { transform: translateX(100%); } }`}</style>
    </div>
  );
}

/**
 * This is the visual that shows while post.status === "processing"
 * - For grid view, it fills a square
 * - For list view, we’ll reuse a thumbnail version
 */
function GeneratingVisual({
  label = "Generating…",
  variant = "square", // "square" | "thumb"
}: {
  label?: string;
  variant?: "square" | "thumb";
}) {
  const baseClasses =
    variant === "thumb"
      ? "w-full h-full rounded-lg overflow-hidden bg-black/5 relative flex items-center justify-center"
      : "w-full h-full rounded-lg overflow-hidden bg-black/5 relative flex items-center justify-center";

  return (
    <div className={baseClasses}>
      <ShimmerBox className="absolute inset-0" />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-md px-2 py-1 text-xs font-medium">
          <Loader2 className="w-4 h-4 animate-spin text-white" />
          <span>{label}</span>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Backend calls
   ────────────────────────────────────────────────────────────────────────── */

// GET IMAGE URLS FROM BACKEND
async function generateImageFromBackend(prompt: string) {
  const body = {
    prompt,
    characterId: CHARACTER_ID,
  };

  const res = await fetch(`${API_BASE}/api/v1/generate-image`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`HTTP ${res.status}: ${msg}`);
  }

  return res.json();
}

// GET CAPTION/TEXT FROM BACKEND
async function generateCaptionFromBackend(topicPrompt: string) {
  const gptPrompt =
    `Write a brand-safe Instagram caption (<=120 words) with a friendly, confident tone. ` +
    `Include 3–6 relevant hashtags at the end.\n\nTopic: ${topicPrompt}`;

  const res = await fetch(`${API_BASE}/api/v1/generate-text`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: gptPrompt,
      characterId: CHARACTER_ID,
    }),
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`HTTP ${res.status}: ${msg}`);
  }

  const data = await res.json();
  return typeof data === "string" ? data : "";
}

/* ──────────────────────────────────────────────────────────────────────────
   Helper display metadata
   ────────────────────────────────────────────────────────────────────────── */
function extractHashtagsFromCaption(caption: string): string[] {
  if (!caption) return [];
  const words = caption.split(/\s+/);
  const tags = words.filter((w) => w.trim().startsWith("#"));
  return tags.slice(0, 6);
}

function estimateReach() {
  return "12.4k est reach";
}

function suggestBestTime() {
  return "Tue 7:30 PM";
}

/* ──────────────────────────────────────────────────────────────────────────
   Component
   ────────────────────────────────────────────────────────────────────────── */
export default function ContentCreationHub({
  hasAccount,
  onAccountCreated,
}: ContentCreationHubProps) {
  // prompt input
  const [customPrompt, setCustomPrompt] = useState("");

  // loading the generation request
  const [generating, setGenerating] = useState(false);

  // posts feed
  const [myPosts, setMyPosts] = useState<PostItem[]>([]);
  const [nextId, setNextId] = useState(100);

  // view/UI state
  const [activeTab, setActiveTab] = useState("my-posts");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // dialogs
  const [showTrainDialog, setShowTrainDialog] = useState(false);
  const [showAccountDialog, setShowAccountDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  // pending action (schedule/post)
  const [pendingAction, setPendingAction] = useState<"schedule" | "post" | null>(
    null
  );
  const [pendingPostId, setPendingPostId] = useState<number | null>(null);

  const promptRef = useRef<HTMLTextAreaElement | null>(null);

  /* ────────────────────────────────────────────────────────────────────────
     Generate new post (optimistic skeleton → final)
     ──────────────────────────────────────────────────────────────────────── */
  const handleGenerateCustomPost = async () => {
    if (!customPrompt.trim()) {
      promptRef.current?.focus();
      return;
    }

    setGenerating(true);

    // optimistic "processing" card
    const optimisticId = nextId;
    const optimisticPost: PostItem = {
      id: optimisticId,
      image: "",
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
      // 1. request image(s)
      const imageResponse = await generateImageFromBackend(customPrompt);
      const firstImageUrl =
        Array.isArray(imageResponse?.image_urls) &&
        imageResponse.image_urls.length > 0
          ? imageResponse.image_urls[0]
          : "";

      if (!firstImageUrl) {
        throw new Error("No image URLs returned from backend");
      }

      // 2. request caption
      let finalCaption = `✨ ${customPrompt}`;
      try {
        const cap = await generateCaptionFromBackend(customPrompt);
        if (cap && typeof cap === "string") {
          finalCaption = cap;
        }
      } catch {
        // ignore, fallback caption is ok
      }

      // 3. finish card
      setMyPosts((prev) =>
        prev.map((p) =>
          p.id === optimisticId
            ? {
                ...p,
                image: firstImageUrl,
                caption: finalCaption,
                status: "ready",
                hashtags: extractHashtagsFromCaption(finalCaption),
                predictedReach: estimateReach(),
                bestTime: suggestBestTime(),
              }
            : p
        )
      );

      // clear prompt box
      setCustomPrompt("");
    } catch (err) {
      // mark as failed
      setMyPosts((prev) =>
        prev.map((p) =>
          p.id === optimisticId
            ? {
                ...p,
                status: "failed",
                caption: "Generation failed",
              }
            : p
        )
      );
    } finally {
      setGenerating(false);
    }
  };

  /* ────────────────────────────────────────────────────────────────────────
     Post actions
     ──────────────────────────────────────────────────────────────────────── */
  const handleScheduleClick = (postId: number) => {
    if (!hasAccount) {
      setPendingAction("schedule");
      setPendingPostId(postId);
      setShowAccountDialog(true);
    } else {
      // TODO hook scheduler
    }
  };

  const handlePostNowClick = (postId: number) => {
    if (!hasAccount) {
      setPendingAction("post");
      setPendingPostId(postId);
      setShowAccountDialog(true);
    } else {
      // TODO hook posting API
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
     Card Render Helpers
     ──────────────────────────────────────────────────────────────────────── */

  // IMAGE BLOCK for grid view (square style)
  const renderGridImageBlock = (post: PostItem) => {
    return (
      <div className="w-full aspect-square relative">
        {post.status === "ready" ? (
          <>
            <ImageWithFallback
              src={post.image}
              alt={`Post ${post.id}`}
              className="w-full h-full object-cover rounded-lg"
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
            />

            {/* overlay stats */}
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
          </>
        ) : post.status === "processing" ? (
          <GeneratingVisual label="Generating…" variant="square" />
        ) : (
          // failed
          <div className="w-full h-full relative">
            <ShimmerBox className="w-full h-full rounded-lg" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-md px-2 py-1 text-xs font-medium text-white">
                <span>Failed</span>
                <button
                  className="underline text-white"
                  onClick={() => {
                    const seed = post.caption?.replace(/^✨\s?/, "") || "";
                    setCustomPrompt(seed);
                    document
                      .querySelector("textarea")
                      ?.scrollIntoView({ behavior: "smooth" });
                    promptRef.current?.focus();
                  }}
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // IMAGE BLOCK for list view (thumbnail style left column)
  const renderListImageBlock = (post: PostItem) => {
    return (
      <div className="w-full max-w-[140px] aspect-square flex-shrink-0 relative rounded-lg overflow-hidden">
        {post.status === "ready" ? (
          <ImageWithFallback
            src={post.image}
            alt={`Post ${post.id}`}
            className="w-full h-full object-cover"
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
          />
        ) : post.status === "processing" ? (
          <GeneratingVisual label="Generating…" variant="thumb" />
        ) : (
          <div className="w-full h-full relative">
            <ShimmerBox className="w-full h-full rounded-lg" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-md px-2 py-1 text-[10px] font-medium text-white">
                <span>Failed</span>
                <button
                  className="underline text-white"
                  onClick={() => {
                    const seed = post.caption?.replace(/^✨\s?/, "") || "";
                    setCustomPrompt(seed);
                    document
                      .querySelector("textarea")
                      ?.scrollIntoView({ behavior: "smooth" });
                    promptRef.current?.focus();
                  }}
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // RIGHT SIDE CONTENT for list view
  const renderListTextBlock = (post: PostItem) => {
    return (
      <div className="flex flex-col justify-between flex-1 min-w-0">
        <div className="space-y-3">
          <p className="text-sm text-[#1E1E1E] break-words">{post.caption}</p>

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
        </div>

        <div className="flex gap-2 pt-4">
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
    );
  };

  // FULL CARD BODY for each post (grid vs list mode)
  const renderPostCard = (post: PostItem) => {
    if (viewMode === "list") {
      // Horizontal card layout
      return (
        <Card
          key={post.id}
          className="bg-white border-0 rounded-2xl overflow-hidden p-4 flex gap-4"
        >
          {/* left: thumb */}
          {renderListImageBlock(post)}

          {/* right: text/actions */}
          {renderListTextBlock(post)}
        </Card>
      );
    }

    // Grid card layout: image block then content below
    return (
      <Card
        key={post.id}
        className="bg-white border-0 rounded-2xl overflow-hidden flex flex-col"
      >
        {renderGridImageBlock(post)}

        <div className="p-4 space-y-4">
          <p className="text-sm text-[#1E1E1E] break-words">{post.caption}</p>

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
    );
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

      {/* Prompt box */}
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

      {/* Posts section */}
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

          {/* Toggle grid/list */}
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
          ) : viewMode === "grid" ? (
            /* GRID VIEW: 3-up cards */
            <div className="grid lg:grid-cols-3 gap-6">
              {myPosts.map((post) => renderPostCard(post))}
            </div>
          ) : (
            /* LIST VIEW: vertical stack of horizontal cards */
            <div className="space-y-4">
              {myPosts.map((post) => renderPostCard(post))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
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
