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
  Loader2,
  RefreshCw,
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import TrainAmbassadorDialog from "./TrainAmbassadorDialog";
import AccountCreationDialog from "./AccountCreationDialog";
import PaymentDialog from "./PaymentDialog";

/* ─────────────────────────────────────────
   CONSTANTS
   ───────────────────────────────────────── */
const CHARACTER_ID = "8cc016ad-c9c7-460e-a1d3-f348f8f8ae46";
const API_BASE = ""; // same-origin proxy to backend

/* ─────────────────────────────────────────
   TYPES
   ───────────────────────────────────────── */
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

/* ─────────────────────────────────────────
   LOADING + FAILED VISUALS
   ───────────────────────────────────────── */

/**
 * Trendy "AI cooking" block:
 * - Dark gradient
 * - Blurred glow ring pulse
 * - Centered spinner + label
 *
 * We use this in BOTH grid and list modes while status === "processing".
 */
function GeneratingBlock() {
  return (
    <div className="relative w-full h-full rounded-xl bg-gradient-to-br from-[#1a1a2f] via-[#2a235a] to-[#000000] flex items-center justify-center overflow-hidden">
      {/* soft animated glow ring */}
      <div className="absolute w-40 h-40 rounded-full bg-[radial-gradient(circle_at_center,rgba(100,100,180,0.5),transparent_70%)] blur-2xl animate-pulse opacity-60" />
      {/* spinner + text */}
      <div className="relative z-[2] flex flex-col items-center text-white text-xs font-medium">
        <div className="flex items-center gap-2 bg-black/50 rounded-full px-3 py-1 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.8)] backdrop-blur-md">
          <Loader2 className="w-4 h-4 animate-spin text-white" />
          <span>Generating…</span>
        </div>
        <div className="text-[10px] text-white/50 mt-2 tracking-wide uppercase">
          AI is creating your post
        </div>
      </div>

      {/* subtle noise overlay */}
      <div className="absolute inset-0 opacity-[0.15] mix-blend-screen pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.2) 0%, transparent 60%)",
        }}
      />
    </div>
  );
}

/**
 * Failure block:
 * Dark block with retry CTA.
 * No caption/hashtags/buttons shown in failed state.
 */
function FailedBlock({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="relative w-full h-full rounded-xl bg-gradient-to-br from-[#2b1a1a] via-[#3a1f1f] to-[#000] flex items-center justify-center overflow-hidden">
      <div className="relative z-[2] flex flex-col items-center text-white text-xs font-medium space-y-2">
        <div className="flex items-center gap-2 bg-black/60 rounded-full px-3 py-1 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.8)] backdrop-blur-md">
          <RefreshCw className="w-4 h-4 text-white" />
          <span>Generation failed</span>
        </div>
        <button
          className="text-[11px] text-white/80 underline hover:text-white"
          onClick={onRetry}
        >
          Try again
        </button>
      </div>
      <div className="absolute inset-0 opacity-[0.1] mix-blend-screen pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.3) 0%, transparent 60%)",
        }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────
   BACKEND CALLS
   ───────────────────────────────────────── */
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

/* ─────────────────────────────────────────
   POST HELPERS
   ───────────────────────────────────────── */
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

/* ─────────────────────────────────────────
   COMPONENT
   ───────────────────────────────────────── */
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

  const [pendingAction, setPendingAction] = useState<"schedule" | "post" | null>(
    null
  );
  const [pendingPostId, setPendingPostId] = useState<number | null>(null);

  const promptRef = useRef<HTMLTextAreaElement | null>(null);

  /* ─────────────────────────────────────────
     GENERATE POST
     ───────────────────────────────────────── */
  const handleGenerateCustomPost = async () => {
    if (!customPrompt.trim()) {
      promptRef.current?.focus();
      return;
    }

    setGenerating(true);

    // optimistic card: status "processing", minimal info only
    const optimisticId = nextId;
    const optimisticPost: PostItem = {
      id: optimisticId,
      image: "",
      caption: "", // don't show placeholder text now
      status: "processing",
      hashtags: [],
      predictedReach: "—",
      bestTime: "—",
    };

    setMyPosts((prev) => [optimisticPost, ...prev]);
    setNextId((n) => n + 1);
    setActiveTab("my-posts");

    try {
      // 1. get image urls
      const imageResponse = await generateImageFromBackend(customPrompt);
      const firstImageUrl =
        Array.isArray(imageResponse?.image_urls) &&
        imageResponse.image_urls.length > 0
          ? imageResponse.image_urls[0]
          : "";

      if (!firstImageUrl) {
        throw new Error("No image URLs returned from backend");
      }

      // 2. get caption
      let finalCaption = "";
      try {
        const cap = await generateCaptionFromBackend(customPrompt);
        if (cap && typeof cap === "string") {
          finalCaption = cap;
        }
      } catch {
        finalCaption = ""; // silent fail okay
      }

      // 3. finalize card
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

      setCustomPrompt("");
    } catch (err) {
      // failed state (still hide body, but show retry visual)
      setMyPosts((prev) =>
        prev.map((p) =>
          p.id === optimisticId
            ? {
                ...p,
                status: "failed",
                caption: "",
                hashtags: [],
              }
            : p
        )
      );
    } finally {
      setGenerating(false);
    }
  };

  /* ─────────────────────────────────────────
     ACTION BUTTON HANDLERS
     ───────────────────────────────────────── */
  const handleScheduleClick = (postId: number) => {
    if (!hasAccount) {
      setPendingAction("schedule");
      setPendingPostId(postId);
      setShowAccountDialog(true);
    } else {
      // TODO
    }
  };

  const handlePostNowClick = (postId: number) => {
    if (!hasAccount) {
      setPendingAction("post");
      setPendingPostId(postId);
      setShowAccountDialog(true);
    } else {
      // TODO
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

  /* ─────────────────────────────────────────
     RENDER HELPERS
     ───────────────────────────────────────── */

  /**
   * GRID IMAGE AREA (square card)
   * - processing: GeneratingBlock only
   * - failed: FailedBlock only
   * - ready: actual image + overlay stats
   */
  const GridVisual = (post: PostItem) => {
    const onRetry = () => {
      const seed = post.caption?.replace(/^✨\s?/, "") || "";
      setCustomPrompt(seed);
      document
        .querySelector("textarea")
        ?.scrollIntoView({ behavior: "smooth" });
      promptRef.current?.focus();
    };

    if (post.status === "processing") {
      return (
        <div className="w-full aspect-square relative">
          <GeneratingBlock />
        </div>
      );
    }

    if (post.status === "failed") {
      return (
        <div className="w-full aspect-square relative">
          <FailedBlock onRetry={onRetry} />
        </div>
      );
    }

    // ready
    return (
      <div className="w-full aspect-square relative">
        <ImageWithFallback
          src={post.image}
          alt={`Post ${post.id}`}
          className="w-full h-full object-cover rounded-xl"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />

        <div className="absolute bottom-3 left-3 right-3 flex gap-2">
          <div className="flex-1 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2">
            <Heart className="w-4 h-4 text-white" />
            <span className="text-white text-sm">~{post.predictedReach}</span>
          </div>
          <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#00D1B2]" />
          </div>
        </div>
      </div>
    );
  };

  /**
   * LIST IMAGE AREA (left thumb)
   * fixed 200x200, object-cover
   */
  const ListThumb = (post: PostItem) => {
    const onRetry = () => {
      const seed = post.caption?.replace(/^✨\s?/, "") || "";
      setCustomPrompt(seed);
      document
        .querySelector("textarea")
        ?.scrollIntoView({ behavior: "smooth" });
      promptRef.current?.focus();
    };

    if (post.status === "processing") {
      return (
        <div className="w-[200px] h-[200px] rounded-xl overflow-hidden flex-shrink-0">
          <GeneratingBlock />
        </div>
      );
    }

    if (post.status === "failed") {
      return (
        <div className="w-[200px] h-[200px] rounded-xl overflow-hidden flex-shrink-0">
          <FailedBlock onRetry={onRetry} />
        </div>
      );
    }

    // ready
    return (
      <div className="w-[200px] h-[200px] rounded-xl overflow-hidden flex-shrink-0 relative">
        <ImageWithFallback
          src={post.image}
          alt={`Post ${post.id}`}
          className="w-full h-full object-cover"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
        <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm rounded-md px-2 py-1 flex items-center gap-1">
          <Heart className="w-3 h-3 text-white" />
          <span className="text-[11px] text-white leading-none">
            ~{post.predictedReach}
          </span>
        </div>
      </div>
    );
  };

  /**
   * LIST RIGHT SIDE CONTENT
   * Only render caption / hashtags / buttons when READY.
   * When processing or failed: render nothing here.
   */
  const ListBody = (post: PostItem) => {
    if (post.status !== "ready") {
      return (
        <div className="flex-1 min-w-0 flex items-center justify-center text-xs text-gray-400">
          {post.status === "processing"
            ? "Generating post content…"
            : "Generation failed"}
        </div>
      );
    }

    return (
      <div className="flex flex-col justify-between flex-1 min-w-0">
        <div className="space-y-3">
          {post.caption && (
            <p className="text-sm text-[#1E1E1E] break-words">{post.caption}</p>
          )}

          {post.hashtags.length > 0 && (
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
          )}
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

  /**
   * GRID CARD
   * While processing/failed:
   *   - ONLY show the visual block (no caption/hashtags/buttons)
   * After ready:
   *   - show full body
   */
  const GridCard = (post: PostItem) => {
    const showBody = post.status === "ready";

    return (
      <Card
        key={post.id}
        className="bg-white border-0 rounded-2xl overflow-hidden flex flex-col"
      >
        <GridVisual post={post as PostItem} />

        {showBody && (
          <div className="p-4 space-y-4">
            {post.caption && (
              <p className="text-sm text-[#1E1E1E] break-words">
                {post.caption}
              </p>
            )}

            {post.hashtags.length > 0 && (
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
            )}

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
        )}
      </Card>
    );
  };

  /**
   * LIST CARD
   * Layout: left thumb (200x200) + right body.
   * Right body hides everything except status text until ready.
   */
  const ListCard = (post: PostItem) => {
    return (
      <Card
        key={post.id}
        className="bg-white border-0 rounded-2xl overflow-hidden p-4 flex flex-row gap-4"
      >
        {ListThumb(post)}
        {ListBody(post)}
      </Card>
    );
  };

  /* ─────────────────────────────────────────
     RENDER
     ───────────────────────────────────────── */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1">
          <h1 className="text-3xl text-[#1E1E1E] mb-2">Create Content</h1>
          <p className="text-gray-600">
            AI-powered content suggestions tailored to your audience
          </p>
        </div>
      </div>

      {/* Prompt section */}
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

          {/* view toggle */}
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
            <div className="grid lg:grid-cols-3 gap-6">
              {myPosts.map((post) => (
                <GridCard key={post.id} {...post} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {myPosts.map((post) => (
                <ListCard key={post.id} {...post} />
              ))}
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
